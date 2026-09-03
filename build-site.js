import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const premiumCss = await readFile("premium.css", "utf8");
const favicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%232563eb'/%3E%3Cstop offset='100%25' stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath d='M18 20h28l-9.5 12.5L37 44H27l.5-11.5z' fill='white'/%3E%3C/svg%3E" />`;
const html = (await readFile("dist/index.html", "utf8")).replace("</head>", `${favicon}<style>${premiumCss}</style></head>`);
const escapedHtml = JSON.stringify(html);
const assets = {};
const fileType = (pathname) => pathname.endsWith('.png') ? 'image/png' : 'image/jpeg';

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");

try {
  for (const file of await readdir("dist/assets")) {
    if (!file.endsWith(".jpg") && !file.endsWith(".png")) continue;
    const bytes = await readFile(`dist/assets/${file}`);
    const encoded = bytes.toString("base64");
    assets[`/assets/${file}`] = encoded;

    // The source HTML uses stable preview paths while Vite emits hashed files.
    const previewName = file.replace(/-[^/]+(?=\.(?:jpg|png)$)/, "");
    assets[`/assets/app-previews/${previewName}`] = encoded;
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
        "content-type": url.pathname.endsWith(".png") ? "image/png" : "image/jpeg",
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
