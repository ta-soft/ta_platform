#!/usr/bin/env python3
"""Assemble the iConstruct Electrical replacement site (static, 9 pages)."""
import os, html

ROOT = os.path.dirname(os.path.abspath(__file__))

PHONE_DISPLAY = "0412 249 151"
PHONE_TEL = "+61412249151"
EMAIL = "info@iconstructelectrical.com.au"

SERVICES = [
    ("services/property-maintenance/", "Property Maintenance",
     "Emergency call outs, test and tag, security lighting, automation, audits and installations — one reliable point of contact."),
    ("services/switchboard-upgrade/", "Switchboard Upgrade",
     "Replace dangerous ceramic fuses with modern circuit breakers and safety switches that save lives."),
    ("services/exit-emergency-lighting-testing/", "Exit & Emergency Lighting Testing",
     "Six-monthly testing to AS/NZS 2293.2 with a full logbook service — meet your legal obligations."),
    ("services/led-lighting-upgrades/", "LED Lighting Upgrades",
     "Slash power bills by up to 90% with quality, fully dimmable LED lights installed by licensed electricians."),
    ("services/new-installation/", "New Installation",
     "New subdivisions, new houses and existing properties — rough in, fit off and handover, done properly."),
]

def rel(depth, path):
    return ("../" * depth) + path

def head(title, desc, depth):
    return f"""<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="icon" href="{rel(depth,'assets/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="{rel(depth,'assets/apple-touch-icon.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,600;0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel(depth,'assets/css/style.css')}">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
"""

def header(depth, active):
    def navlink(href, label, key):
        cls = ' class="nav-link active"' if active == key else ' class="nav-link"'
        return f'<li><a{cls} href="{rel(depth, href)}">{label}</a></li>'
    sub = "\n".join(
        f'          <li><a href="{rel(depth, href)}">{label}</a></li>' for href, label, _ in SERVICES
    )
    svc_active = ' active' if active == 'services' else ''
    return f"""<header class="site-header">
  <div class="container">
    <a class="brand" href="{rel(depth, '')}" aria-label="iConstruct Electrical Services — home">
      <span class="brand-slot" data-logo-slot>
        <img src="{rel(depth, 'assets/logo.svg')}" alt="iConstruct Electrical Services logo" width="283" height="66">
      </span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      <ul>
        {navlink('', 'Home', 'home')}
        <li class="nav-item--has-sub">
          <a class="nav-link{svc_active}" href="{rel(depth, 'services/')}">Services</a>
          <ul class="sub-nav">
{sub}
          </ul>
        </li>
        {navlink('about-ies/', 'About iES', 'about')}
        {navlink('contact-us/', 'Contact Us', 'contact')}
        <li>
          <a class="header-phone" href="tel:{PHONE_TEL}">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="label">{PHONE_DISPLAY}</span><span class="sr-only">Call us</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>
"""

def banner(depth, title, crumbs):
    trail = ' <span aria-hidden="true">›</span> '.join(
        f'<a href="{rel(depth, href)}">{label}</a>' if href else f'<span>{label}</span>'
        for href, label in crumbs
    )
    return f"""<section class="page-banner">
  <div class="page-banner__bg"><img src="{rel(depth, 'assets/titlestrip.jpg')}" alt="" aria-hidden="true"></div>
  <div class="container page-banner__inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">{trail}</nav>
    <h1>{title}</h1>
  </div>
</section>
"""

def cta_band(depth):
    return f"""<section class="cta-band">
  <div class="cta-band__bg"><img src="{rel(depth, 'assets/titlestrip.jpg')}" alt="" aria-hidden="true"></div>
  <div class="container cta-band__inner reveal">
    <h2>Like to know more?</h2>
    <p>Speak to one of our experienced &amp; fully licensed electricians today.</p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="{rel(depth, 'contact-us/')}">Receive a call back</a>
      <a class="btn btn--outline" href="tel:{PHONE_TEL}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        phone {PHONE_DISPLAY}</a>
    </div>
  </div>
</section>
"""

def footer(depth):
    svc = "\n".join(f'          <li><a href="{rel(depth, href)}">{label}</a></li>' for href, label, _ in SERVICES)
    return f"""<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <img src="{rel(depth, 'assets/footer-logo.svg')}" alt="iES — iConstruct Electrical Services" width="214" height="96">
      <p>Licensed electricians taking care of all your electrical needs — domestic, commercial and industrial — including emergency call outs. Proud Hoppers Crossing locals, servicing Melbourne's west and greater Victoria.</p>
    </div>
    <div class="footer-col">
      <h4>Our Services</h4>
      <ul>
{svc}
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <ul>
        <li><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li><a href="{rel(depth, 'contact-us/')}">Online enquiry</a></li>
        <li><a href="{rel(depth, 'about-ies/')}">About iES</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;width:100%">
      <p>© <span data-year>2026</span> iConstruct Electrical Services (REC 23142) | Electricians Melbourne West, Emergency Services, Residential &amp; Commercial.</p>
      <p>Electrical certificate provided for all work completed.</p>
    </div>
  </div>
</footer>
<div class="logo-switcher" data-logo-switcher data-logo-original="{rel(depth, 'assets/logo-original-white.png')}">
  <button class="logo-switcher-toggle" type="button" aria-expanded="false" aria-controls="logo-switcher-panel" data-logo-toggle>Logo</button>
  <div class="logo-switcher-panel" id="logo-switcher-panel" aria-label="Logo preview options" data-logo-panel>
    <p>Logo preview</p>
    <button type="button" data-logo-variant="new" aria-pressed="true">New</button>
    <button type="button" data-logo-variant="original" aria-pressed="false">Original</button>
  </div>
</div>
<script src="{rel(depth, 'assets/js/main.js')}" defer></script>
</body>
</html>
"""

def sidebar(depth, current_href):
    items = []
    for href, label, _ in SERVICES:
        cls = ' class="active"' if href == current_href else ''
        items.append(f'        <li><a href="{rel(depth, href)}"{cls}>{label}</a></li>')
    links = "\n".join(items)
    return f"""<aside class="sidebar">
  <div class="card sidebar-card--contact">
    <h3>Get a free quote</h3>
    <p>Obligation-free advice from experienced, fully licensed electricians.</p>
    <a class="phone-big" href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a>
    <a class="btn btn--primary" href="{rel(depth, 'contact-us/')}" style="width:100%;justify-content:center">Receive a call back</a>
  </div>
  <div class="card">
    <h3>All services</h3>
    <ul class="side-nav">
{links}
    </ul>
  </div>
</aside>
"""

def service_page(slug, title, crumb_title, body_html, desc):
    depth = 2
    out = head(f"{title} < Services | iConstruct Electrical Services", desc, depth)
    out += header(depth, "services")
    out += '<main id="main">'
    out += banner(depth, title, [("", "Home"), ("services/", "Services"), (None, crumb_title)])
    out += f"""<section class="section">
  <div class="container prose-layout">
    <div class="prose">
{body_html}
    </div>
{sidebar(depth, f'services/{slug}/')}
  </div>
</section>
"""
    out += cta_band(depth)
    out += "</main>"
    out += footer(depth)
    return out

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print("wrote", path, len(content))

# ============================================================ HOME
def home():
    depth = 0
    desc = ("Electrical services by a licensed electrician providing emergency electrician services, "
            "domestic electrician services, and commercial electrician services - includes electrical repairs, "
            "and switchboard upgrade, oven installers, and led light installation, with an electrical "
            "certificate provided for all work completed.")
    out = head("iConstruct Electrical Services | " + desc.split("|")[0].strip(), desc, depth)
    out += header(depth, "home")
    out += '<main id="main">'
    out += f"""
<section class="hero">
  <div class="hero__bg"><img src="assets/slide-01.jpg" alt="Industrial facility wired and maintained by licensed electricians"></div>
  <div class="container hero__inner">
    <p class="eyebrow" style="color:var(--amber)">Licensed Electricians · Melbourne West</p>
    <h1>Taking care of all your <em>electrical needs</em></h1>
    <p class="lead">Including emergency call outs. Domestic, commercial and industrial electrical services — done quickly, safely, and certified every time.</p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="contact-us/">Receive a call back</a>
      <a class="btn btn--outline" href="services/">Explore our services</a>
    </div>
    <ul class="hero__badges">
      <li><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>35 years combined experience</li>
      <li><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4z"/></svg>Fully insured to $20 million</li>
      <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Certificate of Compliance with every job</li>
      <li><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>REC 23142</li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="center" style="max-width:720px;margin:0 auto 46px">
      <p class="eyebrow" style="justify-content:center">What we do</p>
      <h2>iConstruct Electrical Services</h2>
      <p class="lead">Expect us to be there when we say we will. And get the job done. Quickly, safely, and with a Certificate of Compliance for every job. Big or small.</p>
    </div>
    <div class="grid grid--3">
      <div class="card reveal">
        <div class="card__icon"><img src="assets/commercial.png" alt="Commercial electrical icon"></div>
        <h3>Commercial</h3>
        <p>Factories, shops, sports venues and shopping centres — commercial fitouts, maintenance and compliance testing that keeps your business running.</p>
        <a class="card__more" href="services/">See commercial services →</a>
      </div>
      <div class="card reveal">
        <div class="card__icon"><img src="assets/residential.png" alt="Residential electrical icon"></div>
        <h3>Residential</h3>
        <p>From a front porch light to a full new-home fitout — powerpoints, lighting, switchboards, ovens, antennas and everything in between.</p>
        <a class="card__more" href="services/new-installation/">New home installations →</a>
      </div>
      <div class="card reveal">
        <div class="card__icon"><img src="assets/repairs.png" alt="Maintenance and repairs icon"></div>
        <h3>Maintenance</h3>
        <p>Emergency call outs, fault finding, test and tag, safety switch tests and preventative maintenance for homes and managed properties.</p>
        <a class="card__more" href="services/property-maintenance/">Property maintenance →</a>
      </div>
    </div>
    <div class="center" style="margin-top:34px">
      <a class="btn btn--blue" href="about-ies/">Learn more about iES</a>
    </div>
  </div>
</section>

<section class="section section--soft">
  <div class="container">
    <div class="stats">
      <div class="stat reveal"><strong>35 yrs</strong><span>Combined industry experience</span></div>
      <div class="stat reveal"><strong>$20m</strong><span>Fully insured for every job</span></div>
      <div class="stat reveal"><strong>100%</strong><span>Jobs issued a Certificate of Compliance</span></div>
      <div class="stat reveal"><strong>1</strong><span>Main point of contact, every time</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="center" style="max-width:720px;margin:0 auto 46px">
      <p class="eyebrow" style="justify-content:center">Our services</p>
      <h2>Top notch domestic, commercial &amp; industrial electrical services</h2>
    </div>
    <div class="grid grid--3">
"""
    for href, label, blurb in SERVICES[:3]:
        out += f"""      <a class="card card--link card--service reveal" href="{href}">
        <h3>{label}</h3>
        <p>{blurb}</p>
        <span class="card__more">Learn more →</span>
      </a>
"""
    out += """    </div>
    <div class="grid grid--2" style="margin-top:26px">
"""
    for href, label, blurb in SERVICES[3:]:
        out += f"""      <a class="card card--link card--service reveal" href="{href}">
        <h3>{label}</h3>
        <p>{blurb}</p>
        <span class="card__more">Learn more →</span>
      </a>
"""
    out += f"""    </div>
    <div class="center" style="margin-top:30px">
      <p style="color:var(--muted)">Plus test &amp; tag, CCTV and security installation, television, data and telecommunication services, and underground services.</p>
      <a class="btn btn--blue" href="services/">View all services</a>
    </div>
  </div>
</section>

<section class="section section--soft">
  <div class="container" style="max-width:880px">
    <div class="testimonial reveal">
      <blockquote>
        <p>I needed some electrical work done around my home... After speaking to Adrian I was confident he could do the work required. Adrian came to my home on the day arranged. He was friendly, polite and easy to talk to. After showing him what I required he was quick to get on with the job and completed it in a timely manner.</p>
        <p>Adrian was clean and neat in his work also which meant I didn't have to clean up after he had gone.</p>
        <p>I would be happy to get Adrian to do any other electrical work I needed done.</p>
      </blockquote>
      <cite>Leanne Pearce <small>Home Owner</small></cite>
    </div>
  </div>
</section>
"""
    out += cta_band(depth)
    out += "</main>"
    out += footer(depth)
    return out

# ============================================================ ABOUT
def about():
    depth = 1
    desc = ("About iES — iConstruct Electrical Services: 35 years of combined experience, fully insured up to "
            "$20 million, Certificate of Compliance provided with every job, big or small.")
    out = head("About iES | iConstruct Electrical Services", desc, depth)
    out += header(depth, "about")
    out += '<main id="main">'
    out += banner(depth, "About iES", [("", "Home"), (None, "About iES")])
    out += f"""
<section class="section">
  <div class="container" style="max-width:880px">
    <div class="testimonial reveal">
      <blockquote>
        <p>It is a pleasure that we recommend IES &amp; Adrian Barbara for electrical work... For those looking for a professional service we firmly recommend IES for all your electrical services. <a href="../assets/vpss-testimonial.pdf" target="_blank" rel="noopener">(read full testimonial)</a></p>
      </blockquote>
      <cite>Frank Grima</cite>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container" style="max-width:880px">
    <p class="lead" style="font-size:1.35rem;color:var(--ink)">Whether you're a homeowner who needs your front porch light replaced, or a factory owner who needs a full fitout, we're here for you.</p>
    <h2>You are our number 1 priority</h2>
    <p>We wouldn't exist without you. So you can rely on us. To do what we say, when we say we will.</p>
    <p>As a homeowner, you may be sick of running out of powerpoints for your laptop. Your fridge. The TVs. The baby monitor. The mobile phones.</p>
    <p><strong>We'll install them for you.</strong></p>
  </div>
</section>

<section class="section section--soft">
  <div class="container">
    <div class="grid grid--3 center">
      <div class="card reveal"><h3 style="font-size:1.6rem">Safe</h3><p>Safety processes followed on every site — a full Safety Environment Management Plan, not winging it.</p></div>
      <div class="card reveal"><h3 style="font-size:1.6rem">Skilled</h3><p>35 years of combined experience and knowledge in the electrical industry.</p></div>
      <div class="card reveal"><h3 style="font-size:1.6rem">Professional</h3><p>One main point of contact who makes sure your job is done — and done well.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container prose-layout">
    <div class="prose">
      <h2>Quality electrical services at the right price</h2>
      <p>We offer top notch Domestic, Commercial, and Industrial Electrical Services:</p>
      <ul class="check-list">
        <li><a href="../services/switchboard-upgrade/">Switchboard upgrade</a></li>
        <li><a href="../services/exit-emergency-lighting-testing/">Exit and emergency lighting testing</a></li>
        <li><a href="../services/led-lighting-upgrades/">LED lighting upgrades</a></li>
        <li><a href="../services/new-installation/">New installation</a></li>
        <li>Test and tag</li>
        <li>CCTV and security installation</li>
        <li>Television, data and telecommunication services</li>
        <li>Underground services</li>
      </ul>
      <p>As a small business, we value relationships.</p>
      <p>We work to gain your trust, rather than assume it's a given.</p>
      <p>We're professional and reliable.</p>
      <p>You'll have one main point of contact every time who will make sure your job is done - and done well.</p>
      <p>We're intentionally a small business - and proud Hoppers Crossing locals. But our experience is not:</p>
      <p>We have <strong>35 years of combined experience</strong> and knowledge in the electrical industry. Our portfolio includes local and national works with government, private corporate clients, property maintenance, and new homeowners.</p>

      <h2>Save time and money: bundle your electrical services</h2>
      <p>Give yourself valuable peace of mind that all your electrical equipment is in good working order - while getting a good deal.</p>
      <p>The following services can be taken care of at the same time:</p>
      <ul class="check-list">
        <li>Exit and emergency light testing</li>
        <li>Electrical equipment test and tag</li>
        <li>Circuit breaker tests</li>
        <li>Safety switch tests</li>
        <li>Smoke alarm testing</li>
        <li>LED lighting upgrades</li>
      </ul>

      <h2>What to expect</h2>
      <ul class="check-list">
        <li>Licensed, qualified and experienced electricians</li>
        <li>Fully insured up to $20 million</li>
        <li>Certificate of Compliance provided with every job, big or small</li>
        <li>Exceptional work guaranteed</li>
        <li>Quality parts with manufacturer warranties</li>
        <li>Personal, friendly, professional service</li>
      </ul>
      <p>Contact us for a free no-obligation quote.</p>
      <p><a class="btn btn--blue" href="../contact-us/">Contact Us</a></p>
    </div>
{sidebar(depth, '')}
  </div>
</section>

<section class="section section--soft">
  <div class="container" style="max-width:880px">
    <div class="testimonial reveal">
      <blockquote>
        <p>Adrian and the team at IConstruct Electrical Services installed all our lighting and security cameras. They were on time, clean and made all the works a seamless integration.</p>
        <p>I would highly recommend Adrian &amp; the team at IConstruct Electrical. From his leading hand to the apprentice were professional and knowledgeable. The shop lights are amazing.</p>
        <p>Thanks so much.</p>
      </blockquote>
      <cite>Yvette &amp; Matt <small>Cartridge World Werribee</small></cite>
    </div>
  </div>
</section>
"""
    out += cta_band(depth)
    out += "</main>"
    out += footer(depth)
    return out

# ============================================================ SERVICES INDEX
def services_index():
    depth = 1
    desc = ("Electrical services by iConstruct Electrical Services: property maintenance, switchboard upgrades, "
            "exit & emergency lighting testing, LED lighting upgrades and new installations across Melbourne's west.")
    out = head("Services | iConstruct Electrical Services", desc, depth)
    out += header(depth, "services")
    out += '<main id="main">'
    out += banner(depth, "Services", [("", "Home"), (None, "Services")])
    out += """
<section class="section">
  <div class="container">
    <div class="center" style="max-width:760px;margin:0 auto 46px">
      <p class="eyebrow" style="justify-content:center">What we do</p>
      <h2>Quality electrical services at the right price</h2>
      <p class="lead">Top notch domestic, commercial and industrial electrical services — every job completed quickly, safely, and with a Certificate of Compliance. Big or small.</p>
    </div>
    <div class="grid grid--3">
"""
    for href, label, blurb in SERVICES[:3]:
        out += f"""      <a class="card card--link card--service reveal" href="../{href}">
        <h3>{label}</h3>
        <p>{blurb}</p>
        <span class="card__more">Learn more →</span>
      </a>
"""
    out += """    </div>
    <div class="grid grid--2" style="margin-top:26px">
"""
    for href, label, blurb in SERVICES[3:]:
        out += f"""      <a class="card card--link card--service reveal" href="../{href}">
        <h3>{label}</h3>
        <p>{blurb}</p>
        <span class="card__more">Learn more →</span>
      </a>
"""
    out += """    </div>

    <div class="card reveal" style="margin-top:40px">
      <h3>Also on the job</h3>
      <p>We also take care of:</p>
      <ul class="check-list" style="columns:2;column-gap:40px">
        <li>Test and tag</li>
        <li>CCTV and security installation</li>
        <li>Television, data and telecommunication services</li>
        <li>Underground services</li>
        <li>Smoke alarm testing</li>
        <li>Energy efficiency audits</li>
      </ul>
      <p style="margin-top:10px">Ask about <strong>bundling your electrical services</strong> — exit and emergency light testing, test and tag, circuit breaker tests, safety switch tests, smoke alarm testing and LED lighting upgrades can all be taken care of at the same time, saving you time and money.</p>
    </div>
  </div>
</section>
"""
    out += cta_band(depth)
    out += "</main>"
    out += footer(depth)
    return out

# ============================================================ SERVICE PAGES
def svc_property_maintenance():
    body = f"""
      <blockquote>
        <p>It is with every confidence and without any reservations that I recommend iConstruct. Not only are Adrian and the staff reliable, but they also respect our business by happily working with our clients. <a href="../../assets/ray-white-testimonial.pdf" target="_blank" rel="noopener">(read full testimonial)</a></p>
        <cite>Michelle Chick — Director, Ray White Werribee</cite>
      </blockquote>
      <h3>We take safety seriously. Electrical systems can be dangerous.</h3>
      <p>That's why we've set up a full Safety Environmental Management Plan - which means we don't just wing it and hope for the best.</p>
      <p><strong>We set up and follow proper safety processes to make sure you, your family, your property and assets are safe. When we're on site. And long after we leave.</strong></p>

      <h2>Property Maintenance Electrical Services</h2>
      <ul class="check-list">
        <li>Emergency call outs for breakdowns and faults — nuisance tripping, safety switch tests, switchboard upgrades</li>
        <li>External and security lighting</li>
        <li>Building / home automation</li>
        <li>Telephone / data / communications</li>
        <li>Preventative maintenance</li>
        <li>Facility management</li>
        <li>Power supply requirements</li>
        <li>Maintain or monitor building services</li>
        <li>Appliance test and tag</li>
        <li>Energy efficiency audits</li>
        <li>Pre-purchase appliance inspections eg. oven, dishwasher, hot water services</li>
        <li>Installation: AV installation, hot water installation, ceiling and exhaust fans, smoke detectors, light fittings, power points, RCDs (safety switches), TV antennas, CCTVs, stoves, ovens, cooktops and rangehoods</li>
      </ul>

      <hr>
      <h2>Quality Electrical Services</h2>
      <p>Our business relies on repeat customers. Happy customers. We do this by providing a service that's:</p>
      <ul class="check-list">
        <li>Reliable</li>
        <li>Quick</li>
        <li>Guaranteed: work and parts</li>
        <li>Compliant: Certificate of Electrical Safety provided</li>
        <li>Personal service with one main point of contact</li>
      </ul>
      <p><strong>Contact us to discuss your property maintenance needs.</strong></p>
      <p><a class="btn btn--blue" href="../../contact-us/">Contact Us</a></p>
"""
    return service_page("property-maintenance", "Property Maintenance", "Property Maintenance", body,
        "Property maintenance electrical services: emergency call outs, test and tag, security lighting, building automation, energy audits and installations by licensed electricians.")

def svc_switchboard():
    body = """
      <blockquote>
        <p>Highly recommended, prompt, efficient and excellent work, definitely use again!</p>
        <cite>Helene V</cite>
      </blockquote>
      <h3>Do you have a home that's more than 10 years old?</h3>
      <h3>Do you want to install a new appliance such as an air conditioner or hotplate - but can't add more to your old switchboard?</h3>

      <h2>The risks</h2>
      <ul class="bolt-list">
        <li>Power outages</li>
        <li>Electrical fire</li>
        <li>Injury or death by electrocution</li>
      </ul>
      <p>These risks are high especially if you have a home that's more than 10 years old - and use outdated, dangerous electrical systems.</p>

      <h2>Do you need a switchboard upgrade?</h2>
      <p>Find out by taking this short questionnaire:</p>
      <ol>
        <li>Is your home more than 10 years old?</li>
        <li>Do you need more room in your switchboard?</li>
        <li>Are you using multiple extension cords?</li>
        <li>Do your lights flicker?</li>
        <li>Does a fuse blow when you use more than 1 or 2 standard appliances?</li>
        <li>Have you noticed heat coming from your fuse board?</li>
        <li>Do you have two-pronged outlets?</li>
      </ol>
      <p><strong>If you answered 'Yes' to any of these, keep reading...</strong></p>

      <hr>
      <h2>Why are old switchboards dangerous?</h2>
      <p>Wiring systems and fuse boards - that were once perfect for homes - are not suited to the needs of the modern household.</p>
      <p>Why?</p>
      <p>Look around your home.</p>
      <p>You may have any combination of TVs, computers, laptops, phones, heaters, kettles, pressure cookers, toasters, bedside lamps, pergola lights, baby monitors… the list goes on.</p>
      <div class="note-box">Most older fuse boards and switchboards use rewirable fuses made of ceramic - <strong>these don't comply with current Australian safety standards</strong>. Making them extremely dangerous for you and your family.</div>

      <h2>What difference will a switchboard upgrade make?</h2>
      <p>Look around your home and you're likely to find a few appliances you've left switched on at the powerpoint. The heater. The kettle. The TV.</p>
      <p>What would happen if there's an electrical fault while these are being used? Fire, damage to your home and appliances, injury to you or your family - or even worse, death by electrocution.</p>
      <p>Modern switchboards include circuit breakers and safety switches that the old switchboards don't have.</p>
      <p>It'll cut the electricity supply if there's an electrical fault. New switchboards:</p>
      <ul class="check-list">
        <li>Save lives</li>
        <li>Prevent electrical cables from catching fire</li>
        <li>Protect appliances</li>
      </ul>

      <hr>
      <h2>iConstruct Electrical Switchboard Services</h2>
      <ul class="check-list">
        <li>Upgrades</li>
        <li>Replacements</li>
        <li>Installation</li>
        <li>We'll coordinate the process from start to finish</li>
      </ul>
      <p>We'll only use high quality parts that we would use in our own home:</p>
      <ul class="check-list">
        <li>Switchboards</li>
        <li>Circuit breakers</li>
        <li>Safety switches</li>
        <li>Surge protection devices</li>
      </ul>

      <h2>Save time and money: bundle your electrical services</h2>
      <p>Give yourself valuable peace of mind that all your electrical equipment is in good working order - while getting a good deal.</p>
      <p>The following services can be taken care of at the same time as your switchboard upgrade:</p>
      <ul class="check-list">
        <li>Exit and emergency light testing</li>
        <li>Electrical equipment test and tag</li>
        <li>Circuit breaker tests</li>
        <li>Safety switch tests</li>
        <li>Smoke alarm testing</li>
        <li>LED lighting upgrades</li>
      </ul>

      <hr>
      <h2>What you can expect</h2>
      <ul class="check-list">
        <li>Licensed and experienced electricians</li>
        <li>Guarantee on labour and parts</li>
        <li>Emergency call outs</li>
        <li>Personal service with one main point of contact</li>
        <li>Certificate of Compliance provided with every job, big or small</li>
      </ul>
      <p>Contact us for a safe and professional upgrade of your switchboard.</p>
      <p><a class="btn btn--blue" href="../../contact-us/">Contact Us</a></p>
"""
    return service_page("switchboard-upgrade", "Switchboard Upgrade", "Switchboard Upgrade", body,
        "Switchboard upgrades, replacements and installation: replace dangerous ceramic fuses with modern circuit breakers and safety switches. Certificate of Compliance with every job.")

def svc_exit_emergency():
    body = """
      <h3>Imagine there's a fire on your property. It's dark. Thick black smoke, and sounds of panic fill the air. You need to quickly get staff and customers out to safety.</h3>
      <p>Will your exit and emergency lights direct them if power fails in your building?</p>
      <p>If you don't have your exit and emergency lights tested every 6 months, there's a higher risk of something going wrong… you're putting lives at risk.</p>
      <p><strong>Don't get caught out with faulty exit and emergency lights…</strong></p>

      <h2>Exit lighting</h2>
      <p>There are 2 types of exit lighting: one stays on all the time - the other comes on during power failure.</p>
      <p>The exit light that stays on all the time has 2 sets of bulbs inside:</p>
      <ul>
        <li>1 bulb operates on regular building power</li>
        <li>The other is a smaller voltage bulb powered by a battery - this only switches on during a power outage. If the battery is flat, or the bulb is burned out, the light won't come on at all. And you wouldn't realise it's not working, until you need it to work...</li>
      </ul>

      <h2>Emergency lighting</h2>
      <p>This provides basic lighting in case of power outages (known as spitfire lighting). It's usually located above stairs and in rooms such as toilets.</p>
      <p>It gives enough light for people to exit safely or move around the area.</p>

      <h2>Testing is your legal obligation</h2>
      <h3>Exit lighting and emergency lighting need to be tested every 6 months</h3>
      <p>This is the legal requirement to comply with relevant building codes according to Australian Standards 2293.2 (AS/NZS 2293.2).</p>
      <h3>A job too important to leave with just anyone...</h3>
      <p>The Standards specify that regular testing needs to be done by a person who is qualified and has suitable experience for this type of work.</p>

      <hr>
      <h2>iConstruct Electrical Exit and Emergency Light Testing</h2>
      <p>Our electricians are accredited, insured, and importantly, have more than 35 years combined experience testing exit and emergency lights.</p>
      <p>We'll help you meet your obligations and give you peace of mind.</p>

      <h3>Exit and Emergency Light Testing Service</h3>
      <p>In our regular scheduled service, we:</p>
      <ul class="check-list">
        <li>Clean tubes and replace as needed</li>
        <li>Inspect and replace bulbs and lights as needed</li>
        <li>Inspect and replace batteries as needed</li>
        <li>Inspect and replace diffusers as needed</li>
        <li>Clean light-reflecting surfaces to make sure signs are well lit</li>
        <li>Make sure your lights comply with current safety standards</li>
      </ul>
      <div class="note-box"><strong>Logbook service:</strong> we'll make sure your logbook is accurate and up to date, including dates, what parts were inspected, condition of parts, and what was replaced.</div>

      <h2>Save time and money: bundle your electrical services</h2>
      <p>Keep people and property safe, and meet all your legal obligations at the same time: it'll save you time, money, and give you valuable peace of mind that your business electrical equipment is in good working order.</p>
      <p>Exit and Emergency Light Testing can be done at the same time as:</p>
      <ul class="check-list">
        <li>Electrical equipment test and tag</li>
        <li>Circuit breaker tests</li>
        <li>Safety switch tests</li>
        <li>Smoke alarm testing</li>
        <li>LED lighting upgrades</li>
      </ul>

      <hr>
      <h2>What you can expect</h2>
      <ul class="check-list">
        <li>Licensed and experienced electricians</li>
        <li>Guarantee on labour and parts</li>
        <li>Emergency call outs</li>
        <li>Personal service with one main point of contact</li>
        <li>Certificate of Compliance provided with every job, big or small</li>
      </ul>
      <p>Contact us to make sure your exit and emergency lighting will work when you most need it.</p>
      <p><a class="btn btn--blue" href="../../contact-us/">Contact Us</a></p>
"""
    return service_page("exit-emergency-lighting-testing", "Exit & Emergency Lighting Testing", "Exit & Emergency Lighting Testing", body,
        "Exit and emergency lighting testing every 6 months to AS/NZS 2293.2 by accredited, insured electricians with 35+ years combined experience. Full logbook service.")

def svc_led():
    body = """
      <blockquote>
        <p>Would definitely recommend and use again ourselves. Impressed by their work and punctuality.</p>
        <cite>Rita Therese B</cite>
      </blockquote>
      <h3>Are you sick of constantly paying for sky high electricity bills?<br>Would you like better control over the lighting?<br>Would you prefer using low-maintenance lights?</h3>

      <h2>The lowdown on LED lights</h2>
      <p>Good quality LED lights:</p>
      <ul class="check-list">
        <li>Use less power and will save you money on energy bills</li>
        <li>Give you better quality of light</li>
        <li>Give you more control over light with dimmable controls</li>
        <li>Last many times longer, saving you maintenance and costs</li>
        <li>Can give you the same (or better) quality lighting than your current lighting</li>
        <li>Are energy efficient</li>
        <li>Fitted well will keep everyone safe</li>
      </ul>

      <h3>Example of domestic and commercial LED light savings</h3>
      <p><strong>Factories:</strong> significantly decrease the cost of high bays while getting the same quality of light eg. pay only half the price for 400 watts.</p>
      <p><strong>Homes:</strong> save up to 90% on your current power use.</p>

      <h2>Not all LED lights are the same</h2>
      <p>There are many poor quality LED lights - and many unprofessional installers. Beware.</p>
      <p>The wrong LED lights installed badly won't give you the maximum benefits possible with LED lights - and may be very dangerous to your family, staff, and your property.</p>
      <p>If you've ever had a door knocker offer to replace your lights with free LED lights (as part of the Government LED light scheme):</p>
      <ol>
        <li><strong>Ask for a sample of the light they plan to fit:</strong> before you let them change all your lights, please call us and we'll check the light for you - for free.</li>
        <li><strong>Ask for their electrician licence:</strong> only a licensed electrician will give you a Certificate of Electrical Safety. This is your assurance that the work has been done safely, and your home insurance cover will be preserved.</li>
      </ol>
      <div class="note-box"><strong>iConstruct Electrical Services does not take part in the government LED light scheme: the rebate is generally applied to low quality LED lights. We will not pass on poor quality products to our customers. We will not risk your safety - and the safety of your family and property.</strong></div>

      <hr>
      <h2>Domestic and commercial LED light experts</h2>
      <p>We've serviced both small and large clients within the domestic and commercial spaces, including factories, shops, and multi-unit residential properties.</p>
      <p>We will only ever use lights we've used and tested in our own homes. Lights that are:</p>
      <ul class="check-list">
        <li>High quality</li>
        <li>Fully dimmable</li>
        <li>Sold by Aussie companies</li>
        <li>Sold by accredited suppliers endorsed by the <a href="http://www.lightingcouncil.com.au/" target="_blank" rel="noopener">Lighting Council of Australia</a></li>
      </ul>

      <h2>Save time and money: bundle your electrical services</h2>
      <p>Give yourself valuable peace of mind that all your electrical equipment is in good working order - while getting a good deal.</p>
      <p>The following services can be taken care of at the same time as your LED lighting upgrade:</p>
      <ul class="check-list">
        <li>Exit and emergency light testing</li>
        <li>Electrical equipment test and tag</li>
        <li>Circuit breaker tests</li>
        <li>Safety switch tests</li>
        <li>Smoke alarm testing</li>
      </ul>

      <hr>
      <h2>What to expect</h2>
      <ul class="check-list">
        <li>Licensed and experienced electricians</li>
        <li>Guarantee on labour and parts</li>
        <li>Emergency call outs</li>
        <li>Personal service with one main point of contact</li>
        <li>Certificate of Compliance provided with every job, big or small</li>
      </ul>
      <p>Contact us to drastically reduce your electricity bills with high quality, professionally installed LED lights.</p>
      <p><a class="btn btn--blue" href="../../contact-us/">Contact Us</a></p>
"""
    return service_page("led-lighting-upgrades", "LED Lighting Upgrades", "LED Lighting Upgrades", body,
        "LED lighting upgrades for homes, factories and shops: save up to 90% on power use with high quality, fully dimmable LED lights installed by licensed electricians.")

def svc_new_installation():
    body = """
      <blockquote>
        <p>Highly recommended, prompt, efficient and excellent work, definitely use again!</p>
        <cite>Helene V</cite>
      </blockquote>
      <p>New subdivisions, new houses, and existing properties...</p>
      <h3>Let us take care of all your electrical needs: quickly, safely, and using only quality parts.</h3>

      <h2>Domestic electrical installation</h2>
      <p><strong>Your home, your haven</strong></p>
      <p>We understand you've been paying great attention to detail every step of the way - to make this home perfect. The haven you want to come back to put your feet up, after a long, hard day at work…</p>
      <p>So when you call us to install your new home, we'll make sure it's the safe and relaxing haven you want it to be.</p>
      <p>We're licensed and insured to professionally wire your phone, alarm systems, and any number of TVs you'd like. We'll install all the powerpoints you need for your desktops, mobiles, baby monitors, night lights, appliances. All of it, and any more you'll need.</p>
      <p><em>We'll only ever use quality parts that we would use in our own homes: so you, your family, and your home, are safe.</em></p>
      <p><em>We'll treat your home as we treat ours… with the utmost care.</em></p>

      <h2>Commercial electrical installation</h2>
      <p>You're on a tight schedule. And any delays will cost you time and money - at the expense of your reputation.</p>
      <p>It's tough to find an electrician that can do the job well - and is also reliable, affordable, and will keep to your schedule.</p>
      <p>That's where iConstruct Electrical Services fit in.</p>
      <p>We understand the demands of small and large commercial jobs. iConstruct Director and Electrician, <strong>Adrian Barbara personally oversees every job</strong>.</p>
      <p>Our portfolio includes a range of sports venues, shopping centres, and other high profile companies around Victoria.</p>
      <p>We take safety seriously - we operate under a Safety Environment Management Plan which we apply to every job we take on.</p>

      <hr>
      <h2>Stages: domestic and commercial electrical installation</h2>
      <h3>Rough in</h3>
      <p>Pre-wiring for phone, security services, TV, alarm systems.</p>
      <h3>Fit off</h3>
      <p>Install powerpoints, light fittings and fixtures, external lighting, everything but appliances. Only quality parts used.</p>
      <h3>Handover</h3>
      <p>Keys handed over, appliances installed, arrange for underground power.</p>

      <h2>Underground power</h2>
      <p>Take the hassle out of arranging underground power for your property - a stressful, time-consuming, and often expensive process if you haven't done it before.</p>
      <p>Let us sort it out for you. With many years of experience, and knowledge of the different process every major power company follows, we'll get the job done.</p>
      <p>Also, our strong relationships with these companies makes it much easier for us to sort out what the typical customer would have trouble with…</p>

      <hr>
      <h2>What you'll get</h2>
      <ul class="check-list">
        <li>Fully insured up to $20 million</li>
        <li>Certificate of Compliance provided with every job, big or small</li>
        <li>Emergency call outs</li>
        <li>Quality labour - and parts with manufacturer's warranty</li>
        <li>One main point of contact, personal service every time</li>
      </ul>
      <p>Contact us for an obligation-free quote on a high quality professional installation.</p>
      <p><a class="btn btn--blue" href="../../contact-us/">Contact Us</a></p>
"""
    return service_page("new-installation", "New Installation", "New Installation", body,
        "New electrical installations for new subdivisions, new houses and existing properties: rough in, fit off, handover and underground power across Victoria.")

# ============================================================ CONTACT
def contact():
    depth = 1
    desc = ("Contact iConstruct Electrical Services for an obligation free quote: phone 0412 249 151 or "
            "email info@iconstructelectrical.com.au. Experienced, fully licensed electricians.")
    out = head("Contact Us | iConstruct Electrical Services", desc, depth)
    out += header(depth, "contact")
    out += '<main id="main">'
    out += banner(depth, "Contact Us", [("", "Home"), (None, "Contact Us")])
    out += f"""
<section class="section">
  <div class="container">
    <div class="center" style="max-width:720px;margin:0 auto 46px">
      <h3 style="font-weight:600;color:var(--muted)">If you have any questions about any of our services, or would like an obligation free quote, please contact us. We look forward to helping you sort out your electrical needs.</h3>
    </div>
    <div class="contact-grid">
      <div class="contact-card reveal">
        <h2>Contact Details</h2>
        <p>Speak to one of our experienced &amp; fully licensed electricians today.</p>
        <div class="contact-method">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <div><strong>Phone</strong><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></div>
        </div>
        <div class="contact-method">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
          <div><strong>Email</strong><a href="mailto:{EMAIL}">{EMAIL}</a></div>
        </div>
        <div class="contact-method">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div><strong>Based in</strong><span>Hoppers Crossing, VIC — servicing Melbourne's west &amp; greater Victoria</span></div>
        </div>
        <div class="contact-method">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
          <div><strong>Registered</strong><span>Registered Electrical Contractor REC 23142 · Insured to $20 million</span></div>
        </div>
      </div>
      <div class="form-card reveal">
        <h2>Online Enquiry</h2>
        <form id="enquiry-form" novalidate>
          <div class="form-row">
            <div class="field">
              <label for="f-name">Name <span class="req">*</span></label>
              <input id="f-name" name="name" type="text" autocomplete="name" required>
              <span class="error">Please enter your name.</span>
            </div>
            <div class="field">
              <label for="f-email">Email <span class="req">*</span></label>
              <input id="f-email" name="email" type="email" autocomplete="email" required>
              <span class="error">Please enter a valid email address.</span>
            </div>
          </div>
          <div class="field">
            <label for="f-phone">Phone</label>
            <input id="f-phone" name="phone" type="tel" autocomplete="tel">
          </div>
          <div class="field">
            <label for="f-enquiry">Enquiry <span class="req">*</span></label>
            <textarea id="f-enquiry" name="enquiry" rows="6" required></textarea>
            <span class="error">Please tell us how we can help.</span>
          </div>
          <button class="btn btn--primary" type="submit">Send enquiry</button>
          <p class="form-note">Prefer to talk? Call <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a> — including emergency call outs.</p>
        </form>
        <div class="form-success" id="form-success" role="status">
          <div class="tick">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3>Your enquiry has been received.</h3>
          <p>We will be in touch shortly.</p>
        </div>
      </div>
    </div>
  </div>
</section>
"""
    out += "</main>"
    out += footer(depth)
    return out

write("index.html", home())
write("about-ies/index.html", about())
write("services/index.html", services_index())
write("services/property-maintenance/index.html", svc_property_maintenance())
write("services/switchboard-upgrade/index.html", svc_switchboard())
write("services/exit-emergency-lighting-testing/index.html", svc_exit_emergency())
write("services/led-lighting-upgrades/index.html", svc_led())
write("services/new-installation/index.html", svc_new_installation())
write("contact-us/index.html", contact())
print("BUILD OK")
