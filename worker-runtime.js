const OWNER_USER_ID = "e0a60777-62c2-4914-b241-31f9d52267c7";
const OWNER_EMAIL = "vijaynsunkara@gmail.com";
const APP_NAMES = {
  arthataxai: "ArthaTaxAI",
  marketpilot: "MarketPilot",
  "cinemagic-ai": "CineMagic AI",
  "life-guardian": "Life Guardian",
  "screen-share": "Screen Share",
  sanatana: "Sanatana",
  accessbridge: "AccessBridge",
  ultraforge: "UltraForge",
  dashforge: "DashForge",
  pulsedesk: "PulseDesk",
  pulseboard: "PulseBoard",
  dbvault: "VaultDB",
  securepilot: "SecurePilot",
  finvault: "FinVault",
};

const textEncoder = new TextEncoder();
const dayKey = () => new Date().toISOString().slice(0, 10);
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function visitorHash(visitor) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(visitor));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function trackEvent(request, env) {
  if (!env.DB) return new Response(null, { status: 204 });
  let payload;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return json({ error: "Invalid analytics event" }, 400);
  }

  const visitor = String(payload.visitor || "");
  if (!visitor || visitor.length > 120) return json({ error: "Invalid visitor" }, 400);
  const hash = await visitorHash(visitor);
  const day = dayKey();

  if (payload.type === "page_view") {
    await env.DB.prepare(`
      INSERT INTO daily_visitors (day, visitor_hash, first_seen, last_seen, page_views)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(day, visitor_hash) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        page_views = page_views + 1
    `).bind(day, hash).run();
    return new Response(null, { status: 204 });
  }

  const app = String(payload.app || "");
  if (payload.type === "app_click" && APP_NAMES[app]) {
    await env.DB.prepare(`
      INSERT INTO app_visits (day, app_slug, visitor_hash, first_seen, last_seen, visits)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(day, app_slug, visitor_hash) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        visits = visits + 1
    `).bind(day, app, hash).run();
    return new Response(null, { status: 204 });
  }

  return json({ error: "Unsupported analytics event" }, 400);
}

function currentOwner(request) {
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email")?.toLowerCase();
  return {
    signedIn: Boolean(userId || email),
    allowed: userId === OWNER_USER_ID || email === OWNER_EMAIL,
    email,
  };
}

async function loadReport(env, days) {
  const modifier = `-${days - 1} days`;
  const [daily, apps] = await Promise.all([
    env.DB.prepare(`
      SELECT day, COUNT(*) AS unique_visitors, COALESCE(SUM(page_views), 0) AS page_views
      FROM daily_visitors
      WHERE day >= date('now', ?)
      GROUP BY day
      ORDER BY day DESC
    `).bind(modifier).all(),
    env.DB.prepare(`
      SELECT app_slug, COUNT(DISTINCT visitor_hash) AS unique_visitors, COALESCE(SUM(visits), 0) AS launches
      FROM app_visits
      WHERE day >= date('now', ?)
      GROUP BY app_slug
      ORDER BY launches DESC, app_slug ASC
    `).bind(modifier).all(),
  ]);
  return { daily: daily.results || [], apps: apps.results || [] };
}

function ownerGate(request) {
  const owner = currentOwner(request);
  if (!owner.signedIn) {
    return new Response(renderSignIn(), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }
  if (!owner.allowed) {
    return new Response(renderDenied(owner.email), {
      status: 403,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return null;
}

function adminShell(content, title = "Audience intelligence") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} | Trivion Apps</title><style>
  :root{color-scheme:dark;--bg:#07111f;--surface:#0e1b2f;--line:rgba(148,190,230,.18);--text:#f7fbff;--muted:#9eb2c9;--cyan:#67e8f9;--blue:#60a5fa;--mint:#6ee7b7}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 82% 5%,rgba(37,99,235,.23),transparent 34%),radial-gradient(circle at 8% 35%,rgba(45,212,191,.12),transparent 30%),var(--bg);color:var(--text);font-family:"Segoe UI",sans-serif}.shell{width:min(1180px,calc(100% - 36px));margin:auto}.top{display:flex;align-items:center;justify-content:space-between;padding:28px 0;border-bottom:1px solid var(--line)}.brand{font-weight:800;font-size:1.25rem;letter-spacing:-.03em}.brand i{display:inline-block;width:11px;height:11px;margin-right:10px;border-radius:3px;transform:rotate(45deg);background:linear-gradient(135deg,var(--cyan),var(--mint));box-shadow:0 0 18px var(--cyan)}a{color:inherit}.top nav{display:flex;gap:10px}.button,.range a{display:inline-flex;align-items:center;justify-content:center;padding:10px 15px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--muted);background:rgba(255,255,255,.03)}main{padding:54px 0 80px}.eyebrow{color:var(--cyan);font-size:.78rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}h1{margin:13px 0 12px;font-size:clamp(2.3rem,6vw,5.1rem);line-height:.95;letter-spacing:-.065em;max-width:850px}.lede{color:var(--muted);font-size:1.05rem;line-height:1.7;max-width:720px}.range{display:flex;gap:8px;flex-wrap:wrap;margin:30px 0}.range a.active{color:#06121f;background:linear-gradient(135deg,var(--cyan),var(--mint));border-color:transparent;font-weight:800}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric,.panel{border:1px solid var(--line);background:linear-gradient(145deg,rgba(20,36,59,.9),rgba(9,20,36,.9));box-shadow:0 25px 70px rgba(0,0,0,.22);backdrop-filter:blur(20px)}.metric{padding:24px;border-radius:22px}.metric span{display:block;color:var(--muted);font-size:.82rem;margin-bottom:10px}.metric strong{font-size:2.2rem;letter-spacing:-.05em}.grids{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-top:18px}.panel{border-radius:26px;padding:24px;overflow:hidden}.panel-head{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:18px}.panel h2{margin:0;font-size:1.25rem}.panel small{color:var(--muted)}table{width:100%;border-collapse:collapse;font-size:.9rem}th,td{padding:13px 10px;text-align:left;border-bottom:1px solid var(--line)}th{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.12em}td.num{text-align:right;font-variant-numeric:tabular-nums}.bar{height:7px;margin-top:8px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden}.bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--blue),var(--cyan),var(--mint))}.empty{padding:34px 0;color:var(--muted);text-align:center}.privacy{margin-top:18px;color:var(--muted);font-size:.8rem}.gate{min-height:100vh;display:grid;place-items:center;padding:28px}.gate-card{width:min(520px,100%);padding:40px;border:1px solid var(--line);border-radius:28px;background:var(--surface);box-shadow:0 30px 90px rgba(0,0,0,.4)}.gate-card h1{font-size:2.4rem}.gate-card .button{margin-top:18px;color:#06121f;background:linear-gradient(135deg,var(--cyan),var(--mint));font-weight:800}@media(max-width:850px){.metrics{grid-template-columns:repeat(2,1fr)}.grids{grid-template-columns:1fr}}@media(max-width:520px){.metrics{grid-template-columns:1fr}.top{align-items:flex-start}.top nav{flex-direction:column}h1{font-size:2.8rem}.panel{padding:18px}th,td{padding:11px 6px;font-size:.78rem}}
  </style></head><body>${content}</body></html>`;
}

function renderSignIn() {
  return adminShell(`<main class="gate"><section class="gate-card"><div class="eyebrow">Owner report</div><h1>Private analytics.</h1><p class="lede">Sign in with the ChatGPT account that owns Trivion Apps to view visitor and product-launch reports.</p><a class="button" href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Sign in with ChatGPT</a></section></main>`, "Owner sign in");
}

function renderDenied(email) {
  return adminShell(`<main class="gate"><section class="gate-card"><div class="eyebrow">Restricted</div><h1>Owner access only.</h1><p class="lede">${email ? `The signed-in account ${escapeHtml(email)} is not the owner of this report.` : "This account cannot access the report."}</p><a class="button" href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">Use the owner account</a></section></main>`, "Access denied");
}

function renderAdmin(report, days) {
  const today = report.daily.find((row) => row.day === dayKey()) || { unique_visitors: 0, page_views: 0 };
  const totalVisitors = report.daily.reduce((sum, row) => sum + Number(row.unique_visitors || 0), 0);
  const totalViews = report.daily.reduce((sum, row) => sum + Number(row.page_views || 0), 0);
  const totalLaunches = report.apps.reduce((sum, row) => sum + Number(row.launches || 0), 0);
  const maxLaunches = Math.max(1, ...report.apps.map((row) => Number(row.launches || 0)));
  const dailyRows = report.daily.length ? report.daily.map((row) => `<tr><td>${escapeHtml(row.day)}</td><td class="num">${Number(row.unique_visitors).toLocaleString()}</td><td class="num">${Number(row.page_views).toLocaleString()}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No visits recorded yet.</td></tr>`;
  const appRows = report.apps.length ? report.apps.map((row) => `<tr><td><strong>${escapeHtml(APP_NAMES[row.app_slug] || row.app_slug)}</strong><div class="bar"><i style="width:${Math.max(3, Number(row.launches) / maxLaunches * 100)}%"></i></div></td><td class="num">${Number(row.unique_visitors).toLocaleString()}</td><td class="num">${Number(row.launches).toLocaleString()}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No product launches recorded yet.</td></tr>`;
  return adminShell(`<header class="top shell"><div class="brand"><i></i>Trivion Apps</div><nav><a class="button" href="/admin/export.csv?days=${days}">Export CSV</a><a class="button" href="/">View site</a><a class="button" href="/signout-with-chatgpt?return_to=%2F">Sign out</a></nav></header><main class="shell"><div class="eyebrow">Owner-only intelligence</div><h1>Know what earns attention.</h1><p class="lede">Privacy-friendly traffic and product-launch signals for the Trivion Apps ecosystem. Figures update as visitors use the public site.</p><div class="range">${[7, 30, 90].map((value) => `<a class="${days === value ? "active" : ""}" href="/admin?days=${value}">${value} days</a>`).join("")}</div><section class="metrics"><article class="metric"><span>Visitors today</span><strong>${Number(today.unique_visitors).toLocaleString()}</strong></article><article class="metric"><span>Page views today</span><strong>${Number(today.page_views).toLocaleString()}</strong></article><article class="metric"><span>Visitors in range</span><strong>${totalVisitors.toLocaleString()}</strong></article><article class="metric"><span>App launches in range</span><strong>${totalLaunches.toLocaleString()}</strong></article></section><section class="grids"><article class="panel"><div class="panel-head"><div><small>Traffic</small><h2>Daily audience</h2></div><small>${totalViews.toLocaleString()} page views</small></div><table><thead><tr><th>Date</th><th class="num">Visitors</th><th class="num">Views</th></tr></thead><tbody>${dailyRows}</tbody></table></article><article class="panel"><div class="panel-head"><div><small>Portfolio</small><h2>Product launches</h2></div><small>${days}-day view</small></div><table><thead><tr><th>Application</th><th class="num">People</th><th class="num">Launches</th></tr></thead><tbody>${appRows}</tbody></table></article></section><p class="privacy">Visitor counts use a one-way anonymous identifier. No raw IP addresses, visitor names, email addresses, or cross-site browsing profiles are stored.</p></main>`);
}

function renderCsv(report) {
  const rows = ["section,date_or_app,unique_visitors,page_views_or_launches"];
  for (const row of report.daily) rows.push(`daily,${row.day},${row.unique_visitors},${row.page_views}`);
  for (const row of report.apps) rows.push(`application,"${String(APP_NAMES[row.app_slug] || row.app_slug).replaceAll('"', '""')}",${row.unique_visitors},${row.launches}`);
  return rows.join("\n");
}

function assetResponse(pathname) {
  const encoded = assets[pathname];
  if (!encoded) return null;
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const type = pathname.endsWith(".css") ? "text/css; charset=utf-8"
    : pathname.endsWith(".js") ? "text/javascript; charset=utf-8"
      : pathname.endsWith(".webp") ? "image/webp"
        : pathname.endsWith(".png") ? "image/png"
          : pathname.endsWith(".woff2") ? "font/woff2"
            : pathname.endsWith(".woff") ? "font/woff"
              : "image/jpeg";
  return new Response(bytes, {
    headers: {
      "content-type": type,
      "cache-control": pathname === "/sw.js" ? "no-cache" : "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/analytics") {
      try {
        return await trackEvent(request, env);
      } catch (error) {
        console.error("analytics_write_failed", error);
        return new Response(null, { status: 204 });
      }
    }

    if (request.method === "GET" && ["/admin", "/admin/", "/admin/export.csv"].includes(url.pathname)) {
      const gate = ownerGate(request);
      if (gate) return gate;
      if (!env.DB) return new Response(adminShell(`<main class="gate"><section class="gate-card"><div class="eyebrow">Temporarily unavailable</div><h1>Analytics is not connected.</h1><p class="lede">The reporting database is unavailable. Please try again shortly.</p></section></main>`), { status: 503, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      const requestedDays = Number(url.searchParams.get("days"));
      const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
      const report = await loadReport(env, days);
      if (url.pathname === "/admin/export.csv") {
        return new Response(renderCsv(report), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="trivion-analytics-${dayKey()}.csv"`, "cache-control": "no-store" } });
      }
      return new Response(renderAdmin(report, days), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300, stale-while-revalidate=86400", "x-content-type-options": "nosniff" } });
    }

    if (request.method === "GET") {
      const asset = assetResponse(url.pathname);
      if (asset) return asset;
    }

    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
