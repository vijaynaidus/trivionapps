import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const escapedHtml = JSON.stringify(html);
const assets = {};

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");

try {
  for (const file of await readdir("dist/assets")) {
    if (!file.endsWith(".jpg")) continue;
    const bytes = await readFile(`dist/assets/${file}`);
    assets[`/assets/${file}`] = bytes.toString("base64");
  }
} catch {
  // The site can still deploy without optional preview assets.
}

await writeFile(
  "dist/server/index.js",
  `const html = ${escapedHtml};
const assets = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=60"
        }
      });
    }

    if (assets[url.pathname]) {
      const bytes = Uint8Array.from(atob(assets[url.pathname]), character => character.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          "content-type": "image/jpeg",
          "cache-control": "public, max-age=31536000, immutable"
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
`,
  "utf8",
);
