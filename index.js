const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trivion Apps | Premium product ecosystem</title>
  <meta name="description" content="Trivion Apps is a cinematic portfolio of 12 intelligent products spanning finance, wellness, collaboration, operations, and data." />
  <meta name="theme-color" content="#07111f" />
  <meta name="author" content="Trivion Apps" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="https://www.trivionapps.com/" />
  <meta property="og:title" content="Trivion Apps | Premium product ecosystem" />
  <meta property="og:description" content="Explore 12 polished Trivion products in one premium ecosystem built for clarity, depth, and fast discovery." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.trivionapps.com/" />
  <meta property="og:site_name" content="Trivion Apps" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Trivion Apps | Premium product ecosystem" />
  <meta name="twitter:description" content="A cinematic ecosystem of 12 intelligent Trivion products built for clarity, trust, and fast discovery." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#f2f6fc;--bg-2:#e8eefb;--surface:rgba(255,255,255,.72);--surface-strong:rgba(255,255,255,.94);
      --text:#08101c;--muted:#5b687e;--line:rgba(8,16,28,.1);--line-strong:rgba(139,199,255,.3);
      --ink:#07111f;--brand:#89c8ff;--brand-2:#76f0c6;--brand-3:#f2d99c;--shadow:0 24px 80px rgba(6,18,36,.12);
      --shadow-strong:0 34px 110px rgba(6,18,36,.18);--radius-xl:34px;--radius-lg:26px;--radius-md:18px;color-scheme:light;
    }
    *{box-sizing:border-box} html{scroll-behavior:smooth}
    body{
      margin:0;font-family:Manrope,system-ui,sans-serif;color:var(--text);
      background:
        radial-gradient(circle at 18% 10%,rgba(137,200,255,.24),transparent 22%),
        radial-gradient(circle at 84% 18%,rgba(118,240,198,.12),transparent 18%),
        radial-gradient(circle at 50% 0%,rgba(242,217,156,.16),transparent 24%),
        linear-gradient(180deg,#fff 0%,var(--bg) 42%,#edf3ff 100%);
      overflow-x:hidden;
    }
    a{color:inherit;text-decoration:none} button,input{font:inherit} ::selection{background:var(--brand);color:#02101a}
    .shell{width:min(1240px,calc(100% - 32px));margin:0 auto}
    .skip-link{position:absolute;left:-999px;top:12px;padding:12px 16px;border-radius:999px;background:var(--ink);color:#fff;z-index:100}
    .skip-link:focus{left:16px}
    .grain{position:fixed;inset:0;pointer-events:none;opacity:.03;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");z-index:30}
    .scroll-progress{position:fixed;left:0;top:0;height:3px;width:0;z-index:90;background:linear-gradient(90deg,var(--brand),#fff,var(--brand-3));box-shadow:0 0 18px rgba(137,200,255,.8)}
    .nav{position:sticky;top:0;z-index:80;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);background:rgba(245,248,255,.72);border-bottom:1px solid rgba(8,16,28,.06)}
    .nav-inner{min-height:80px;display:flex;align-items:center;justify-content:space-between;gap:18px}
    .brand{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:-.03em}
    .brand-mark{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;color:#fff;background:linear-gradient(145deg,#0a1526,#1a3a5f 48%,#89c8ff);box-shadow:0 12px 34px rgba(8,16,28,.22)}
    .brand small{display:block;color:var(--muted);font-size:.82rem;font-weight:600;letter-spacing:.04em}
    .nav-links{display:flex;gap:20px;align-items:center;color:var(--muted);font-size:.92rem}
    .nav-links a:hover,.ghost:hover,.outline:hover,.solid:hover,.card-link:hover,.app:hover{transform:translateY(-2px)}
    .nav-actions{display:flex;align-items:center;gap:10px}
    .ghost,.solid,.outline,.pill{display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;padding:13px 18px;font-weight:700;transition:transform .28s ease,box-shadow .28s ease,background .28s ease,border-color .28s ease}
    .ghost,.outline{border:1px solid var(--line);background:rgba(255,255,255,.72);color:var(--text)}
    .solid{background:linear-gradient(135deg,#0b1628,#173457 54%,#0b1628);color:#fff;box-shadow:0 14px 26px rgba(8,16,28,.14)}
    .hero{padding:28px 0 18px;position:relative}
    .hero-card{
      position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.65);border-radius:42px;color:#fff;
      background:radial-gradient(circle at var(--hero-x,78%) var(--hero-y,20%),rgba(137,200,255,.2),transparent 28%),linear-gradient(135deg,rgba(7,17,28,.98),rgba(10,22,39,.97) 56%,rgba(15,34,58,.96));box-shadow:var(--shadow-strong);isolation:isolate
    }
    .hero-card::before,.hero-card::after{content:"";position:absolute;border-radius:50%;pointer-events:none;filter:blur(28px)}
    .hero-card::before{width:760px;height:760px;right:-220px;top:-280px;background:radial-gradient(circle,rgba(137,200,255,.24),transparent 60%)}
    .hero-card::after{width:540px;height:540px;left:-180px;bottom:-280px;background:radial-gradient(circle,rgba(118,240,198,.12),transparent 62%)}
    .ambient-field{position:absolute;inset:0;z-index:0;opacity:.75;background-image:radial-gradient(circle at 12% 22%,rgba(255,255,255,.8) 0 1px,transparent 1.5px),radial-gradient(circle at 72% 18%,rgba(139,199,255,.8) 0 1px,transparent 1.5px),radial-gradient(circle at 88% 72%,rgba(118,240,198,.7) 0 1px,transparent 1.5px),radial-gradient(circle at 42% 78%,rgba(255,255,255,.6) 0 1px,transparent 1.5px);background-size:180px 180px,240px 240px,220px 220px,310px 310px;animation:drift 22s linear infinite}
    .ambient-field::before,.ambient-field::after{content:"";position:absolute;border:1px solid rgba(137,200,255,.12);border-radius:50%;transform:rotate(-18deg);animation:orbit 18s ease-in-out infinite}
    .ambient-field::before{width:52%;height:125%;right:-15%;top:-18%}.ambient-field::after{width:42%;height:90%;left:-12%;bottom:-18%;animation-delay:-8s}
    .hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:1.06fr .94fr;gap:34px;padding:40px 40px 30px;align-items:center}
    .eyebrow{display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;color:#b7d8ff}
    .eyebrow::before{content:"";width:28px;height:1px;background:currentColor}
    h1,h2,h3{font-family:Fraunces,Georgia,serif;line-height:1}
    h1{margin:22px 0 18px;font-size:clamp(3.3rem,7.8vw,7.5rem);letter-spacing:-.07em;max-width:9.4ch}
    h1 em{font-style:normal;background:linear-gradient(90deg,#8bc7ff,#fff,#76f0c6,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:220% auto;animation:shimmer 7s linear infinite}
    .lede{margin:0;max-width:64ch;font-size:1.08rem;line-height:1.85;color:#dbe9f7}
    .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
    .hero-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:30px;max-width:730px}
    .metric{padding:16px 16px 15px;border-radius:22px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(12px)}
    .metric strong{display:block;font-size:1.35rem;letter-spacing:-.03em}
    .metric span{display:block;margin-top:5px;color:#c8d8e7;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
    .hero-side{display:grid;gap:16px;align-content:center;position:relative}
    .display{min-height:364px;border-radius:30px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
    .display-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;color:#bed7ee;font-size:.8rem;text-transform:uppercase;letter-spacing:.18em}
    .display-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:14px;min-height:290px}
    .glass{border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);overflow:hidden;position:relative}
    .glass::before{content:"";position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.14),transparent 40%,rgba(139,199,255,.08));pointer-events:none}
    .glass-main{padding:18px;display:flex;flex-direction:column;justify-content:space-between}
    .live-lines{display:grid;gap:11px}
    .line,.line-sm,.line-xs{height:14px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.92),rgba(255,255,255,.24))}
    .line-sm{max-width:72%}.line-xs{max-width:46%;height:10px}
    .chip-row{display:flex;gap:9px;flex-wrap:wrap}
    .chip{font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#d4e7f7}
    .stack{display:grid;gap:14px}
    .stack-card{padding:16px;border-radius:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
    .stack-card strong{display:block;font-size:1.2rem}
    .stack-card span{display:block;margin-top:8px;color:#c9dceb;font-size:.88rem;line-height:1.45}
    .floating-notes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .note{padding:14px 15px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#d6e8f8}
    .note strong{display:block;font-size:.86rem}.note span{display:block;margin-top:6px;color:#b9d2e8;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em}
    .overview{position:relative;margin-top:-16px;z-index:2}
    .overview-card{padding:20px;border-radius:28px;border:1px solid var(--line);background:var(--surface);backdrop-filter:blur(18px);box-shadow:var(--shadow)}
    .overview-top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
    .overview-top p{margin:0;color:var(--muted);max-width:72ch;line-height:1.7}
    .search-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:18px}
    .search{flex:1;min-width:260px;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.86)}
    .search input{width:100%;border:0;outline:none;background:transparent;color:var(--text);font-size:1rem}
    .search kbd{padding:5px 7px;border-radius:8px;border:1px solid var(--line);background:#fff;color:var(--muted);font-size:.72rem}
    .filters{display:flex;gap:8px;flex-wrap:wrap}
    .filter{padding:11px 14px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.84);color:var(--muted);cursor:pointer}
    .filter.active{background:var(--ink);color:#fff;border-color:transparent}
    .count{min-width:146px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,rgba(137,200,255,.18),rgba(118,240,198,.12));border:1px solid rgba(137,200,255,.3)}
    .count strong{display:block;font-size:1.3rem}.count span{display:block;color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}
    .featured{margin-top:20px;display:grid;grid-template-columns:1fr 360px;gap:16px}
    .spotlight,.orb{border-radius:28px;border:1px solid var(--line);box-shadow:var(--shadow)}
    .spotlight{padding:22px;background:linear-gradient(180deg,rgba(255,255,255,.97),rgba(248,251,255,.88))}
    .spotlight label,.standard span,.story span{display:block;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;color:#7a879d}
    .spotlight h2{margin:12px 0 12px;font-size:clamp(2rem,4.4vw,3.8rem);max-width:11ch;letter-spacing:-.06em}
    .spotlight p{margin:0;color:var(--muted);line-height:1.8;max-width:58ch}
    .spotlight-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:18px}
    .orb{position:relative;overflow:hidden;padding:22px;background:radial-gradient(circle at 50% 35%,rgba(137,200,255,.38),transparent 28%),radial-gradient(circle at 65% 65%,rgba(118,240,198,.14),transparent 28%),linear-gradient(180deg,#f8fbff,#e7efff)}
    .orb::before,.orb::after{content:"";position:absolute;border-radius:50%}
    .orb::before{inset:16% 18%;border:1px solid rgba(7,17,28,.12)}
    .orb::after{inset:28% 30%;border:1px solid rgba(7,17,28,.08)}
    .orb-core{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:46%;aspect-ratio:1;border-radius:32px;display:grid;place-items:center;background:linear-gradient(145deg,#07111c,#183556 55%,#89c8ff);color:#fff;font-family:Fraunces,serif;font-size:clamp(1.8rem,4vw,3rem);box-shadow:0 24px 60px rgba(8,16,28,.24)}
    .orb-tag{position:absolute;padding:11px 13px;border-radius:16px;background:rgba(255,255,255,.78);border:1px solid rgba(7,17,28,.08);backdrop-filter:blur(16px);font-size:.74rem;color:var(--muted)}
    .orb-tag b{display:block;color:var(--text);font-size:.9rem;margin-bottom:4px}
    .orb-tag.one{left:14px;top:16px}.orb-tag.two{right:14px;top:34%}.orb-tag.three{left:18px;bottom:14px}
    .ecosystem-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:18px;margin:32px 0}
    .story,.standards,.contact{border-radius:var(--radius-xl);border:1px solid var(--line);background:var(--surface);backdrop-filter:blur(18px);box-shadow:var(--shadow)}
    .story,.standards,.contact{padding:26px}
    .story h2,.contact h2,.standards h2{margin:12px 0;font-size:clamp(2.3rem,4.8vw,4.4rem);letter-spacing:-.065em}
    .story p,.contact p,.policy p{color:var(--muted);line-height:1.8}
    .story-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
    .story-card{padding:18px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(248,250,255,.9));border:1px solid var(--line)}
    .story-card strong{display:block;font-size:1.05rem}.story-card span{display:block;margin-top:8px;color:var(--muted);line-height:1.65;text-transform:none;letter-spacing:0}
    .standard-grid{display:grid;gap:12px;margin-top:18px}
    .standard{padding:18px;border-radius:22px;background:rgba(255,255,255,.82);border:1px solid var(--line)}
    .standard strong{display:block;font-size:1.06rem;margin:8px 0 6px}.standard p{margin:0;color:var(--muted);line-height:1.65}
    .apps-section{padding:26px 0 6px}
    .section-head{display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;margin-bottom:18px}
    .section-head h2{margin:0;font-size:clamp(2.4rem,5vw,4.8rem);letter-spacing:-.06em}
    .section-head p{margin:0;color:var(--muted);max-width:48ch;line-height:1.7}
    .apps{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;margin-top:16px}
    .app{
      grid-column:span 4;min-height:300px;padding:22px;border-radius:28px;position:relative;overflow:hidden;
      border:1px solid rgba(255,255,255,.76);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,255,.92));
      box-shadow:var(--shadow);transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease
    }
    .app::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at var(--mx,88%) var(--my,8%),rgba(137,200,255,.24),transparent 30%);pointer-events:none;opacity:.8;transition:opacity .35s ease}
    .app::after{content:"";position:absolute;inset:1px;border-radius:27px;border:1px solid transparent;background:linear-gradient(135deg,rgba(137,200,255,.45),transparent 28%,transparent 68%,rgba(118,240,198,.25)) border-box;mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:0;transition:opacity .35s ease;pointer-events:none}
    .app:hover{box-shadow:0 30px 90px rgba(6,18,36,.15);border-color:rgba(137,200,255,.4)}.app:hover::after{opacity:1}
    .app-top{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .app-num{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#7d8799}
    .app-type{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
    .app h3{margin:22px 0 10px;font-size:clamp(1.9rem,3vw,2.6rem);letter-spacing:-.05em}
    .app p{margin:0;color:var(--muted);line-height:1.7;max-width:38ch}
    .app-visual{margin:18px 0 0;border-radius:22px;overflow:hidden;border:1px solid rgba(8,16,28,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
    .app-visual img{width:100%;height:170px;display:block;object-fit:cover;object-position:top center;transition:transform .7s cubic-bezier(.2,.8,.2,1),filter .7s}
    .app:hover .app-visual img{transform:scale(1.04)}
    .app-footer{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-top:18px}
    .tags{display:flex;gap:8px;flex-wrap:wrap}
    .tag{padding:8px 10px;border-radius:999px;background:#edf4ff;color:#39506d;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}
    .card-link{width:48px;height:48px;display:grid;place-items:center;border-radius:50%;background:var(--ink);color:#fff;box-shadow:0 10px 24px rgba(8,16,28,.18)}
    .story-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:18px;margin:30px 0}
    .contact{margin:30px 0}
    .contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px;align-items:start}
    .contact-email{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-radius:22px;background:linear-gradient(135deg,rgba(137,200,255,.16),rgba(118,240,198,.12));border:1px solid rgba(137,200,255,.28)}
    .contact-email span{display:block;color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.12em}
    .contact-email strong{display:block;font-size:1.05rem}
    .footer{padding:20px 0 46px;display:flex;align-items:center;justify-content:space-between;gap:18px;color:var(--muted);font-size:.92rem}
    .footer-links{display:flex;gap:18px;flex-wrap:wrap}
    .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}.reveal.visible{opacity:1;transform:none}
    .hidden{display:none!important}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @keyframes shimmer{to{background-position:220% center}}@keyframes drift{to{background-position:180px 40px,240px -70px,150px 220px,310px -110px}}@keyframes orbit{50%{transform:rotate(18deg) scale(1.04);opacity:.65}}
    @media (max-width: 1024px){
      .hero-grid,.featured,.ecosystem-grid,.story-grid,.contact-grid{grid-template-columns:1fr}
      .nav-links{display:none}.app{grid-column:span 6}.hero-meta{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media (max-width: 680px){
      .shell{width:min(100% - 18px,1240px)} .nav-inner{min-height:70px} .hero-card{border-radius:28px}
      .hero-grid{padding:24px 18px 20px} h1{font-size:clamp(2.8rem,16vw,4.6rem)} .hero-meta{grid-template-columns:1fr}
      .display{min-height:300px}.display-grid{grid-template-columns:1fr;min-height:auto}.floating-notes{grid-template-columns:1fr}
      .app{grid-column:span 12}.story-cards{grid-template-columns:1fr}.footer{flex-direction:column;align-items:flex-start}
    }
    @media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
  </style>
</head>
<body>
  <a class="skip-link" href="#apps">Skip to products</a>
  <div class="scroll-progress" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <header class="nav">
    <div class="shell nav-inner">
      <a class="brand" href="#top">
        <span class="brand-mark">T</span>
        <span>Trivion Apps <small>Premium product ecosystem</small></span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="#apps">Products</a><a href="#ecosystem">Ecosystem</a><a href="#standards">Standards</a><a href="#contact">Contact</a>
      </nav>
      <div class="nav-actions">
        <a class="ghost" href="#apps">Explore 12 apps</a>
        <a class="solid" href="mailto:support@trivionapps.com">Talk to us</a>
      </div>
    </div>
  </header>
  <main id="top">
    <section class="hero shell">
      <div class="hero-card">
        <div class="ambient-field" aria-hidden="true"></div>
        <div class="hero-grid">
          <div class="hero-copy reveal">
            <span class="eyebrow">A premium home for the Trivion ecosystem</span>
            <h1>Powerful products, presented with <em>clarity</em> and drama.</h1>
            <p class="lede">This flagship now feels more like a polished AI-native studio than a simple link hub: stronger hierarchy, cinematic contrast, luminous glass, and deliberate motion that helps the 12-app ecosystem read instantly.</p>
            <div class="hero-actions">
              <a class="solid" href="#apps">View the ecosystem <span aria-hidden="true">↗</span></a>
              <a class="outline" href="#ecosystem">See the brand system</a>
            </div>
            <div class="hero-meta">
              <div class="metric"><strong>12</strong><span>apps in one system</span></div>
              <div class="metric"><strong>Live</strong><span>direct access to each product</span></div>
              <div class="metric"><strong>Fast</strong><span>static, responsive, lightweight</span></div>
            </div>
          </div>
          <div class="hero-side reveal" aria-hidden="true">
            <div class="display">
              <div class="display-top"><span>Flagship view</span><span>Trivion Apps</span></div>
              <div class="display-grid">
                <div class="glass glass-main">
                  <div class="live-lines"><div class="line"></div><div class="line line-sm"></div><div class="line line-xs"></div></div>
                  <div class="chip-row"><span class="chip">Premium</span><span class="chip">AI-led</span><span class="chip">Portfolio</span></div>
                </div>
                <div class="stack">
                  <div class="stack-card"><strong>Unified brand</strong><span>One visual language across finance, wellness, collaboration, operations, and data.</span></div>
                  <div class="stack-card"><strong>Trust signals</strong><span>Clear navigation, live links, support contact, and a calm, consistent hierarchy.</span></div>
                </div>
              </div>
            </div>
            <div class="floating-notes">
              <div class="note"><strong>Live</strong><span>all links preserved</span></div>
              <div class="note"><strong>Polished</strong><span>glass and light effects</span></div>
              <div class="note"><strong>Responsive</strong><span>desktop and mobile ready</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="overview shell reveal" id="apps">
      <div class="overview-card">
        <div class="overview-top">
          <div>
            <span class="eyebrow" style="color:#245ea0;border-color:rgba(8,16,28,.08);background:rgba(137,200,255,.1)">The ecosystem</span>
            <p>Search, filter, and open the 12 Trivion products from one visually unified surface. The cards use richer depth and stronger hierarchy, but the layout still stays quick to load and easy to use.</p>
          </div>
          <div class="count" aria-live="polite"><strong>12 products</strong><span>visible and organized</span></div>
        </div>
        <div class="search-row">
          <label class="search" aria-label="Search Trivion products">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search products, categories, or outcomes" autocomplete="off" />
            <kbd>/</kbd>
          </label>
          <div class="filters" role="tablist" aria-label="Product filters">
            <button class="filter active" type="button" data-filter="all">All</button>
            <button class="filter" type="button" data-filter="ai">AI</button>
            <button class="filter" type="button" data-filter="finance">Finance</button>
            <button class="filter" type="button" data-filter="utility">Utility</button>
            <button class="filter" type="button" data-filter="wellness">Wellness</button>
          </div>
        </div>
        <div class="featured">
          <article class="spotlight">
            <label>Featured product</label>
            <h2>ArthaTaxAI leads the portfolio with financial clarity.</h2>
            <p>The interface now gives each product a more cinematic presentation: richer surfaces, softer edges, better spacing, and real screenshots that make the ecosystem feel tangible from the first glance.</p>
            <div class="spotlight-actions">
              <a class="solid" href="https://arthataxai.onrender.com" target="_blank" rel="noreferrer">Open live product <span aria-hidden="true">↗</span></a>
              <a class="outline" href="#standards">See the standards</a>
            </div>
          </article>
          <aside class="orb" aria-hidden="true">
            <div class="orb-tag one"><b>Signal</b>Sharper hierarchy</div>
            <div class="orb-tag two"><b>Motion</b>Hover and glow</div>
            <div class="orb-tag three"><b>Feel</b>Premium and calm</div>
            <div class="orb-core">12</div>
          </aside>
        </div>
        <div class="apps">
          <article class="app reveal" data-category="finance ai">
            <div class="app-top"><span class="app-num">01 / TAX</span><span class="app-type">Finance intelligence</span></div>
            <div class="app-visual"><img src="assets/app-previews/arthataxai.jpg" alt="ArthaTaxAI homepage preview" loading="lazy"></div>
            <h3>ArthaTaxAI</h3><p>AI-assisted tax planning and financial clarity, presented as a high-trust flagship.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Finance</span><span class="tag">AI guidance</span></div><a class="card-link" href="https://arthataxai.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="finance ai">
            <div class="app-top"><span class="app-num">02 / MARKET</span><span class="app-type">Market platform</span></div>
            <div class="app-visual"><img src="assets/app-previews/marketpilot.jpg" alt="MarketPilot homepage preview" loading="lazy"></div>
            <h3>MarketPilot</h3><p>Analytical workflows for market awareness, trading decisions, and a more composed investing experience.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Markets</span><span class="tag">Analytics</span></div><a class="card-link" href="https://marketpilot-g4o6.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="ai utility">
            <div class="app-top"><span class="app-num">03 / FILM</span><span class="app-type">Entertainment AI</span></div>
            <div class="app-visual"><img src="assets/app-previews/cinemagic.jpg" alt="CineMagic AI homepage preview" loading="lazy"></div>
            <h3>CineMagic AI</h3><p>Cinematic discovery and storytelling tools with a richer presentation for viewers and creators.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Storytelling</span><span class="tag">Discovery</span></div><a class="card-link" href="https://cinemagic-ai.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="wellness ai">
            <div class="app-top"><span class="app-num">04 / LIFE</span><span class="app-type">Health & wellness</span></div>
            <div class="app-visual"><img src="assets/app-previews/lifeguardian.jpg" alt="Life Guardian homepage preview" loading="lazy"></div>
            <h3>Life Guardian</h3><p>Wellness-focused support designed to keep people informed, proactive, and reassured.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Wellness</span><span class="tag">Support</span></div><a class="card-link" href="https://health-wellness-1m3n.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility">
            <div class="app-top"><span class="app-num">05 / SHARE</span><span class="app-type">Collaboration</span></div>
            <div class="app-visual"><img src="assets/app-previews/screenshare.jpg" alt="Screen Share homepage preview" loading="lazy"></div>
            <h3>Screen Share</h3><p>Fast, direct collaboration with a more refined entry point for teams and live sessions.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Collaboration</span><span class="tag">Remote work</span></div><a class="card-link" href="https://screen-share-ci0i.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">06 / ROOT</span><span class="app-type">Spiritual wellness</span></div>
            <div class="app-visual"><img src="assets/app-previews/sanatana.jpg" alt="Sanatana homepage preview" loading="lazy"></div>
            <h3>Sanatana</h3><p>A culturally rooted experience blending tradition, learning, and a calm digital presence.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Culture</span><span class="tag">Wellbeing</span></div><a class="card-link" href="https://sanatana-dwxx.onrender.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">07 / ACCESS</span><span class="app-type">Accessibility intelligence</span></div>
            <div class="app-visual"><img src="assets/app-previews/accessbridge.jpg" alt="AccessBridge homepage preview" loading="lazy"></div>
            <h3>AccessBridge</h3><p>Accessibility tools for visual guidance, speech support, and more confident digital navigation.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Accessibility</span><span class="tag">Assistive AI</span></div><a class="card-link" href="https://accessbridge.trivionapps.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility">
            <div class="app-top"><span class="app-num">08 / FORGE</span><span class="app-type">Developer cloud</span></div>
            <div class="app-visual"><img src="assets/app-previews/ultraforge.jpg" alt="UltraForge homepage preview" loading="lazy"></div>
            <h3>UltraForge</h3><p>A developer cloud for repositories, reviews, deployments, and live telemetry in one focused workspace.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Developer tools</span><span class="tag">Deployments</span></div><a class="card-link" href="https://ultraforge.trivionapps.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">09 / DASH</span><span class="app-type">Dashboard studio</span></div>
            <div class="app-visual"><img src="assets/app-previews/dashforge.jpg" alt="DashForge homepage preview" loading="lazy"></div>
            <h3>DashForge</h3><p>A dashboard studio for turning operational data and executive signals into clear command centers.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Dashboards</span><span class="tag">Operations</span></div><a class="card-link" href="https://dashforge.trivionapps.com" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">10 / PULSE</span><span class="app-type">Service intelligence</span></div>
            <div class="app-visual"><img src="assets/app-previews/pulsedesk.jpg" alt="PulseDesk homepage preview" loading="lazy"></div>
            <h3>PulseDesk</h3><p>An intelligent service desk experience for organizing requests and helping teams respond faster.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Service desk</span><span class="tag">Support AI</span></div><a class="card-link" href="https://pulsedesk.trivionapps.com/" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">11 / BOARD</span><span class="app-type">Operations board</span></div>
            <div class="app-visual"><img src="assets/app-previews/pulseboard.jpg" alt="PulseBoard homepage preview" loading="lazy"></div>
            <h3>PulseBoard</h3><p>A modern operations board for tracking priorities, team signals, and live momentum.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Operations</span><span class="tag">Live board</span></div><a class="card-link" href="https://pulseboard.trivionapps.com/" target="_blank" rel="noreferrer">↗</a></div>
          </article>
          <article class="app reveal" data-category="utility ai">
            <div class="app-top"><span class="app-num">12 / VAULT</span><span class="app-type">Data workspace</span></div>
            <div class="app-visual"><img src="assets/app-previews/vaultdb.webp" alt="VaultDB data workspace preview" loading="lazy"></div>
            <h3>VaultDB</h3><p>A focused data workspace for organizing, exploring, and acting on trusted information.</p>
            <div class="app-footer"><div class="tags"><span class="tag">Data</span><span class="tag">Secure insights</span></div><a class="card-link" href="https://dbvault.trivionapps.com/" target="_blank" rel="noreferrer">↗</a></div>
          </article>
        </div>
      </div>
    </section>
    <section class="ecosystem-grid shell reveal" id="ecosystem">
      <article class="story">
        <span>Brand direction</span>
        <h2>Luxury, calm, and product-led.</h2>
        <p>The redesign leans into a more memorable flagship identity: darker hero contrast, luminous glass layers, real screenshots in the cards, and a tighter rhythm that makes the ecosystem feel cohesive and premium without slowing it down.</p>
        <div class="story-cards">
          <div class="story-card"><strong>Sharper hierarchy</strong><span>Less visual noise, more emphasis on the site title, category labels, and calls to action.</span></div>
          <div class="story-card"><strong>Better motion</strong><span>Subtle hover lift, shimmer, and reveal animations that feel polished instead of flashy.</span></div>
        </div>
      </article>
      <article class="standards" id="standards">
        <span>Trivion standards</span>
        <h2 style="margin:12px 0 0;font-size:clamp(2.2rem,4.6vw,4rem);letter-spacing:-.06em">The ecosystem stays clear at every size.</h2>
        <div class="standard-grid">
          <div class="standard"><span>01</span><strong>Premium clarity</strong><p>Strong contrast, thoughtful spacing, and readable text keep the experience elegant and easy to scan.</p></div>
          <div class="standard"><span>02</span><strong>Trust and utility</strong><p>Navigation, product links, and support details are always visible, so the page feels dependable.</p></div>
          <div class="standard"><span>03</span><strong>Consistent ecosystem</strong><p>Every app is treated as part of one family, even while each card keeps its own tone and destination.</p></div>
        </div>
      </article>
    </section>
    <section class="contact shell reveal" id="contact">
      <div class="contact-grid">
        <div>
          <span class="eyebrow" style="color:#245ea0;border-color:rgba(8,16,28,.08);background:rgba(137,200,255,.1)">Trust and contact</span>
          <h2>Visitors can find the brand, the products, and the team instantly.</h2>
          <p>Support and enquiries still route to the same place. The page just presents the ecosystem with more confidence, clearer wayfinding, and a stronger sense of craftsmanship.</p>
        </div>
        <a class="contact-email" href="mailto:support@trivionapps.com">
          <div><span>Enquiries</span><strong>support@trivionapps.com</strong></div>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  </main>
  <footer class="shell footer">
    <a class="brand" href="#top"><span class="brand-mark">T</span><span>Trivion Apps <small>Purposeful products for a changing world</small></span></a>
    <div class="footer-links"><a href="#apps">Products</a><a href="#standards">Standards</a><a href="#contact">Contact</a></div>
  </footer>
  <script>
    (() => {
      const progress = document.querySelector('.scroll-progress');
      const cards = [...document.querySelectorAll('.app')];
      const filters = [...document.querySelectorAll('.filter')];
      const search = document.querySelector('.search input');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
      const applyFilter = () => {
        const query = search.value.trim().toLowerCase();
        const active = document.querySelector('.filter.active')?.dataset.filter || 'all';
        let visible = 0;
        cards.forEach(card => {
          const categoryMatch = active === 'all' || card.dataset.category.includes(active);
          const queryMatch = !query || card.textContent.toLowerCase().includes(query);
          const show = categoryMatch && queryMatch;
          card.classList.toggle('hidden', !show);
          if (show) visible += 1;
        });
        document.querySelector('.count strong').textContent = `${visible} products`;
      };
      filters.forEach(button => button.addEventListener('click', () => {
        filters.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        applyFilter();
      }));
      search.addEventListener('input', applyFilter);
      const hero = document.querySelector('.hero-card');
      hero?.addEventListener('pointermove', event => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--hero-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
        hero.style.setProperty('--hero-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
      });
      document.addEventListener('keydown', event => {
        if (event.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
          event.preventDefault();
          search.focus();
        }
        if (event.key === 'Escape' && document.activeElement === search) {
          search.value = '';
          applyFilter();
          search.blur();
        }
      });
      cards.forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        });
      });
      addEventListener('scroll', () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = `${max ? scrollY / max * 100 : 0}%`;
      }, { passive: true });
      applyFilter();
    })();
  </script>
</body>
</html>`;

export default {
  fetch() {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
