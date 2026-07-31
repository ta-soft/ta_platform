# iConstruct Electrical Services — Replacement Site Build Report

Date: 2026-07-31 · Task: t_cf240288 · Builder: Hermes (kimi-k3)

## Result
Polished 9-page static replacement for https://www.iconstructelectrical.com.au (Laravel/Vite original).

- Live dev URL: http://209.38.25.82:8080/iconstructelectrical.com.au/
- Local: http://localhost:8080/iconstructelectrical.com.au/
- Deployed at: /home/hermes/flashline-site/iconstructelectrical.com.au/ (shared web root on :8080, sibling of /flashline.com.au/)
- Build source: iconstructelectrical.com.au/build.py (regenerates all pages: `python3 build.py`)

## Pages (original URL structure preserved)
/ · /about-ies/ · /services/ · /services/property-maintenance/ · /services/switchboard-upgrade/ ·
/services/exit-emergency-lighting-testing/ · /services/led-lighting-upgrades/ · /services/new-installation/ · /contact-us/

## Content preservation — 68/68 automated checks pass
All copy crawled via local Firecrawl (localhost:3002) and re-mapped. Preserved facts:
- Identity: iConstruct Electrical Services (REC 23142), Director/Electrician Adrian Barbara, proud Hoppers Crossing locals, Melbourne West + greater Victoria.
- Contact: 0412 249 151 (real tel:+61412249151 — original masked it), info@iconstructelectrical.com.au, online enquiry form.
- Proof: 35 years combined experience, insured to $20M, Certificate of Compliance every job, Safety Environment Management Plan, portfolio (government, corporate, sports venues, shopping centres).
- All 6 testimonials: Leanne Pearce, Frank Grima (+ vpss-testimonial.pdf), Yvette & Matt (Cartridge World Werribee), Rita Therese B, Helene V (x2), Michelle Chick (Ray White Werribee, + ray-white-testimonial.pdf).
- Services detail: AS/NZS 2293.2 six-monthly exit/emergency testing + logbook service, LED quality stance (no government scheme, Lighting Council of Australia suppliers, 90% home savings, 400W high-bay example), switchboard 7-question checklist + ceramic fuse danger, new-installation stages (rough in/fit off/handover) + underground power, full property-maintenance list.
- Assets: original logo (transparent PNG), iES footer monogram (CSS-inverted white on navy), hero factory photo, blue titlestrip banner, 3 service icons, both testimonial PDFs, favicon set.
- Original third-party credits (Mixing Bowl / Potent Web) intentionally dropped — TA Soft is the new vendor. Typo fixes: "recieve", "iContruct", "oour".

## QA (Playwright chromium) — 0 issues
- All 9 pages: HTTP 200, correct titles/H1s, zero broken images, zero console errors.
- All 22 URLs (pages + assets + PDFs + CSS/JS): 200.
- Desktop 1440px + mobile 390px: no horizontal overflow on any page.
- Nav: desktop Services dropdown hover/focus works (fixed a `.main-nav ul` specificity bug that pinned the dropdown open); mobile hamburger opens/navigates.
- Contact form: empty submit flags 3 required fields; valid submit shows the original success text ("Your enquiry has been received. We will be in touch shortly."). NOTE: form is front-end only — wire to an endpoint/mail service at sale time.
- Full-page screenshots in qa/.

## Cost & price
- Kimi K3 usage this session (state.db, session 20260731_05xx, cwd t_cf240288):
  input 140,483 tok ($0.42) + cache-read 5,134,166 tok ($1.54) + output 51,723 tok ($0.78) @ $3/$0.30/$15 per M.
- Build cost: ~US$2.80 (rounded, incl. final turns). Kimi balance after build: US$5.47.
- Suggested sale price (Boss curve, floor applies: $3–5 → $500): **US$500 (≈ A$750)**.

## Known limitations / next steps
- Enquiry form needs a backend (mailto:, Formspree, or platform endpoint) when deployed for the client.
- Original site had Google Analytics (G-TH9Z8KFHKP) — not carried over; add client's own ID at deploy time.
- HTTPS + real domain cutover is a deploy task (current serving is plain HTTP on :8080).
