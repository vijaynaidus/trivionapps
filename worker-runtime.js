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

async function anonymousHash(value) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cleanDimension(value, fallback = "Unknown", maxLength = 100) {
  const clean = String(value || "").trim().replace(/[\r\n\t]/g, " ").slice(0, maxLength);
  return clean || fallback;
}

function userAgentDetails(userAgent) {
  const ua = userAgent || "";
  const deviceType = /bot|crawler|spider|crawling/i.test(ua) ? "Bot"
    : /ipad|tablet|kindle|playbook|silk/i.test(ua) ? "Tablet"
      : /mobi|iphone|ipod|android/i.test(ua) ? "Mobile"
        : "Desktop";
  const browser = /edg\//i.test(ua) ? "Microsoft Edge"
    : /opr\//i.test(ua) ? "Opera"
      : /samsungbrowser/i.test(ua) ? "Samsung Internet"
        : /firefox|fxios/i.test(ua) ? "Firefox"
          : /chrome|crios/i.test(ua) ? "Chrome"
            : /safari/i.test(ua) ? "Safari"
              : "Other";
  const operatingSystem = /windows/i.test(ua) ? "Windows"
    : /iphone|ipad|ipod/i.test(ua) ? "iOS"
      : /android/i.test(ua) ? "Android"
        : /cros/i.test(ua) ? "Chrome OS"
          : /mac os|macintosh/i.test(ua) ? "macOS"
            : /linux/i.test(ua) ? "Linux"
              : "Other";
  return { deviceType, browser, operatingSystem };
}

function requestContext(request, payload) {
  const cf = request.cf || {};
  const agent = userAgentDetails(request.headers.get("user-agent"));
  return {
    ...agent,
    country: cleanDimension(cf.country || request.headers.get("cf-ipcountry")),
    region: cleanDimension(cf.region || cf.regionCode),
    referrerHost: cleanDimension(payload.referrer, "Direct"),
    campaignSource: cleanDimension(payload.utmSource, "None"),
    campaignMedium: cleanDimension(payload.utmMedium, "None"),
    campaignName: cleanDimension(payload.utmCampaign, "None"),
    entryPath: cleanDimension(payload.path, "/", 160),
    exitPath: cleanDimension(payload.exitPath || payload.path, "/", 160),
    isReturning: payload.returning ? 1 : 0,
  };
}

async function upsertSession(env, eventType, sessionHash, visitorHash, day, context) {
  const isPageView = eventType === "page_view";
  await env.DB.prepare(`
    INSERT INTO visit_sessions (
      session_hash, visitor_hash, day, started_at, last_seen, device_type, browser,
      operating_system, country, region, referrer_host, campaign_source,
      campaign_medium, campaign_name, entry_path, exit_path, page_views,
      app_launches, is_returning
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_hash) DO UPDATE SET
      last_seen = CURRENT_TIMESTAMP,
      exit_path = excluded.exit_path,
      page_views = page_views + excluded.page_views,
      app_launches = app_launches + excluded.app_launches,
      is_returning = MAX(is_returning, excluded.is_returning)
  `).bind(
    sessionHash, visitorHash, day, context.deviceType, context.browser,
    context.operatingSystem, context.country, context.region, context.referrerHost,
    context.campaignSource, context.campaignMedium, context.campaignName,
    context.entryPath, context.exitPath, isPageView ? 1 : 0, isPageView ? 0 : 1,
    context.isReturning,
  ).run();
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
  const session = String(payload.session || "");
  if (!visitor || visitor.length > 120 || !session || session.length > 120) {
    return json({ error: "Invalid analytics identity" }, 400);
  }
  const [hash, sessionHash] = await Promise.all([
    anonymousHash(visitor),
    anonymousHash(`${visitor}:${session}`),
  ]);
  const day = dayKey();
  const context = requestContext(request, payload);

  if (payload.type === "page_view") {
    await Promise.all([env.DB.prepare(`
      INSERT INTO daily_visitors (day, visitor_hash, first_seen, last_seen, page_views)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(day, visitor_hash) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        page_views = page_views + 1
    `).bind(day, hash).run(), upsertSession(env, payload.type, sessionHash, hash, day, context)]);
    return new Response(null, { status: 204 });
  }

  const app = String(payload.app || "");
  if (payload.type === "app_click" && APP_NAMES[app]) {
    await Promise.all([env.DB.prepare(`
      INSERT INTO app_visits (day, app_slug, visitor_hash, first_seen, last_seen, visits)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(day, app_slug, visitor_hash) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        visits = visits + 1
    `).bind(day, app, hash).run(), upsertSession(env, payload.type, sessionHash, hash, day, context)]);
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
  const dimensionQuery = (column, limit = 8) => env.DB.prepare(`
    SELECT ${column} AS label, COUNT(*) AS sessions, COUNT(DISTINCT visitor_hash) AS unique_visitors
    FROM visit_sessions
    WHERE day >= date('now', ?)
    GROUP BY ${column}
    ORDER BY sessions DESC, label ASC
    LIMIT ${limit}
  `).bind(modifier).all();
  const [daily, apps, summary, devices, browsers, operatingSystems, countries, regions, referrers, campaigns, entries, exits] = await Promise.all([
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
    env.DB.prepare(`
      SELECT COUNT(*) AS sessions,
        COUNT(DISTINCT visitor_hash) AS unique_visitors,
        COALESCE(SUM(is_returning), 0) AS returning_sessions,
        COALESCE(AVG(MAX(0, (julianday(last_seen) - julianday(started_at)) * 86400)), 0) AS avg_session_seconds,
        COALESCE(AVG(page_views), 0) AS pages_per_session,
        COALESCE(SUM(app_launches), 0) AS app_launches
      FROM visit_sessions
      WHERE day >= date('now', ?)
    `).bind(modifier).all(),
    dimensionQuery("device_type"),
    dimensionQuery("browser"),
    dimensionQuery("operating_system"),
    dimensionQuery("country", 10),
    dimensionQuery("region", 10),
    dimensionQuery("referrer_host", 10),
    env.DB.prepare(`
      SELECT campaign_source, campaign_medium, campaign_name, COUNT(*) AS sessions,
        COUNT(DISTINCT visitor_hash) AS unique_visitors
      FROM visit_sessions
      WHERE day >= date('now', ?)
        AND (campaign_source != 'None' OR campaign_medium != 'None' OR campaign_name != 'None')
      GROUP BY campaign_source, campaign_medium, campaign_name
      ORDER BY sessions DESC
      LIMIT 10
    `).bind(modifier).all(),
    dimensionQuery("entry_path", 8),
    dimensionQuery("exit_path", 8),
  ]);
  return {
    daily: daily.results || [],
    apps: apps.results || [],
    summary: summary.results?.[0] || {},
    devices: devices.results || [],
    browsers: browsers.results || [],
    operatingSystems: operatingSystems.results || [],
    countries: countries.results || [],
    regions: regions.results || [],
    referrers: referrers.results || [],
    campaigns: campaigns.results || [],
    entries: entries.results || [],
    exits: exits.results || [],
  };
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
  .metrics{grid-template-columns:repeat(3,1fr)}.wide{margin-top:18px}.rank{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:10px;background:rgba(103,232,249,.1);color:var(--cyan);font-weight:800}.app-name{display:flex;align-items:center;gap:11px}.spotlight{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 24px;margin:20px 0;border:1px solid rgba(103,232,249,.32);border-radius:22px;background:linear-gradient(110deg,rgba(37,99,235,.19),rgba(45,212,191,.1))}.spotlight strong{display:block;margin-top:5px;font-size:clamp(1.6rem,4vw,2.7rem);letter-spacing:-.05em}.spotlight .score{text-align:right;color:var(--cyan)}.panel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:18px}.panel-grid .panel{min-width:0}.panel-note{margin:3px 0 0;color:var(--muted);font-size:.8rem}.section-title{margin:38px 0 14px;font-size:1.5rem;letter-spacing:-.03em}.journey{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.campaign{font-size:.78rem;color:var(--muted)}.freshness{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font-size:.78rem}.freshness:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--mint);box-shadow:0 0 12px var(--mint)}@media(max-width:950px){.panel-grid{grid-template-columns:1fr 1fr}}@media(max-width:700px){.metrics,.panel-grid,.journey{grid-template-columns:1fr}.spotlight{align-items:flex-start;flex-direction:column}.spotlight .score{text-align:left}}
  </style></head><body>${content}</body></html>`;
}

function renderSignIn() {
  return adminShell(`<main class="gate"><section class="gate-card"><div class="eyebrow">Owner report</div><h1>Private analytics.</h1><p class="lede">Sign in with the ChatGPT account that owns Trivion Apps to view visitor and product-launch reports.</p><a class="button" href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Sign in with ChatGPT</a></section></main>`, "Owner sign in");
}

function renderDenied(email) {
  return adminShell(`<main class="gate"><section class="gate-card"><div class="eyebrow">Restricted</div><h1>Owner access only.</h1><p class="lede">${email ? `The signed-in account ${escapeHtml(email)} is not the owner of this report.` : "This account cannot access the report."}</p><a class="button" href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">Use the owner account</a></section></main>`, "Access denied");
}

function renderAdminLegacy(report, days) {
  const today = report.daily.find((row) => row.day === dayKey()) || { unique_visitors: 0, page_views: 0 };
  const totalVisitors = report.daily.reduce((sum, row) => sum + Number(row.unique_visitors || 0), 0);
  const totalViews = report.daily.reduce((sum, row) => sum + Number(row.page_views || 0), 0);
  const totalLaunches = report.apps.reduce((sum, row) => sum + Number(row.launches || 0), 0);
  const maxLaunches = Math.max(1, ...report.apps.map((row) => Number(row.launches || 0)));
  const dailyRows = report.daily.length ? report.daily.map((row) => `<tr><td>${escapeHtml(row.day)}</td><td class="num">${Number(row.unique_visitors).toLocaleString()}</td><td class="num">${Number(row.page_views).toLocaleString()}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No visits recorded yet.</td></tr>`;
  const appRows = report.apps.length ? report.apps.map((row) => `<tr><td><strong>${escapeHtml(APP_NAMES[row.app_slug] || row.app_slug)}</strong><div class="bar"><i style="width:${Math.max(3, Number(row.launches) / maxLaunches * 100)}%"></i></div></td><td class="num">${Number(row.unique_visitors).toLocaleString()}</td><td class="num">${Number(row.launches).toLocaleString()}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No product launches recorded yet.</td></tr>`;
  return adminShell(`<header class="top shell"><div class="brand"><i></i>Trivion Apps</div><nav><a class="button" href="/admin/export.csv?days=${days}">Export CSV</a><a class="button" href="/">View site</a><a class="button" href="/signout-with-chatgpt?return_to=%2F">Sign out</a></nav></header><main class="shell"><div class="eyebrow">Owner-only intelligence</div><h1>Know what earns attention.</h1><p class="lede">Privacy-friendly traffic and product-launch signals for the Trivion Apps ecosystem. Figures update as visitors use the public site.</p><div class="range">${[7, 30, 90].map((value) => `<a class="${days === value ? "active" : ""}" href="/admin?days=${value}">${value} days</a>`).join("")}</div><section class="metrics"><article class="metric"><span>Visitors today</span><strong>${Number(today.unique_visitors).toLocaleString()}</strong></article><article class="metric"><span>Page views today</span><strong>${Number(today.page_views).toLocaleString()}</strong></article><article class="metric"><span>Visitors in range</span><strong>${totalVisitors.toLocaleString()}</strong></article><article class="metric"><span>App launches in range</span><strong>${totalLaunches.toLocaleString()}</strong></article></section><section class="grids"><article class="panel"><div class="panel-head"><div><small>Traffic</small><h2>Daily audience</h2></div><small>${totalViews.toLocaleString()} page views</small></div><table><thead><tr><th>Date</th><th class="num">Visitors</th><th class="num">Views</th></tr></thead><tbody>${dailyRows}</tbody></table></article><article class="panel"><div class="panel-head"><div><small>Portfolio</small><h2>Product launches</h2></div><small>${days}-day view</small></div><table><thead><tr><th>Application</th><th class="num">People</th><th class="num">Launches</th></tr></thead><tbody>${appRows}</tbody></table></article></section><p class="privacy">Visitor counts use a one-way anonymous identifier. No raw IP addresses, visitor names, email addresses, or cross-site browsing profiles are stored.</p></main>`);
}

function number(value, digits = 0) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits });
}

function duration(value) {
  const seconds = Math.max(0, Math.round(Number(value || 0)));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function dimensionRows(rows) {
  if (!rows.length) return `<tr><td colspan="3" class="empty">Detailed activity will appear here.</td></tr>`;
  return rows.map((row) => `<tr><td><strong>${escapeHtml(row.label)}</strong></td><td class="num">${number(row.unique_visitors)}</td><td class="num">${number(row.sessions)}</td></tr>`).join("");
}

function dimensionPanel(title, note, rows) {
  return `<article class="panel"><div class="panel-head"><div><small>Audience detail</small><h2>${escapeHtml(title)}</h2><p class="panel-note">${escapeHtml(note)}</p></div></div><table><thead><tr><th>Segment</th><th class="num">People</th><th class="num">Sessions</th></tr></thead><tbody>${dimensionRows(rows)}</tbody></table></article>`;
}

function renderAdmin(report, days) {
  const today = report.daily.find((row) => row.day === dayKey()) || { unique_visitors: 0, page_views: 0 };
  const summary = report.summary || {};
  const totalViews = report.daily.reduce((sum, row) => sum + Number(row.page_views || 0), 0);
  const sessions = Number(summary.sessions || 0);
  const returningRate = sessions ? Number(summary.returning_sessions || 0) / sessions * 100 : 0;
  const appBySlug = new Map(report.apps.map((row) => [row.app_slug, row]));
  const rankedApps = Object.entries(APP_NAMES).map(([slug, name]) => {
    const row = appBySlug.get(slug) || {};
    return { slug, name, people: Number(row.unique_visitors || 0), launches: Number(row.launches || 0) };
  }).sort((a, b) => b.people - a.people || b.launches - a.launches || a.name.localeCompare(b.name));
  const totalLaunches = rankedApps.reduce((sum, app) => sum + app.launches, 0);
  const maxLaunches = Math.max(1, ...rankedApps.map((app) => app.launches));
  const leader = rankedApps[0];
  const dailyRows = report.daily.length ? report.daily.map((row) => `<tr><td>${escapeHtml(row.day)}</td><td class="num">${number(row.unique_visitors)}</td><td class="num">${number(row.page_views)}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No visits recorded yet.</td></tr>`;
  const appRows = rankedApps.map((app, index) => {
    const share = totalLaunches ? app.launches / totalLaunches * 100 : 0;
    return `<tr><td><div class="app-name"><span class="rank">${index + 1}</span><div><strong>${escapeHtml(app.name)}</strong><div class="bar"><i style="width:${app.launches ? Math.max(3, app.launches / maxLaunches * 100) : 0}%"></i></div></div></div></td><td class="num">${number(app.people)}</td><td class="num">${number(app.launches)}</td><td class="num">${number(share, 1)}%</td></tr>`;
  }).join("");
  const campaignRows = report.campaigns.length ? report.campaigns.map((row) => `<tr><td><strong>${escapeHtml(row.campaign_source)}</strong><div class="campaign">${escapeHtml(row.campaign_medium)} · ${escapeHtml(row.campaign_name)}</div></td><td class="num">${number(row.unique_visitors)}</td><td class="num">${number(row.sessions)}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">No campaign traffic recorded.</td></tr>`;
  const campaignPanel = `<article class="panel"><div class="panel-head"><div><small>Acquisition</small><h2>Campaigns</h2><p class="panel-note">UTM source, medium, and campaign.</p></div></div><table><thead><tr><th>Campaign</th><th class="num">People</th><th class="num">Sessions</th></tr></thead><tbody>${campaignRows}</tbody></table></article>`;
  const leaderText = leader.launches ? `${leader.name} leads with ${number(leader.people)} interested ${leader.people === 1 ? "person" : "people"} and ${number(leader.launches)} launches.` : "Interest ranking will activate after visitors begin opening applications.";

  return adminShell(`<header class="top shell"><div class="brand"><i></i>Trivion Apps Intelligence</div><nav><a class="button" href="/admin/export.csv?days=${days}">Export CSV</a><a class="button" href="/">View site</a><a class="button" href="/signout-with-chatgpt?return_to=%2F">Sign out</a></nav></header><main class="shell"><div class="eyebrow">Private owner dashboard</div><h1>Audience and product intelligence.</h1><p class="lede">Understand who is visiting, how they arrive, what technology they use, and which Trivion application earns the most interest.</p><div class="range">${[7, 30, 90].map((value) => `<a class="${days === value ? "active" : ""}" href="/admin?days=${value}">${value} days</a>`).join("")}<span class="freshness">Live first-party data</span></div><section class="metrics"><article class="metric"><span>Visitors today</span><strong>${number(today.unique_visitors)}</strong></article><article class="metric"><span>Page views today</span><strong>${number(today.page_views)}</strong></article><article class="metric"><span>Unique visitors</span><strong>${number(summary.unique_visitors)}</strong></article><article class="metric"><span>Sessions</span><strong>${number(sessions)}</strong></article><article class="metric"><span>Returning sessions</span><strong>${number(returningRate, 1)}%</strong></article><article class="metric"><span>Average session</span><strong>${duration(summary.avg_session_seconds)}</strong><span>${number(summary.pages_per_session, 1)} pages per session</span></article></section><section class="spotlight"><div><div class="eyebrow">Highest product interest</div><strong>${leader.launches ? escapeHtml(leader.name) : "Collecting activity"}</strong><p class="panel-note">${escapeHtml(leaderText)}</p></div><div class="score"><small>Portfolio launches</small><strong>${number(totalLaunches)}</strong></div></section><section class="panel wide"><div class="panel-head"><div><small>All 14 applications</small><h2>Product interest leaderboard</h2><p class="panel-note">Ranked by unique interested people, then repeat launches. Share is each app's portion of portfolio launches.</p></div><small>${days}-day view</small></div><table><thead><tr><th>Application</th><th class="num">People</th><th class="num">Launches</th><th class="num">Share</th></tr></thead><tbody>${appRows}</tbody></table></section><section class="grids"><article class="panel"><div class="panel-head"><div><small>Traffic</small><h2>Daily audience</h2></div><small>${number(totalViews)} page views</small></div><table><thead><tr><th>Date</th><th class="num">Visitors</th><th class="num">Views</th></tr></thead><tbody>${dailyRows}</tbody></table></article>${dimensionPanel("Referrals", "The websites and channels sending visitors.", report.referrers)}</section><h2 class="section-title">Audience profile</h2><section class="panel-grid">${dimensionPanel("Countries", "Approximate country from edge location.", report.countries)}${dimensionPanel("Regions", "Approximate regional distribution.", report.regions)}${dimensionPanel("Devices", "Desktop, mobile, tablet, or bot.", report.devices)}${dimensionPanel("Browsers", "Browser families used by visitors.", report.browsers)}${dimensionPanel("Operating systems", "Platform distribution across sessions.", report.operatingSystems)}${campaignPanel}</section><h2 class="section-title">Visitor journey</h2><section class="journey">${dimensionPanel("Entry pages", "First page recorded in each session.", report.entries)}${dimensionPanel("Exit destinations", "Last page or application launch recorded.", report.exits)}</section><p class="privacy">Detailed analytics starts with this release. Visitor and session identifiers are stored only as one-way hashes. Location is approximate; raw IP addresses, names, emails, full referral URLs, and personal query data are not retained.</p></main>`);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function renderCsv(report) {
  const rows = ["section,label,unique_visitors,sessions_or_views_or_launches,detail"];
  for (const row of report.daily) rows.push(["daily", row.day, row.unique_visitors, row.page_views, "page views"].map(csvCell).join(","));
  for (const [slug, name] of Object.entries(APP_NAMES)) {
    const row = report.apps.find((item) => item.app_slug === slug) || {};
    rows.push(["application", name, row.unique_visitors || 0, row.launches || 0, "launches"].map(csvCell).join(","));
  }
  for (const [section, values] of [["country", report.countries], ["region", report.regions], ["device", report.devices], ["browser", report.browsers], ["operating_system", report.operatingSystems], ["referrer", report.referrers], ["entry", report.entries], ["exit", report.exits]]) {
    for (const row of values) rows.push([section, row.label, row.unique_visitors, row.sessions, "sessions"].map(csvCell).join(","));
  }
  for (const row of report.campaigns) rows.push(["campaign", row.campaign_source, row.unique_visitors, row.sessions, `${row.campaign_medium} / ${row.campaign_name}`].map(csvCell).join(","));
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
