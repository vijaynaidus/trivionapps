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
    language: cleanDimension(payload.language),
    referrerHost: cleanDimension(payload.referrer, "Direct"),
    campaignSource: cleanDimension(payload.utmSource, "None"),
    campaignMedium: cleanDimension(payload.utmMedium, "None"),
    campaignName: cleanDimension(payload.utmCampaign, "None"),
    campaignContent: cleanDimension(payload.utmContent, "None"),
    campaignTerm: cleanDimension(payload.utmTerm, "None"),
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
      operating_system, country, region, language, referrer_host, campaign_source,
      campaign_medium, campaign_name, campaign_content, campaign_term,
      entry_path, exit_path, page_views,
      app_launches, is_returning
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_hash) DO UPDATE SET
      last_seen = CURRENT_TIMESTAMP,
      exit_path = excluded.exit_path,
      page_views = page_views + excluded.page_views,
      app_launches = app_launches + excluded.app_launches,
      is_returning = MAX(is_returning, excluded.is_returning)
  `).bind(
    sessionHash, visitorHash, day, context.deviceType, context.browser,
    context.operatingSystem, context.country, context.region, context.language, context.referrerHost,
    context.campaignSource, context.campaignMedium, context.campaignName,
    context.campaignContent, context.campaignTerm, context.entryPath, context.exitPath,
    isPageView ? 1 : 0, isPageView ? 0 : 1,
    context.isReturning,
  ).run();
}

async function incrementCounter(env, metric) {
  await env.DB.prepare(`
    INSERT INTO daily_counters (day, metric, value) VALUES (?, ?, 1)
    ON CONFLICT(day, metric) DO UPDATE SET value = value + 1
  `).bind(dayKey(), metric).run();
}

async function maintainAnalytics(env) {
  if (!env.DB) return;
  const claim = await env.DB.prepare(`INSERT OR IGNORE INTO daily_counters (day, metric, value) VALUES (?, 'maintenance', 1)`).bind(dayKey()).run();
  if (!claim.meta?.changes) return;
  await Promise.all([
    env.DB.prepare(`DELETE FROM event_facts WHERE day < date('now', '-395 days')`).run(),
    env.DB.prepare(`DELETE FROM performance_samples WHERE day < date('now', '-395 days')`).run(),
    env.DB.prepare(`DELETE FROM visit_sessions WHERE day < date('now', '-395 days')`).run(),
    env.DB.prepare(`DELETE FROM admin_access_logs WHERE day < date('now', '-395 days')`).run(),
    env.DB.prepare(`DELETE FROM daily_counters WHERE day < date('now', '-395 days')`).run(),
  ]);
}

async function touchSession(env, sessionHash, exitPath) {
  await env.DB.prepare(`
    UPDATE visit_sessions SET last_seen = CURRENT_TIMESTAMP, exit_path = ? WHERE session_hash = ?
  `).bind(cleanDimension(exitPath, "/", 160), sessionHash).run();
}

async function storeEvent(env, payload, eventType, visitorHash, sessionHash, day) {
  const eventId = String(payload.eventId || "");
  if (!eventId || eventId.length > 120) return;
  const eventHash = await anonymousHash(`${sessionHash}:${eventId}`);
  const app = APP_NAMES[payload.app] ? payload.app : "None";
  const numericValue = Math.max(-10000000, Math.min(10000000, Number(payload.value) || 0));
  await env.DB.prepare(`
    INSERT OR IGNORE INTO event_facts (
      event_hash, visitor_hash, session_hash, day, created_at, event_type,
      label, app_slug, path, value
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
  `).bind(
    eventHash, visitorHash, sessionHash, day, eventType,
    cleanDimension(payload.label || payload.app, "Unlabelled"), app,
    cleanDimension(payload.path, "/", 160), numericValue,
  ).run();
}

async function storePerformance(env, payload, visitorHash, sessionHash, day, context) {
  const metric = (value, maximum) => Math.max(0, Math.min(maximum, Number(value) || 0));
  await env.DB.prepare(`
    INSERT INTO performance_samples (
      session_hash, visitor_hash, day, recorded_at, lcp_ms, inp_ms, cls,
      load_ms, connection_type, viewport, device_type, country
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_hash) DO UPDATE SET
      recorded_at = CURRENT_TIMESTAMP,
      lcp_ms = MAX(lcp_ms, excluded.lcp_ms),
      inp_ms = MAX(inp_ms, excluded.inp_ms),
      cls = MAX(cls, excluded.cls),
      load_ms = MAX(load_ms, excluded.load_ms),
      connection_type = excluded.connection_type,
      viewport = excluded.viewport
  `).bind(
    sessionHash, visitorHash, day, metric(payload.lcp, 120000),
    metric(payload.inp, 120000), metric(payload.cls, 100), metric(payload.loadMs, 120000),
    cleanDimension(payload.connection), cleanDimension(payload.viewport),
    context.deviceType, context.country,
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

  if (payload.type === "consent_choice" && ["opt_in", "opt_out"].includes(payload.choice)) {
    await incrementCounter(env, payload.choice);
    return new Response(null, { status: 204 });
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
    `).bind(day, app, hash).run(), upsertSession(env, payload.type, sessionHash, hash, day, context), storeEvent(env, { ...payload, label: app }, "app_click", hash, sessionHash, day)]);
    return new Response(null, { status: 204 });
  }

  if (payload.type === "session_ping") {
    await touchSession(env, sessionHash, payload.exitPath || payload.path);
    return new Response(null, { status: 204 });
  }

  if (payload.type === "performance") {
    await Promise.all([
      storePerformance(env, payload, hash, sessionHash, day, context),
      touchSession(env, sessionHash, payload.path),
    ]);
    return new Response(null, { status: 204 });
  }

  const interactionTypes = new Set([
    "app_impression", "scroll_depth", "section_time", "contact_start",
    "contact_submit", "email_click", "navigation_click", "javascript_error",
    "resource_error",
  ]);
  if (payload.type === "interaction" && interactionTypes.has(payload.eventType)) {
    await Promise.all([
      storeEvent(env, payload, payload.eventType, hash, sessionHash, day),
      touchSession(env, sessionHash, payload.path),
    ]);
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
  const previousStart = `-${days * 2 - 1} days`;
  const previousEnd = `-${days} days`;
  const [periods, live, hourly, weekdays, frequency, cohorts, eventSummary, sections, navigation, appSignals, transitions, performance, performanceDevices, consent, adminAccess, scrollDepth, languages, connections, viewports, appCountries, appDevices, appSources, retention, appTrends, appWindows, appPositions, appTiming, exploration] = await Promise.all([
    env.DB.prepare(`
      SELECT
        COUNT(DISTINCT CASE WHEN day >= date('now', ?) THEN visitor_hash END) AS current_visitors,
        COUNT(DISTINCT CASE WHEN day >= date('now', ?) THEN session_hash END) AS current_sessions,
        COUNT(DISTINCT CASE WHEN day BETWEEN date('now', ?) AND date('now', ?) THEN visitor_hash END) AS previous_visitors,
        COUNT(DISTINCT CASE WHEN day BETWEEN date('now', ?) AND date('now', ?) THEN session_hash END) AS previous_sessions
      FROM visit_sessions
    `).bind(modifier, modifier, previousStart, previousEnd, previousStart, previousEnd).all(),
    env.DB.prepare(`SELECT COUNT(DISTINCT visitor_hash) AS visitors, COUNT(*) AS sessions FROM visit_sessions WHERE last_seen >= datetime('now', '-5 minutes')`).all(),
    env.DB.prepare(`SELECT strftime('%H', started_at) AS label, COUNT(*) AS sessions, COUNT(DISTINCT visitor_hash) AS unique_visitors FROM visit_sessions WHERE day >= date('now', ?) GROUP BY label ORDER BY label`).bind(modifier).all(),
    env.DB.prepare(`SELECT CASE strftime('%w', started_at) WHEN '0' THEN 'Sunday' WHEN '1' THEN 'Monday' WHEN '2' THEN 'Tuesday' WHEN '3' THEN 'Wednesday' WHEN '4' THEN 'Thursday' WHEN '5' THEN 'Friday' ELSE 'Saturday' END AS label, COUNT(*) AS sessions, COUNT(DISTINCT visitor_hash) AS unique_visitors FROM visit_sessions WHERE day >= date('now', ?) GROUP BY strftime('%w', started_at) ORDER BY sessions DESC`).bind(modifier).all(),
    env.DB.prepare(`SELECT CASE WHEN visit_days = 1 THEN 'One-time' WHEN visit_days BETWEEN 2 AND 3 THEN 'Returning' WHEN visit_days BETWEEN 4 AND 7 THEN 'Loyal' ELSE 'Highly engaged' END AS label, COUNT(*) AS unique_visitors, SUM(session_count) AS sessions FROM (SELECT visitor_hash, COUNT(DISTINCT day) AS visit_days, COUNT(*) AS session_count FROM visit_sessions GROUP BY visitor_hash) GROUP BY label ORDER BY unique_visitors DESC`).all(),
    env.DB.prepare(`SELECT strftime('%Y-W%W', first_day) AS label, COUNT(*) AS unique_visitors, SUM(returned) AS sessions FROM (SELECT visitor_hash, MIN(day) AS first_day, CASE WHEN COUNT(DISTINCT day) > 1 THEN 1 ELSE 0 END AS returned FROM visit_sessions GROUP BY visitor_hash) GROUP BY label ORDER BY label DESC LIMIT 12`).all(),
    env.DB.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'app_impression' THEN session_hash END) AS app_view_sessions,
      COUNT(DISTINCT CASE WHEN event_type = 'app_click' THEN session_hash END) AS app_launch_sessions,
      COUNT(DISTINCT CASE WHEN event_type = 'contact_start' THEN session_hash END) AS contact_starts,
      COUNT(DISTINCT CASE WHEN event_type = 'contact_submit' THEN session_hash END) AS contact_submits,
      COUNT(DISTINCT CASE WHEN event_type = 'email_click' THEN session_hash END) AS email_clicks,
      COUNT(CASE WHEN event_type = 'javascript_error' THEN 1 END) AS javascript_errors,
      COUNT(CASE WHEN event_type = 'resource_error' THEN 1 END) AS resource_errors
      FROM event_facts WHERE day >= date('now', ?)
    `).bind(modifier).all(),
    env.DB.prepare(`SELECT label, COUNT(DISTINCT visitor_hash) AS unique_visitors, ROUND(SUM(value), 1) AS sessions FROM event_facts WHERE day >= date('now', ?) AND event_type = 'section_time' GROUP BY label ORDER BY SUM(value) DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT label, COUNT(DISTINCT visitor_hash) AS unique_visitors, COUNT(*) AS sessions FROM event_facts WHERE day >= date('now', ?) AND event_type = 'navigation_click' GROUP BY label ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT app_slug,
      COUNT(DISTINCT CASE WHEN event_type = 'app_impression' THEN visitor_hash END) AS impressions,
      COUNT(DISTINCT CASE WHEN event_type = 'app_click' THEN visitor_hash END) AS interested_people,
      COUNT(CASE WHEN event_type = 'app_click' THEN 1 END) AS clicks
      FROM event_facts WHERE day >= date('now', ?) AND app_slug != 'None'
      GROUP BY app_slug
    `).bind(modifier).all(),
    env.DB.prepare(`SELECT current_app || ' → ' || next_app AS label, COUNT(DISTINCT session_hash) AS unique_visitors, COUNT(*) AS sessions FROM (SELECT session_hash, app_slug AS current_app, LEAD(app_slug) OVER (PARTITION BY session_hash ORDER BY created_at, event_hash) AS next_app FROM event_facts WHERE day >= date('now', ?) AND event_type = 'app_click') WHERE next_app IS NOT NULL AND current_app != next_app GROUP BY current_app, next_app ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT COUNT(*) AS samples, ROUND(AVG(lcp_ms), 0) AS avg_lcp, ROUND(AVG(inp_ms), 0) AS avg_inp, ROUND(AVG(cls), 3) AS avg_cls, ROUND(AVG(load_ms), 0) AS avg_load, ROUND(AVG(CASE WHEN lcp_ms > 0 AND lcp_ms <= 2500 THEN 100.0 ELSE 0 END), 1) AS good_lcp, ROUND(AVG(CASE WHEN inp_ms > 0 AND inp_ms <= 200 THEN 100.0 ELSE 0 END), 1) AS good_inp, ROUND(AVG(CASE WHEN cls <= 0.1 THEN 100.0 ELSE 0 END), 1) AS good_cls FROM performance_samples WHERE day >= date('now', ?)`).bind(modifier).all(),
    env.DB.prepare(`SELECT device_type AS label, COUNT(*) AS sessions, ROUND(AVG(load_ms), 0) AS unique_visitors FROM performance_samples WHERE day >= date('now', ?) GROUP BY device_type ORDER BY sessions DESC`).bind(modifier).all(),
    env.DB.prepare(`SELECT metric AS label, SUM(value) AS sessions, 0 AS unique_visitors FROM daily_counters WHERE day >= date('now', ?) AND metric IN ('opt_in', 'opt_out') GROUP BY metric ORDER BY sessions DESC`).bind(modifier).all(),
    env.DB.prepare(`SELECT outcome AS label, COUNT(*) AS sessions, COUNT(DISTINCT account_hash) AS unique_visitors FROM admin_access_logs WHERE day >= date('now', ?) GROUP BY outcome ORDER BY sessions DESC`).bind(modifier).all(),
    env.DB.prepare(`SELECT label, COUNT(DISTINCT visitor_hash) AS unique_visitors, COUNT(DISTINCT session_hash) AS sessions FROM event_facts WHERE day >= date('now', ?) AND event_type = 'scroll_depth' GROUP BY label ORDER BY CAST(REPLACE(label, '%', '') AS INTEGER)`).bind(modifier).all(),
    dimensionQuery("language", 10),
    env.DB.prepare(`SELECT connection_type AS label, COUNT(*) AS sessions, COUNT(DISTINCT visitor_hash) AS unique_visitors FROM performance_samples WHERE day >= date('now', ?) GROUP BY connection_type ORDER BY sessions DESC LIMIT 8`).bind(modifier).all(),
    env.DB.prepare(`SELECT viewport AS label, COUNT(*) AS sessions, COUNT(DISTINCT visitor_hash) AS unique_visitors FROM performance_samples WHERE day >= date('now', ?) GROUP BY viewport ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT e.app_slug || ' · ' || s.country AS label, COUNT(DISTINCT e.visitor_hash) AS unique_visitors, COUNT(*) AS sessions FROM event_facts e JOIN visit_sessions s ON s.session_hash = e.session_hash WHERE e.day >= date('now', ?) AND e.event_type = 'app_click' GROUP BY e.app_slug, s.country ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT e.app_slug || ' · ' || s.device_type AS label, COUNT(DISTINCT e.visitor_hash) AS unique_visitors, COUNT(*) AS sessions FROM event_facts e JOIN visit_sessions s ON s.session_hash = e.session_hash WHERE e.day >= date('now', ?) AND e.event_type = 'app_click' GROUP BY e.app_slug, s.device_type ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT e.app_slug || ' · ' || s.referrer_host AS label, COUNT(DISTINCT e.visitor_hash) AS unique_visitors, COUNT(*) AS sessions FROM event_facts e JOIN visit_sessions s ON s.session_hash = e.session_hash WHERE e.day >= date('now', ?) AND e.event_type = 'app_click' GROUP BY e.app_slug, s.referrer_host ORDER BY sessions DESC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`WITH firsts AS (SELECT visitor_hash, MIN(day) AS first_day FROM visit_sessions GROUP BY visitor_hash) SELECT COUNT(*) AS cohort_size, SUM(CASE WHEN EXISTS (SELECT 1 FROM visit_sessions s WHERE s.visitor_hash = firsts.visitor_hash AND s.day > firsts.first_day AND s.day <= date(firsts.first_day, '+7 days')) THEN 1 ELSE 0 END) AS returned_7d, SUM(CASE WHEN EXISTS (SELECT 1 FROM visit_sessions s WHERE s.visitor_hash = firsts.visitor_hash AND s.day > firsts.first_day AND s.day <= date(firsts.first_day, '+30 days')) THEN 1 ELSE 0 END) AS returned_30d FROM firsts WHERE first_day >= date('now', ?)`).bind(modifier).all(),
    env.DB.prepare(`SELECT app_slug, SUM(CASE WHEN day >= date('now', ?) THEN visits ELSE 0 END) AS current_launches, SUM(CASE WHEN day BETWEEN date('now', ?) AND date('now', ?) THEN visits ELSE 0 END) AS previous_launches FROM app_visits WHERE day >= date('now', ?) GROUP BY app_slug`).bind(modifier, previousStart, previousEnd, previousStart).all(),
    env.DB.prepare(`SELECT app_slug, SUM(CASE WHEN day = date('now') THEN visits ELSE 0 END) AS today, SUM(CASE WHEN day >= date('now', '-6 days') THEN visits ELSE 0 END) AS week, SUM(CASE WHEN day >= date('now', '-29 days') THEN visits ELSE 0 END) AS month FROM app_visits WHERE day >= date('now', '-29 days') GROUP BY app_slug`).all(),
    env.DB.prepare(`SELECT CASE position WHEN 1 THEN 'First · ' ELSE 'Second · ' END || app_slug AS label, COUNT(DISTINCT visitor_hash) AS unique_visitors, COUNT(*) AS sessions FROM (SELECT visitor_hash, session_hash, app_slug, ROW_NUMBER() OVER (PARTITION BY session_hash ORDER BY created_at, event_hash) AS position FROM event_facts WHERE day >= date('now', ?) AND event_type = 'app_click') WHERE position <= 2 GROUP BY position, app_slug ORDER BY position, sessions DESC LIMIT 12`).bind(modifier).all(),
    env.DB.prepare(`SELECT e.app_slug AS label, COUNT(DISTINCT e.visitor_hash) AS unique_visitors, ROUND(AVG(MAX(0, (julianday(e.created_at) - julianday(s.started_at)) * 86400)), 1) AS sessions FROM event_facts e JOIN visit_sessions s ON s.session_hash = e.session_hash WHERE e.day >= date('now', ?) AND e.event_type = 'app_click' GROUP BY e.app_slug ORDER BY sessions ASC LIMIT 10`).bind(modifier).all(),
    env.DB.prepare(`SELECT COUNT(DISTINCT visitor_hash) AS visitors, ROUND(AVG(app_count), 2) AS avg_apps, SUM(CASE WHEN app_count > 1 THEN 1 ELSE 0 END) AS multi_app_visitors FROM (SELECT visitor_hash, COUNT(DISTINCT app_slug) AS app_count FROM event_facts WHERE day >= date('now', ?) AND event_type = 'app_click' GROUP BY visitor_hash)`).bind(modifier).all(),
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
    periods: periods.results?.[0] || {},
    live: live.results?.[0] || {},
    hourly: hourly.results || [],
    weekdays: weekdays.results || [],
    frequency: frequency.results || [],
    cohorts: cohorts.results || [],
    eventSummary: eventSummary.results?.[0] || {},
    sections: sections.results || [],
    navigation: navigation.results || [],
    appSignals: appSignals.results || [],
    transitions: transitions.results || [],
    performance: performance.results?.[0] || {},
    performanceDevices: performanceDevices.results || [],
    consent: consent.results || [],
    adminAccess: adminAccess.results || [],
    scrollDepth: scrollDepth.results || [],
    languages: languages.results || [],
    connections: connections.results || [],
    viewports: viewports.results || [],
    appCountries: appCountries.results || [],
    appDevices: appDevices.results || [],
    appSources: appSources.results || [],
    retention: retention.results?.[0] || {},
    appTrends: appTrends.results || [],
    appWindows: appWindows.results || [],
    appPositions: appPositions.results || [],
    appTiming: appTiming.results || [],
    exploration: exploration.results?.[0] || {},
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

async function logAdminAccess(request, env, outcome) {
  if (!env.DB) return;
  const identity = request.headers.get("oai-authenticated-user-id") || request.headers.get("oai-authenticated-user-email") || "anonymous";
  const accountHash = await anonymousHash(identity.toLowerCase());
  await env.DB.prepare(`INSERT INTO admin_access_logs (day, accessed_at, account_hash, outcome) VALUES (?, CURRENT_TIMESTAMP, ?, ?)`).bind(dayKey(), accountHash, outcome).run();
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

function renderAdminBase(report, days) {
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

function growth(current, previous) {
  const now = Number(current || 0);
  const before = Number(previous || 0);
  if (!before) return now ? "+100%" : "0%";
  const result = (now - before) / before * 100;
  return `${result >= 0 ? "+" : ""}${number(result, 1)}%`;
}

function reportPanel(title, note, rows, activityLabel = "Activity") {
  const body = rows.length ? rows.map((row) => `<tr><td><strong>${escapeHtml(row.label)}</strong></td><td class="num">${number(row.unique_visitors)}</td><td class="num">${number(row.sessions, 1)}</td></tr>`).join("") : `<tr><td colspan="3" class="empty">Collecting activity.</td></tr>`;
  return `<article class="panel"><div class="panel-head"><div><small>Intelligence</small><h2>${escapeHtml(title)}</h2><p class="panel-note">${escapeHtml(note)}</p></div></div><table><thead><tr><th>Segment</th><th class="num">People</th><th class="num">${escapeHtml(activityLabel)}</th></tr></thead><tbody>${body}</tbody></table></article>`;
}

function renderAdmin(report, days) {
  const base = renderAdminBase(report, days);
  const periods = report.periods || {};
  const events = report.eventSummary || {};
  const performance = report.performance || {};
  const retention = report.retention || {};
  const cohortSize = Number(retention.cohort_size || 0);
  const appViewSessions = Number(events.app_view_sessions || 0);
  const appLaunchSessions = Number(events.app_launch_sessions || 0);
  const contactStarts = Number(events.contact_starts || 0);
  const contactSubmits = Number(events.contact_submits || 0);
  const appConversion = appViewSessions ? appLaunchSessions / appViewSessions * 100 : 0;
  const contactConversion = contactStarts ? contactSubmits / contactStarts * 100 : 0;
  const windowLeader = (field) => report.appWindows.reduce((best, row) => Number(row[field] || 0) > Number(best?.[field] || 0) ? row : best, null);
  const todayLeader = windowLeader("today");
  const weekLeader = windowLeader("week");
  const monthLeader = windowLeader("month");
  const trendRows = report.appTrends.map((row) => {
    const current = Number(row.current_launches || 0);
    const previous = Number(row.previous_launches || 0);
    const change = previous ? (current - previous) / previous * 100 : current ? 100 : 0;
    return { label: APP_NAMES[row.app_slug] || row.app_slug, unique_visitors: current, sessions: change };
  }).sort((a, b) => b.sessions - a.sessions);
  const visitorGrowth = growth(periods.current_visitors, periods.previous_visitors);
  const alerts = [];
  if (Number(events.javascript_errors || 0) + Number(events.resource_errors || 0) > 0) alerts.push("Technical errors need review.");
  if (Number(performance.samples || 0) && Number(performance.good_lcp || 0) < 75) alerts.push("Loading performance needs attention.");
  if (appViewSessions >= 5 && appConversion < 10) alerts.push("Application-card conversion is below 10%.");
  if (!alerts.length) alerts.push("No critical engagement or reliability warning is active.");
  const executiveBrief = `<section class="spotlight"><div><div class="eyebrow">Executive brief</div><strong>Visitor movement ${escapeHtml(visitorGrowth)}</strong><p class="panel-note">Today's leader: ${escapeHtml(todayLeader ? APP_NAMES[todayLeader.app_slug] : "collecting data")}. Weekly leader: ${escapeHtml(weekLeader ? APP_NAMES[weekLeader.app_slug] : "collecting data")}. Monthly leader: ${escapeHtml(monthLeader ? APP_NAMES[monthLeader.app_slug] : "collecting data")}.</p></div><div class="score"><small>Decision signal</small><strong>${escapeHtml(alerts[0])}</strong></div></section>`;
  const signalRows = report.appSignals.length ? report.appSignals.map((row) => {
    const impressions = Number(row.impressions || 0);
    const clicks = Number(row.clicks || 0);
    return `<tr><td><strong>${escapeHtml(APP_NAMES[row.app_slug] || row.app_slug)}</strong></td><td class="num">${number(impressions)}</td><td class="num">${number(row.interested_people)}</td><td class="num">${number(impressions ? clicks / impressions * 100 : 0, 1)}%</td></tr>`;
  }).join("") : `<tr><td colspan="4" class="empty">Collecting impression and conversion data.</td></tr>`;
  const advanced = `<h2 class="section-title">Executive movement</h2><section class="metrics"><article class="metric"><span>Visitors vs prior period</span><strong>${growth(periods.current_visitors, periods.previous_visitors)}</strong><span>${number(periods.current_visitors)} current · ${number(periods.previous_visitors)} prior</span></article><article class="metric"><span>Sessions vs prior period</span><strong>${growth(periods.current_sessions, periods.previous_sessions)}</strong><span>${number(periods.current_sessions)} current · ${number(periods.previous_sessions)} prior</span></article><article class="metric"><span>Active in last 5 minutes</span><strong>${number(report.live.visitors)}</strong><span>${number(report.live.sessions)} live sessions</span></article><article class="metric"><span>App conversion</span><strong>${number(appConversion, 1)}%</strong><span>Card view to application launch</span></article><article class="metric"><span>Contact conversion</span><strong>${number(contactConversion, 1)}%</strong><span>${number(contactSubmits)} completed of ${number(contactStarts)} starts</span></article><article class="metric"><span>7-day return</span><strong>${number(cohortSize ? Number(retention.returned_7d || 0) / cohortSize * 100 : 0, 1)}%</strong><span>30-day: ${number(cohortSize ? Number(retention.returned_30d || 0) / cohortSize * 100 : 0, 1)}%</span></article></section><h2 class="section-title">Application conversion</h2><section class="panel wide"><div class="panel-head"><div><small>Portfolio funnel</small><h2>Impression-to-interest performance</h2><p class="panel-note">Shows which visible application cards turn attention into launches.</p></div></div><table><thead><tr><th>Application</th><th class="num">Card viewers</th><th class="num">Interested people</th><th class="num">Conversion</th></tr></thead><tbody>${signalRows}</tbody></table></section><h2 class="section-title">Engagement and navigation</h2><section class="panel-grid">${reportPanel("Scroll depth", "How far visitors travel through the flagship page.", report.scrollDepth, "Sessions")}${reportPanel("Section attention", "Total attentive seconds by page section.", report.sections, "Seconds")}${reportPanel("Navigation actions", "The most selected internal navigation controls.", report.navigation, "Clicks")}${reportPanel("Application sequences", "Common transitions between two application launches.", report.transitions, "Journeys")}${reportPanel("Traffic by hour", "UTC session distribution by hour.", report.hourly, "Sessions")}${reportPanel("Traffic by weekday", "The strongest days for portfolio discovery.", report.weekdays, "Sessions")}</section><h2 class="section-title">Retention and audience quality</h2><section class="panel-grid">${reportPanel("Visitor frequency", "One-time, returning, loyal, and highly engaged visitors.", report.frequency, "Sessions")}${reportPanel("Acquisition cohorts", "Weekly first-visit groups and observed returns.", report.cohorts, "Returned")}${dimensionPanel("Languages", "Browser language preferences.", report.languages)}${reportPanel("App interest by country", "Leading application and country combinations.", report.appCountries, "Launches")}${reportPanel("App interest by device", "Application demand across device classes.", report.appDevices, "Launches")}${reportPanel("App interest by source", "Applications launched from each referral source.", report.appSources, "Launches")}</section><h2 class="section-title">Experience and reliability</h2><section class="metrics"><article class="metric"><span>Average LCP</span><strong>${number(performance.avg_lcp)}ms</strong><span>${number(performance.good_lcp, 1)}% at or below 2.5s</span></article><article class="metric"><span>Average INP</span><strong>${number(performance.avg_inp)}ms</strong><span>${number(performance.good_inp, 1)}% at or below 200ms</span></article><article class="metric"><span>Average CLS</span><strong>${number(performance.avg_cls, 3)}</strong><span>${number(performance.good_cls, 1)}% at or below 0.1</span></article><article class="metric"><span>Average page load</span><strong>${number(performance.avg_load)}ms</strong><span>${number(performance.samples)} field samples</span></article><article class="metric"><span>JavaScript errors</span><strong>${number(events.javascript_errors)}</strong><span>Unhandled runtime problems</span></article><article class="metric"><span>Resource failures</span><strong>${number(events.resource_errors)}</strong><span>Images, scripts, or styles</span></article></section><section class="panel-grid">${reportPanel("Load time by device", "Average field load time for each device class.", report.performanceDevices, "Avg ms")}${reportPanel("Connection quality", "Reported effective network categories.", report.connections, "Samples")}${reportPanel("Viewport sizes", "Most common screen viewport dimensions.", report.viewports, "Samples")}</section><h2 class="section-title">Privacy and governance</h2><section class="journey">${reportPanel("Privacy choices", "Anonymous opt-in and opt-out preference changes.", report.consent, "Changes")}${reportPanel("Report access", "Hashed owner, denied, and signed-out access events.", report.adminAccess, "Attempts")}</section>`;
  const portfolioAdvanced = `<h2 class="section-title">Portfolio momentum</h2><section class="metrics"><article class="metric"><span>Top app today</span><strong>${escapeHtml(todayLeader ? APP_NAMES[todayLeader.app_slug] : "Pending")}</strong><span>${number(todayLeader?.today)} launches</span></article><article class="metric"><span>Top app this week</span><strong>${escapeHtml(weekLeader ? APP_NAMES[weekLeader.app_slug] : "Pending")}</strong><span>${number(weekLeader?.week)} launches</span></article><article class="metric"><span>Top app this month</span><strong>${escapeHtml(monthLeader ? APP_NAMES[monthLeader.app_slug] : "Pending")}</strong><span>${number(monthLeader?.month)} launches</span></article><article class="metric"><span>Apps per explorer</span><strong>${number(report.exploration.avg_apps, 1)}</strong><span>${number(report.exploration.multi_app_visitors)} multi-app visitors</span></article></section><section class="panel-grid">${reportPanel("Fastest momentum", "Launch change compared with the previous matching period.", trendRows, "% change")}${reportPanel("First and second choices", "Applications selected first and second in a session.", report.appPositions, "Selections")}${reportPanel("Time to launch", "Average seconds from entry to application launch.", report.appTiming, "Seconds")}</section>`;
  return base.replace('<section class="spotlight">', `${executiveBrief}<section class="spotlight">`).replace('<p class="privacy">', `${advanced}${portfolioAdvanced}<p class="privacy">`);
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
  for (const [section, values, detail] of [
    ["hour", report.hourly, "sessions"], ["weekday", report.weekdays, "sessions"],
    ["frequency", report.frequency, "sessions"], ["cohort", report.cohorts, "returned"],
    ["scroll_depth", report.scrollDepth, "sessions"], ["section_attention", report.sections, "seconds"],
    ["navigation", report.navigation, "clicks"], ["app_sequence", report.transitions, "journeys"],
    ["language", report.languages, "sessions"], ["connection", report.connections, "samples"],
    ["viewport", report.viewports, "samples"], ["app_country", report.appCountries, "launches"],
    ["app_device", report.appDevices, "launches"], ["app_source", report.appSources, "launches"],
    ["privacy", report.consent, "changes"], ["admin_access", report.adminAccess, "attempts"],
  ]) {
    for (const row of values) rows.push([section, row.label, row.unique_visitors, row.sessions, detail].map(csvCell).join(","));
  }
  for (const row of report.appSignals) rows.push(["application_funnel", APP_NAMES[row.app_slug] || row.app_slug, row.interested_people, row.clicks, `${row.impressions} viewers`].map(csvCell).join(","));
  rows.push(["performance", "LCP", "", report.performance.avg_lcp || 0, `${report.performance.good_lcp || 0}% good`].map(csvCell).join(","));
  rows.push(["performance", "INP", "", report.performance.avg_inp || 0, `${report.performance.good_inp || 0}% good`].map(csvCell).join(","));
  rows.push(["performance", "CLS", "", report.performance.avg_cls || 0, `${report.performance.good_cls || 0}% good`].map(csvCell).join(","));
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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/analytics") {
      try {
        const response = await trackEvent(request, env);
        const maintenance = maintainAnalytics(env).catch((error) => console.error("analytics_maintenance_failed", error));
        if (ctx?.waitUntil) ctx.waitUntil(maintenance); else await maintenance;
        return response;
      } catch (error) {
        console.error("analytics_write_failed", error);
        return new Response(null, { status: 204 });
      }
    }

    if (request.method === "GET" && ["/admin", "/admin/", "/admin/export.csv"].includes(url.pathname)) {
      const owner = currentOwner(request);
      const gate = ownerGate(request);
      const outcome = owner.allowed ? "owner" : owner.signedIn ? "denied" : "signed_out";
      const audit = logAdminAccess(request, env, outcome).catch((error) => console.error("admin_audit_failed", error));
      if (ctx?.waitUntil) ctx.waitUntil(audit); else await audit;
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
