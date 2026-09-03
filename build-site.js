import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const premiumCss = await readFile("premium.css", "utf8");
const favicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='8' y1='6' x2='56' y2='58'%3E%3Cstop offset='0%25' stop-color='%2338bdf8'/%3E%3Cstop offset='52%25' stop-color='%237c3aed'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M32 4 55 13v17c0 15-9.5 25-23 30C18.5 55 9 45 9 30V13L32 4Z' fill='%2307111f' stroke='url(%23g)' stroke-width='4'/%3E%3Cpath d='m36 14-15 21h11l-4 15 15-22H32l4-14Z' fill='white'/%3E%3C/svg%3E" />`;
const themeCss = `
body[data-theme="obsidian"]{--ink:#f5f7ff;--mint:#67e8f9;--paper:#090d16;--muted:#a5b0c4;--line:rgba(226,232,240,.16);--portfolio:#111827;--label:#67e8f9;--cta-a:#123248;--cta-b:#172554;--aura-1:rgba(34,211,238,.2);--aura-2:rgba(99,102,241,.16);--aura-3:rgba(255,255,255,.08);--glow-rgb:103,232,249}
body[data-theme="royal"]{--ink:#f8f7ff;--mint:#c4b5fd;--paper:#100d1c;--muted:#b8b0cc;--line:rgba(233,213,255,.17);--portfolio:#1c1630;--label:#c4b5fd;--cta-a:#38236f;--cta-b:#26154d;--aura-1:rgba(167,139,250,.22);--aura-2:rgba(244,114,182,.14);--aura-3:rgba(255,255,255,.08);--glow-rgb:196,181,253}
body[data-theme="solar"]{--ink:#17120a;--mint:#fbbf24;--paper:#fffaf0;--muted:#75664a;--line:rgba(71,49,11,.16);--portfolio:#fff1c7;--label:#a16207;--cta-a:#facc15;--cta-b:#ffedd5;--aura-1:rgba(251,191,36,.22);--aura-2:rgba(249,115,22,.12);--aura-3:rgba(255,255,255,.2);--glow-rgb:251,191,36}
`;
const rawHtml = await readFile("dist/index.html", "utf8");
const html = rawHtml
  .replace('<option value="mint">Mint</option>', "")
  .replace('<option value="executive">Executive</option>', '<option value="executive">Executive</option><option value="obsidian">Obsidian</option><option value="royal">Royal</option><option value="solar">Solar</option>')
  .replace("||'mint'", "||'executive'")
  .replace("theme==='mint'?'':theme", "theme")
  .replaceAll("assets/app-previews/vaultdb.png", "assets/app-previews/vaultdb.webp")
  .replace("</head>", `${favicon}<style>${premiumCss}${themeCss}</style></head>`);
const escapedHtml = JSON.stringify(html);
const assets = {};

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

const vaultDbWebp = await readFile("assets/app-previews/vaultdb.webp");
assets["/assets/app-previews/vaultdb.webp"] = vaultDbWebp.toString("base64");

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
        "content-type": url.pathname.endsWith(".webp") ? "image/webp" : url.pathname.endsWith(".png") ? "image/png" : "image/jpeg",
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
