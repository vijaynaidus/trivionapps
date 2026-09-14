(() => {
  const appHosts = {
    "arthataxai.trivionapps.com": "arthataxai",
    "marketpilot.trivionapps.com": "marketpilot",
    "cinemagic.trivionapps.com": "cinemagic-ai",
    "lifeguardian.trivionapps.com": "life-guardian",
    "screenshare.trivionapps.com": "screen-share",
    "sanatana.trivionapps.com": "sanatana",
    "accessbridge.trivionapps.com": "accessbridge",
    "ultraforge.trivionapps.com": "ultraforge",
    "dashforge.trivionapps.com": "dashforge",
    "pulsedesk.trivionapps.com": "pulsedesk",
    "pulseboard.trivionapps.com": "pulseboard",
    "dbvault.trivionapps.com": "dbvault",
    "securepilot.trivionapps.com": "securepilot",
    "finvault.trivionapps.com": "finvault",
  };
  const uuid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const optOutKey = "trivion-analytics-opt-out";
  let visitor;
  let session;
  let returning = false;
  try {
    visitor = localStorage.getItem("trivion-visitor-id");
    returning = Boolean(visitor);
    if (!visitor) {
      visitor = uuid();
      localStorage.setItem("trivion-visitor-id", visitor);
    }
    session = sessionStorage.getItem("trivion-session-id");
    if (!session) {
      session = uuid();
      sessionStorage.setItem("trivion-session-id", session);
    }
  } catch {
    visitor = uuid();
    session = uuid();
  }

  const query = new URLSearchParams(location.search);
  const referrer = (() => {
    try { return document.referrer ? new URL(document.referrer).hostname : "Direct"; }
    catch { return "Direct"; }
  })();
  const context = {
    visitor,
    session,
    returning,
    path: location.pathname,
    referrer,
    utmSource: query.get("utm_source") || "",
    utmMedium: query.get("utm_medium") || "",
    utmCampaign: query.get("utm_campaign") || "",
    utmContent: query.get("utm_content") || "",
    utmTerm: query.get("utm_term") || "",
    language: navigator.language || "Unknown",
  };
  const enabled = () => {
    try { return localStorage.getItem(optOutKey) !== "true"; }
    catch { return true; }
  };
  const transmit = (payload) => {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type: "text/plain" }));
      return;
    }
    fetch("/api/analytics", { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
  };
  const send = (payload) => {
    if (enabled()) transmit({ ...context, ...payload });
  };
  const interaction = (eventType, label = "", value = 0, extra = {}) => send({
    type: "interaction",
    eventId: uuid(),
    eventType,
    label: String(label).slice(0, 100),
    value: Number(value) || 0,
    ...extra,
  });

  function installPrivacyChoices() {
    const footer = document.querySelector("footer") || document.body;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "analytics-choices-button";
    button.textContent = "Analytics choices";
    button.setAttribute("aria-haspopup", "dialog");
    const dialog = document.createElement("dialog");
    dialog.className = "analytics-choices-dialog";
    dialog.innerHTML = `<form method="dialog"><div class="analytics-choice-mark">T.</div><h2>Privacy choices</h2><p>Trivion Apps uses anonymous first-party analytics to improve its portfolio. We do not retain raw IP addresses, names, emails, or complete referral URLs.</p><label><input type="checkbox" data-analytics-toggle> Allow anonymous product analytics</label><div><button value="cancel">Cancel</button><button value="save" data-analytics-save>Save choice</button></div></form>`;
    const style = document.createElement("style");
    style.textContent = `.analytics-choices-button{margin:18px 0 0;padding:0;border:0;background:none;color:inherit;font:600 .82rem Manrope,sans-serif;text-decoration:underline;text-underline-offset:4px;cursor:pointer;opacity:.72}.analytics-choices-dialog{width:min(520px,calc(100% - 32px));border:1px solid rgba(148,163,184,.3);border-radius:26px;padding:0;background:#0b1728;color:#f8fbff;box-shadow:0 30px 100px rgba(0,0,0,.46)}.analytics-choices-dialog::backdrop{background:rgba(3,8,18,.72);backdrop-filter:blur(8px)}.analytics-choices-dialog form{padding:32px}.analytics-choices-dialog h2{margin:12px 0;font:800 1.7rem Manrope,sans-serif}.analytics-choices-dialog p{color:#afbed1;line-height:1.65}.analytics-choices-dialog label{display:flex;gap:12px;align-items:center;margin:24px 0;padding:16px;border:1px solid rgba(148,163,184,.22);border-radius:16px}.analytics-choices-dialog form>div:last-child{display:flex;justify-content:flex-end;gap:10px}.analytics-choices-dialog button{padding:11px 16px;border:1px solid rgba(148,163,184,.25);border-radius:999px;background:#14243a;color:#fff;font-weight:700;cursor:pointer}.analytics-choice-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#6ee7b7);color:#07111f;font-weight:900}`;
    document.head.append(style);
    footer.append(button);
    document.body.append(dialog);
    const toggle = dialog.querySelector("[data-analytics-toggle]");
    button.addEventListener("click", () => {
      toggle.checked = enabled();
      dialog.showModal();
    });
    dialog.querySelector("[data-analytics-save]").addEventListener("click", () => {
      const wasEnabled = enabled();
      const willEnable = toggle.checked;
      if (wasEnabled !== willEnable) {
        transmit({ type: "consent_choice", choice: willEnable ? "opt_in" : "opt_out" });
        try { localStorage.setItem(optOutKey, String(!willEnable)); } catch {}
      }
      dialog.close();
      if (!wasEnabled && willEnable) location.reload();
    });
  }

  installPrivacyChoices();
  if (!enabled()) return;
  send({ type: "page_view" });

  const seenApps = new Set();
  const appCards = new Map();
  document.querySelectorAll("a[href]").forEach((link) => {
    try {
      const app = appHosts[new URL(link.href, location.href).hostname];
      if (app && !appCards.has(app)) appCards.set(app, link.closest(".app") || link);
    } catch {}
  });
  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.45) return;
      const app = entry.target.dataset.analyticsApp;
      if (!seenApps.has(app)) {
        seenApps.add(app);
        interaction("app_impression", app, 1, { app });
      }
    }), { threshold: 0.45 });
    appCards.forEach((element, app) => {
      element.dataset.analyticsApp = app;
      cardObserver.observe(element);
    });
  }

  const scrollMarks = new Set();
  const captureScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const depth = max > 0 ? Math.round(scrollY / max * 100) : 100;
    [25, 50, 75, 100].forEach((mark) => {
      if (depth >= mark && !scrollMarks.has(mark)) {
        scrollMarks.add(mark);
        interaction("scroll_depth", `${mark}%`, mark);
      }
    });
  };
  addEventListener("scroll", captureScroll, { passive: true });
  captureScroll();

  const sectionStarts = new Map();
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const label = entry.target.id || entry.target.getAttribute("aria-label") || entry.target.tagName.toLowerCase();
      if (entry.isIntersecting && entry.intersectionRatio >= 0.4) sectionStarts.set(entry.target, performance.now());
      else if (sectionStarts.has(entry.target)) {
        const seconds = (performance.now() - sectionStarts.get(entry.target)) / 1000;
        sectionStarts.delete(entry.target);
        if (seconds >= 1) interaction("section_time", label, Math.min(seconds, 1800));
      }
    }), { threshold: [0, 0.4] });
    document.querySelectorAll("section[id],main>section").forEach((section) => sectionObserver.observe(section));
  }

  let contactStarted = false;
  document.addEventListener("focusin", (event) => {
    if (!contactStarted && event.target.closest?.(".contact-form")) {
      contactStarted = true;
      interaction("contact_start", "Contact form");
    }
  }, true);
  document.addEventListener("submit", (event) => {
    if (event.target.matches?.(".contact-form")) interaction("contact_submit", "Contact form");
  }, true);
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    try {
      const url = new URL(link.href, location.href);
      const app = appHosts[url.hostname];
      if (app) {
        send({ type: "app_click", app, exitPath: `/apps/${app}`, eventId: uuid() });
      } else if (url.protocol === "mailto:") {
        interaction("email_click", "support@trivionapps.com");
      } else if (url.origin === location.origin) {
        interaction("navigation_click", link.textContent.trim() || url.hash || url.pathname);
      }
    } catch {}
  }, { capture: true });

  addEventListener("error", (event) => {
    interaction(event.target !== window ? "resource_error" : "javascript_error", event.target?.tagName || event.message || "Unknown error");
  }, true);
  addEventListener("unhandledrejection", () => interaction("javascript_error", "Unhandled promise rejection"));

  let lcp = 0;
  let inp = 0;
  let cls = 0;
  try {
    new PerformanceObserver((list) => { lcp = Math.max(lcp, ...list.getEntries().map((entry) => entry.startTime)); }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => list.getEntries().forEach((entry) => { if (!entry.hadRecentInput) cls += entry.value; })).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => { inp = Math.max(inp, ...list.getEntries().filter((entry) => entry.interactionId).map((entry) => entry.duration)); }).observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch {}
  const sendPerformance = () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    send({
      type: "performance",
      lcp,
      inp,
      cls,
      loadMs: navigation?.loadEventEnd || navigation?.duration || 0,
      connection: navigator.connection?.effectiveType || "Unknown",
      viewport: `${innerWidth}x${innerHeight}`,
    });
  };
  const heartbeat = () => send({ type: "session_ping", exitPath: location.pathname });
  const timer = setInterval(heartbeat, 30000);
  addEventListener("pagehide", () => {
    clearInterval(timer);
    heartbeat();
    sendPerformance();
    sectionStarts.forEach((start, section) => {
      const seconds = (performance.now() - start) / 1000;
      if (seconds >= 1) interaction("section_time", section.id || section.tagName.toLowerCase(), Math.min(seconds, 1800));
    });
  });
  addEventListener("load", () => setTimeout(sendPerformance, 1500), { once: true });
})();
