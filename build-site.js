import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const premiumCss = await readFile("premium.css", "utf8");
const favicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='8' y1='6' x2='56' y2='58'%3E%3Cstop offset='0%25' stop-color='%2338bdf8'/%3E%3Cstop offset='52%25' stop-color='%237c3aed'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M32 4 55 13v17c0 15-9.5 25-23 30C18.5 55 9 45 9 30V13L32 4Z' fill='%2307111f' stroke='url(%23g)' stroke-width='4'/%3E%3Cpath d='m36 14-15 21h11l-4 15 15-22H32l4-14Z' fill='white'/%3E%3C/svg%3E" />`;
const themeCss = `
body[data-theme="obsidian"]{--ink:#07111f;--mint:#67e8f9;--paper:#0a1020;--muted:#a9b8ce;--line:rgba(203,213,225,.16);--portfolio:#111b30;--label:#67e8f9;--cta-a:#123248;--cta-b:#172554;--aura-1:rgba(34,211,238,.2);--aura-2:rgba(99,102,241,.16);--aura-3:rgba(255,255,255,.08);--glow-rgb:103,232,249}
body[data-theme="obsidian"] .intro h2,body[data-theme="obsidian"] .section-head h2,body[data-theme="obsidian"] .manifesto h2,body[data-theme="obsidian"] .app h3,body[data-theme="obsidian"] .feature-card h3,body[data-theme="obsidian"] .policy h3{color:#f8fbff}
body[data-theme="obsidian"] .feature-card,body[data-theme="obsidian"] .app,body[data-theme="obsidian"] .status-card,body[data-theme="obsidian"] .trust-card,body[data-theme="obsidian"] .policy article{background:linear-gradient(145deg,rgba(20,31,53,.96),rgba(10,18,34,.96));border-color:rgba(148,163,184,.2);color:#f8fbff}
body[data-theme="obsidian"] .feature-card p,body[data-theme="obsidian"] .app p,body[data-theme="obsidian"] .status-card span,body[data-theme="obsidian"] .trust-card span,body[data-theme="obsidian"] .policy p,body[data-theme="obsidian"] .intro-copy p{color:#a9b8ce}
body[data-theme="royal"]{--ink:#100b20;--mint:#d8b4fe;--paper:#120d24;--muted:#bdb2d2;--line:rgba(233,213,255,.18);--portfolio:#1d1538;--label:#d8b4fe;--cta-a:#4c1d95;--cta-b:#701a75;--aura-1:rgba(167,139,250,.22);--aura-2:rgba(244,114,182,.14);--aura-3:rgba(255,255,255,.08);--glow-rgb:216,180,254}
body[data-theme="royal"] .intro h2,body[data-theme="royal"] .section-head h2,body[data-theme="royal"] .manifesto h2,body[data-theme="royal"] .app h3,body[data-theme="royal"] .feature-card h3,body[data-theme="royal"] .policy h3{color:#fbf8ff}
body[data-theme="royal"] .feature-card,body[data-theme="royal"] .app,body[data-theme="royal"] .status-card,body[data-theme="royal"] .trust-card,body[data-theme="royal"] .policy article{background:linear-gradient(145deg,rgba(31,22,58,.97),rgba(15,10,32,.97));border-color:rgba(196,181,253,.22);color:#fbf8ff}
body[data-theme="royal"] .feature-card p,body[data-theme="royal"] .app p,body[data-theme="royal"] .status-card span,body[data-theme="royal"] .trust-card span,body[data-theme="royal"] .policy p,body[data-theme="royal"] .intro-copy p{color:#bdb2d2}
body[data-theme="solar"]{--ink:#17120a;--mint:#fbbf24;--paper:#fffaf0;--muted:#75664a;--line:rgba(71,49,11,.16);--portfolio:#fff1c7;--label:#a16207;--cta-a:#facc15;--cta-b:#ffedd5;--aura-1:rgba(251,191,36,.22);--aura-2:rgba(249,115,22,.12);--aura-3:rgba(255,255,255,.2);--glow-rgb:251,191,36}
.theme-picker{position:relative;z-index:30}.theme-picker-button{display:flex;align-items:center;gap:10px;min-width:142px;padding:12px 15px;border:1px solid rgba(255,255,255,.26);border-radius:999px;background:rgba(7,17,31,.44);color:#fff;font:700 .82rem "Manrope";cursor:pointer;backdrop-filter:blur(18px);box-shadow:0 12px 30px rgba(0,0,0,.12)}.theme-picker-button:hover,.theme-picker-button[aria-expanded="true"]{border-color:var(--mint);background:rgba(7,17,31,.68)}.theme-picker-chevron{margin-left:auto;width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);transition:transform .2s}.theme-picker-button[aria-expanded="true"] .theme-picker-chevron{transform:rotate(225deg) translate(-1px,-1px)}.theme-picker-menu{position:absolute;right:0;top:calc(100% + 10px);display:grid;gap:5px;width:190px;padding:7px;border:1px solid rgba(148,163,184,.25);border-radius:18px;background:rgba(9,16,31,.94);box-shadow:0 20px 50px rgba(0,0,0,.28);backdrop-filter:blur(22px)}.theme-picker-menu[hidden]{display:none}.theme-option{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;border-radius:12px;background:transparent;color:#dbeafe;text-align:left;font:600 .78rem "Manrope";cursor:pointer}.theme-option:hover,.theme-option[aria-checked="true"]{background:rgba(103,232,249,.13);color:#fff}.theme-swatch{width:18px;height:18px;border:2px solid rgba(255,255,255,.46);border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,.04)}.theme-swatch.executive{background:linear-gradient(135deg,#38bdf8,#2563eb)}.theme-swatch.obsidian{background:linear-gradient(135deg,#0f172a,#67e8f9)}.theme-swatch.royal{background:linear-gradient(135deg,#7c3aed,#f472b6)}.theme-swatch.solar{background:linear-gradient(135deg,#fbbf24,#f97316)}
`;
const rawHtml = await readFile("dist/index.html", "utf8");
const html = rawHtml
  .replace('<select class="theme-select" aria-label="Choose site theme"><option value="mint">Mint</option><option value="executive">Executive</option><option value="luxury">Luxury</option><option value="crimson">Crimson</option></select>', '<div class="theme-picker"><button class="theme-picker-button" type="button" aria-haspopup="true" aria-expanded="false"><span class="theme-swatch executive"></span><span data-theme-label>Executive</span><span class="theme-picker-chevron" aria-hidden="true"></span></button><div class="theme-picker-menu" role="radiogroup" aria-label="Choose site theme" hidden><button class="theme-option" type="button" role="radio" data-theme-option="executive" aria-checked="true"><span class="theme-swatch executive"></span>Executive</button><button class="theme-option" type="button" role="radio" data-theme-option="obsidian" aria-checked="false"><span class="theme-swatch obsidian"></span>Obsidian</button><button class="theme-option" type="button" role="radio" data-theme-option="royal" aria-checked="false"><span class="theme-swatch royal"></span>Royal</button><button class="theme-option" type="button" role="radio" data-theme-option="solar" aria-checked="false"><span class="theme-swatch solar"></span>Solar</button></div></div>')
  .replace("||'mint'", "||'executive'")
  .replace("theme==='mint'?'':theme", "theme")
  .replaceAll("assets/app-previews/vaultdb.png", "assets/app-previews/vaultdb.webp")
  .replace("const themeSelect=document.querySelector('.theme-select'),themeMeta=document.querySelector('meta[name=\"theme-color\"]'),savedTheme=localStorage.getItem('trivion-theme')||'executive';const applyTheme=theme=>{document.body.dataset.theme=theme;themeSelect.value=theme;localStorage.setItem('trivion-theme',theme);const color=getComputedStyle(document.body).getPropertyValue('--ink').trim();themeMeta?.setAttribute('content',color)};if(themeSelect){applyTheme(savedTheme);themeSelect.addEventListener('change',()=>applyTheme(themeSelect.value))}", "const themePicker=document.querySelector('.theme-picker'),themeButton=themePicker?.querySelector('.theme-picker-button'),themeMenu=themePicker?.querySelector('.theme-picker-menu'),themeLabel=themePicker?.querySelector('[data-theme-label]'),themeMeta=document.querySelector('meta[name=\"theme-color\"]'),savedTheme=localStorage.getItem('trivion-theme')||'executive';const applyTheme=theme=>{document.body.dataset.theme=theme;const option=themePicker?.querySelector('[data-theme-option=\"'+theme+'\"]');if(themeLabel&&option)themeLabel.textContent=option.textContent.trim();if(themeButton&&option){themeButton.querySelector('.theme-swatch').className='theme-swatch '+theme;themeButton.setAttribute('aria-label','Theme: '+theme);themePicker.querySelectorAll('[data-theme-option]').forEach(item=>item.setAttribute('aria-checked',String(item===option)))}localStorage.setItem('trivion-theme',theme);const color=getComputedStyle(document.body).getPropertyValue('--paper').trim();themeMeta?.setAttribute('content',color)};if(themePicker&&themeButton&&themeMenu){applyTheme(savedTheme);themeButton.addEventListener('click',()=>{const open=themeButton.getAttribute('aria-expanded')==='true';themeButton.setAttribute('aria-expanded',String(!open));themeMenu.hidden=open});themePicker.querySelectorAll('[data-theme-option]').forEach(option=>option.addEventListener('click',()=>{applyTheme(option.dataset.themeOption);themeMenu.hidden=true;themeButton.setAttribute('aria-expanded','false')}));document.addEventListener('click',event=>{if(!themePicker.contains(event.target)){themeMenu.hidden=true;themeButton.setAttribute('aria-expanded','false')}})}")
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
