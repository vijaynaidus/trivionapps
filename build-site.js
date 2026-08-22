import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const escapedHtml = JSON.stringify(html);

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");

await writeFile(
  "dist/server/index.js",
  `const html = ${escapedHtml};

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

    return new Response("Not found", { status: 404 });
  }
};
`,
  "utf8",
);
