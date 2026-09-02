const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trivion Apps | Premium AI Product Studio</title>
  <meta name="description" content="Trivion Apps showcases six polished AI and digital products in one premium portfolio experience." />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%232563eb'/%3E%3Cstop offset='100%25' stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath d='M18 20h28l-9.5 12.5L37 44H27l.5-11.5z' fill='white'/%3E%3C/svg%3E" />
  <style>
    :root {
      --bg: #f3f7ff;
      --surface: rgba(255,255,255,0.96);
      --line: rgba(33,49,82,.10);
      --text: #13233d;
      --muted: rgba(19,35,61,.70);
      --gold: #d08a1e;
      --blue: #2563eb;
      --rose: #db2777;
      --green: #10b981;
      --violet: #7c3aed;
      --slate: #64748b;
      font-synthesis-weight: none;
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{
      margin:0;font-family:Manrope,system-ui,sans-serif;color:var(--text);
      background: radial-gradient(circle at top left, rgba(37,99,235,.12), transparent 24%),
                  radial-gradient(circle at top right, rgba(124,58,237,.12), transparent 24%),
                  linear-gradient(180deg,#fff 0%,#f6f9ff 36%,#edf3ff 100%);
    }
    .page-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:24px 0 56px}
    .hero,.section,.app-card,.quote-card,.detail-card,.panel-card,.panel-metrics{
      backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)
    }
    .hero{border:1px solid var(--line);background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,251,255,.96));border-radius:32px;padding:24px;box-shadow:0 20px 50px rgba(29,55,105,.08)}
    .topbar,.brand,.hero-grid,.hero-stats,.card-head,.card-links,.section,.split,.panel-metrics{display:flex}
    .topbar,.hero-grid,.section,.split{justify-content:space-between}
    .topbar,.card-head,.card-links,.hero-stats,.panel-metrics{align-items:center}
    .brand{gap:14px;align-items:center}
    .brand-mark{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-weight:800;color:#fff;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 10px 24px rgba(37,99,235,.22)}
    .brand p,.brand span{margin:0}
    .brand p{font-weight:800;letter-spacing:.03em}
    .brand span{color:var(--muted);font-size:.9rem}
    .nav-cta,.primary-btn,.secondary-btn,.card-links a{text-decoration:none;border-radius:999px}
    .nav-cta,.secondary-btn,.card-links a{color:var(--text);border:1px solid var(--line);background:rgba(255,255,255,.98)}
    .nav-cta{padding:12px 18px}
    .hero-grid{gap:30px;margin-top:40px;align-items:stretch}
    .hero-copy{flex:1.2}
    .hero-panel{flex:.8;display:grid;gap:16px}
    .eyebrow,.section-tag,.panel-label{text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;color:var(--gold)}
    h1,h2,h3{font-family:Georgia,serif;margin:0;line-height:1.02}
    h1{font-size:clamp(3rem,7vw,5.8rem);max-width:10ch;margin-top:18px}
    .lede{color:var(--muted);font-size:1.05rem;line-height:1.8;max-width:62ch;margin:22px 0 0}
    .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
    .primary-btn,.secondary-btn{padding:14px 20px;font-weight:700}
    .primary-btn{color:#fff;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 14px 24px rgba(37,99,235,.22)}
    .secondary-btn{color:#1f3a68;background:rgba(255,255,255,.94)}
    .hero-stats{gap:28px;margin-top:34px;flex-wrap:wrap}
    .hero-stats div{min-width:140px;padding-top:14px;border-top:1px solid var(--line)}
    .hero-stats strong{display:block;font-size:1.7rem}
    .hero-stats span,.panel-metrics span,.app-card p,.section p,li{color:var(--muted)}
    .panel-card,.panel-metrics,.app-card,.quote-card,.detail-card{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,255,.95));border-radius:24px}
    .panel-card{padding:22px}
    .spotlight h2{font-size:2rem;margin-top:10px}
    .spotlight p{color:var(--muted);line-height:1.7}
    .showcase{margin-top:18px;display:grid;grid-template-columns:repeat(12,1fr);gap:18px}
    .showcase-card{grid-column:span 6;border:1px solid var(--line);border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,255,.94));padding:18px;overflow:hidden;position:relative}
    .showcase-card::before{content:"";position:absolute;inset:-30px auto auto -30px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle, rgba(37,99,235,.10), transparent 70%)}
    .showcase-card .top{display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;z-index:1}
    .showcase-card .chip{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
    .mock-window{margin-top:16px;border-radius:20px;border:1px solid rgba(33,49,82,.10);background:linear-gradient(180deg,#0f172a,#1e293b);padding:14px;min-height:170px;position:relative;overflow:hidden}
    .mock-window.light{background:linear-gradient(180deg,#f8fbff,#e9f1ff)}
    .window-bar{display:flex;gap:8px;margin-bottom:14px}
    .window-bar span{width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.35)}
    .light .window-bar span{background:rgba(19,35,61,.16)}
    .window-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:12px;height:132px}
    .panel{border-radius:16px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14)}
    .light .panel{background:rgba(255,255,255,.82);border-color:rgba(33,49,82,.08)}
    .panel.big{padding:14px;display:flex;flex-direction:column;justify-content:space-between}
    .hero-line{height:12px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.88),rgba(255,255,255,.25));max-width:72%}
    .light .hero-line{background:linear-gradient(90deg,rgba(37,99,235,.20),rgba(37,99,235,.06))}
    .hero-line.small{max-width:46%;height:10px}
    .stack{display:grid;gap:10px}
    .stat-row{display:flex;gap:10px}
    .stat{flex:1;height:52px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)}
    .light .stat{background:rgba(255,255,255,.88);border-color:rgba(33,49,82,.08)}
    .window-footer{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
    .pill{padding:8px 12px;border-radius:999px;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.84)}
    .light .pill{background:#fff;border-color:rgba(33,49,82,.08);color:var(--text)}
    .panel-metrics{justify-content:space-between;gap:16px;padding:18px 22px}
    .panel-metrics div{flex:1}
    .panel-metrics strong{display:block;margin-top:6px}
    main{margin-top:24px}
    .section{gap:26px;padding:18px 4px;align-items:center}
    .intro h2,.quote-card h2{font-size:clamp(2rem,4vw,3.2rem);max-width:14ch}
    .intro p,.quote-card p,.detail-card li{line-height:1.8}
    .portfolio{display:grid;grid-template-columns:repeat(12,1fr);gap:18px;margin-top:18px}
    .app-card{grid-column:span 4;padding:22px;min-height:248px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
    .app-card::after{content:"";position:absolute;inset:auto -30px -40px auto;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, rgba(37,99,235,.08), transparent 70%)}
    .card-head{gap:10px;justify-content:space-between;margin-bottom:18px}
    .app-index{color:rgba(18,32,51,.45);font-size:.9rem}
    .app-type{font-size:.76rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
    .app-card h3{font-size:2rem;margin-bottom:10px}
    .app-card p{max-width:34ch}
    .card-links{gap:12px;flex-wrap:wrap;margin-top:22px}
    .card-links a{padding:10px 14px;font-weight:700}
    .accent-gold{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(139,107,42,.10)}
    .accent-blue{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(37,99,235,.14)}
    .accent-rose{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(160,76,109,.10)}
    .accent-green{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(16,185,129,.14)}
    .accent-slate{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(100,116,139,.10)}
    .accent-violet{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 0 0 1px rgba(124,58,237,.14)}
    .split{gap:18px;margin-top:18px}
    .quote-card,.detail-card{flex:1;padding:24px}
    .detail-card ul{margin:12px 0 0;padding-left:18px}
    .detail-card li{margin-bottom:12px}
    .contact-strip{margin-top:18px;padding:18px 22px;border:1px solid var(--line);border-radius:24px;background:linear-gradient(135deg,rgba(37,99,235,.06),rgba(124,58,237,.05))}
    .contact-strip strong{display:block;font-size:1rem;margin-bottom:6px}
    .contact-strip span{color:var(--muted)}
    @media (max-width:980px){.hero-grid,.section,.split{flex-direction:column}.app-card{grid-column:span 6}.showcase{grid-template-columns:1fr}.showcase-card{grid-column:span 12}}
    @media (max-width:680px){.page-shell{width:min(100% - 20px,1180px);padding-top:10px}.hero{border-radius:24px;padding:18px}.topbar{gap:16px;align-items:flex-start;flex-direction:column}.hero-grid{margin-top:28px}.hero-stats{gap:16px}.app-card{grid-column:span 12}.window-grid{grid-template-columns:1fr}h1{max-width:12ch}}
  </style>
</head>
<body>
  <div class="page-shell">
    <header class="hero">
      <nav class="topbar">
        <div class="brand"><div class="brand-mark">T</div><div><p>Trivion Apps</p><span>trivionapps.com</span></div></div>
        <a class="nav-cta" href="#portfolio">Explore portfolio</a>
      </nav>
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="eyebrow">Premium portfolio showcase</div>
          <h1>Six product experiences. One refined destination.</h1>
          <p class="lede">Trivion Apps brings together a curated collection of intelligent products across finance, healthcare, entertainment, collaboration, and spiritual wellness, presented with a clean, modern, product-led website experience.</p>
          <div class="hero-actions"><a class="primary-btn" href="#portfolio">View all apps</a><a class="secondary-btn" href="#about">Why Trivion</a></div>
          <div class="hero-stats"><div><strong>6</strong><span>apps featured</span></div><div><strong>5</strong><span>categories</span></div><div><strong>1</strong><span>unified brand</span></div></div>
          <div class="contact-strip">
            <strong>Launch-ready for investors, customers, and demos</strong>
            <span>Each app includes live and source links so visitors can explore the product and the codebase with one click.</span>
          </div>
        </div>
        <div class="hero-panel">
          <div class="panel-card spotlight"><span class="panel-label">Featured ecosystem</span><h2>Purpose-built applications designed to feel cohesive and premium.</h2><p>Every product card is linked to a live deployment and source repository, making the site both a polished showcase and a practical business directory.</p></div>
          <div class="panel-metrics"><div><span>Focus</span><strong>AI-first utility</strong></div><div><span>Audience</span><strong>Modern teams & users</strong></div><div><span>Experience</span><strong>Editorial + product-led</strong></div></div>
        </div>
      </div>
      <div class="showcase">
        <article class="showcase-card">
          <div class="top"><strong>ArthaTaxAI</strong><span class="chip">Finance interface</span></div>
          <div class="mock-window">
            <div class="window-bar"><span></span><span></span><span></span></div>
            <div class="window-grid">
              <div class="panel big">
                <div class="stack">
                  <div class="hero-line"></div>
                  <div class="hero-line small"></div>
                </div>
                <div class="window-footer"><span class="pill">Tax planning</span><span class="pill">AI guidance</span></div>
              </div>
              <div class="stack">
                <div class="stat"></div>
                <div class="stat"></div>
                <div class="stat"></div>
              </div>
            </div>
          </div>
        </article>
        <article class="showcase-card">
          <div class="top"><strong>CineMagic AI</strong><span class="chip">Entertainment interface</span></div>
          <div class="mock-window light">
            <div class="window-bar"><span></span><span></span><span></span></div>
            <div class="window-grid">
              <div class="panel big">
                <div class="stack">
                  <div class="hero-line"></div>
                  <div class="hero-line small"></div>
                </div>
                <div class="window-footer"><span class="pill">Discovery</span><span class="pill">Storytelling</span></div>
              </div>
              <div class="stack">
                <div class="stat"></div>
                <div class="stat"></div>
                <div class="stat"></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </header>
    <main>
      <section class="section intro" id="about"><div><div class="section-tag">About the brand</div><h2>A clean, investor-friendly home for a multi-product portfolio.</h2></div><p>The layout is intentionally elevated: generous spacing, a restrained palette, editorial typography, and subtle depth that lets the products feel like a coordinated suite rather than six unrelated links.</p></section>
      <section class="portfolio" id="portfolio">
        <article class="app-card accent-gold"><div class="card-head"><span class="app-index">01</span><span class="app-type">Tax intelligence</span></div><h3>ArthaTaxAI</h3><p>AI-assisted tax guidance and workflow support for smarter financial decisions.</p><div class="card-links"><a href="https://arthataxai.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/arthataxai.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
        <article class="app-card accent-blue"><div class="card-head"><span class="app-index">02</span><span class="app-type">Market platform</span></div><h3>MarketPilot</h3><p>Market-aware workflows and analytical tooling built for trading and investing clarity.</p><div class="card-links"><a href="https://marketpilot-g4o6.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/stock-market.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
        <article class="app-card accent-rose"><div class="card-head"><span class="app-index">03</span><span class="app-type">Entertainment AI</span></div><h3>CineMagic AI</h3><p>Creative AI experiences centered on film discovery, storytelling, and cinematic exploration.</p><div class="card-links"><a href="https://cinemagic-ai.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/CineMagic-AI.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
        <article class="app-card accent-green"><div class="card-head"><span class="app-index">04</span><span class="app-type">Health & wellness</span></div><h3>Life Guardian</h3><p>Wellness-oriented digital support designed to help users stay informed and proactive.</p><div class="card-links"><a href="https://health-wellness-1m3n.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/life-guardian.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
        <article class="app-card accent-slate"><div class="card-head"><span class="app-index">05</span><span class="app-type">Collaboration</span></div><h3>Screen Share</h3><p>Simple, direct sharing and collaboration built for teams that value speed and clarity.</p><div class="card-links"><a href="https://screen-share-ci0i.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/screen-share.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
        <article class="app-card accent-violet"><div class="card-head"><span class="app-index">06</span><span class="app-type">Spiritual wellness</span></div><h3>Sanatana</h3><p>A culturally rooted product experience that blends tradition, learning, and digital simplicity.</p><div class="card-links"><a href="https://sanatana-dwxx.onrender.com" target="_blank" rel="noreferrer">Live site</a><a href="https://github.com/vijaynaidus/sanatana.git" target="_blank" rel="noreferrer">Source repo</a></div></article>
      </section>
      <section class="section split"><div class="quote-card"><div class="section-tag">Brand direction</div><h2>Minimal, confident, and product-led.</h2><p>The visual language uses a light SaaS-inspired base, calm blue accents, and clean cards to create a modern launch page that feels ready for users, partners, and investors.</p></div><div class="detail-card"><div class="section-tag">What visitors see</div><ul><li>Clear product categorization</li><li>Clickable live and source links for each app</li><li>Professional brand framing for trivionapps.com</li><li>Responsive layout for desktop and mobile</li></ul></div></section>
    </main>
  </div>
</body>
</html>`;

export default {
  fetch() {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
