// Seed real customer/project data for the TA Soft Platform.
// Safe to run repeatedly: upserts by natural keys and removes demo rows.
const { db, seedAdmin } = require('../lib/db');
const { hashPassword } = require('../lib/auth');
const { suggestedPriceCents, money } = require('../lib/pricing');

seedAdmin();

// --- Idempotent upsert helpers ----------------------------------------------

function upsertCustomer({ name, company, email = '', phone = '', status = 'active', notes = '' }) {
  const existing = db.prepare("SELECT id FROM customers WHERE (email = ? AND email != '') OR company = ?").get(email, company);
  if (existing) {
    db.prepare('UPDATE customers SET name=?, company=?, email=?, phone=?, status=?, notes=? WHERE id=?')
      .run(name, company, email, phone, status, notes, existing.id);
    return existing.id;
  }
  const info = db.prepare('INSERT INTO customers (name, company, email, phone, status, notes) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, company, email, phone, status, notes);
  return info.lastInsertRowid;
}

function upsertWebsite({ customer_id, name, original_url = '', dev_url = '', prod_url = '', status, build_cost_cents, built_with = 'Hermes + Kimi K3', notes = '' }) {
  const suggested = suggestedPriceCents(build_cost_cents);
  const existing = db.prepare('SELECT id FROM websites WHERE name = ? AND customer_id = ?').get(name, customer_id);
  if (existing) {
    db.prepare(`UPDATE websites SET original_url=?, dev_url=?, prod_url=?, status=?, build_cost_cents=?, suggested_price_cents=?, built_with=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(original_url, dev_url, prod_url, status, build_cost_cents, suggested, built_with, notes, existing.id);
    return existing.id;
  }
  const info = db.prepare(`INSERT INTO websites (customer_id, name, original_url, dev_url, prod_url, status, build_cost_cents, suggested_price_cents, built_with, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(customer_id, name, original_url, dev_url, prod_url, status, build_cost_cents, suggested, built_with, notes);
  return info.lastInsertRowid;
}

function upsertEvent({ customer_id, title, details = '', event_type = 'note', build_cost_cents = 0, tool_stack = 'Hermes + Kimi K3', happened_at }) {
  const existing = db.prepare('SELECT id FROM customer_events WHERE customer_id = ? AND title = ?').get(customer_id, title);
  if (existing) {
    db.prepare('UPDATE customer_events SET details=?, event_type=?, build_cost_cents=?, tool_stack=?, happened_at=? WHERE id=?')
      .run(details, event_type, build_cost_cents, tool_stack, happened_at, existing.id);
    return existing.id;
  }
  const info = db.prepare(`INSERT INTO customer_events (customer_id, title, details, event_type, build_cost_cents, tool_stack, happened_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(customer_id, title, details, event_type, build_cost_cents, tool_stack, happened_at);
  return info.lastInsertRowid;
}

function ensureCustomerLogin({ email, password, customer_id }) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    db.prepare("UPDATE users SET customer_id = ?, role = 'customer' WHERE id = ?").run(customer_id, existing.id);
    return existing.id;
  }
  const info = db.prepare('INSERT INTO users (email, password_hash, role, customer_id) VALUES (?, ?, ?, ?)')
    .run(email, hashPassword(password), 'customer', customer_id);
  return info.lastInsertRowid;
}

// --- 0. Remove demo seed rows ------------------------------------------------
// Rivergum Plumbing was placeholder pipeline-demo data from the MVP seed.
// Karras was a mistaken login identity (Karras Cold Logistics is a Flash Line
// client, not a contact); the real login is created below.
for (const row of db.prepare("SELECT id FROM customers WHERE company = 'Rivergum Plumbing'").all()) {
  db.prepare('DELETE FROM customers WHERE id = ?').run(row.id); // cascades websites + events
}
db.prepare('DELETE FROM users WHERE email = ?').run('karras@flashline.com.au'); // sessions cascade
// Stale demo event from the MVP seed that doesn't match any real event title.
db.prepare('DELETE FROM customer_events WHERE title = ?').run('v1 website built');

// --- 1. Flash Line Transport --------------------------------------------------
// Build cost basis (Kimi K3 session tokens @ $3/M in, $0.30/M cache-read, $15/M out):
//   main build session (crawl + v1 build)  $17.07
//   full content remap + QA session         $1.46
//   total                                  $18.53 -> 1853 cents
const flashlineId = upsertCustomer({
  name: 'Indy Dasanayaka',
  company: 'Flash Line Transport',
  email: 'info@flashline.com.au',
  phone: '1300 352 745',
  status: 'active',
  notes: 'First replacement-website customer. Nationwide cold chain logistics (Sydney HQ, Melbourne, Brisbane, Kelso NSW). Founder Indy Dasanayaka; co-founder/CFO Anushka Dasanayaka.',
});

upsertWebsite({
  customer_id: flashlineId,
  name: 'flashline.com.au replacement',
  original_url: 'https://flashline.com.au',
  dev_url: 'http://209.38.25.82:8080/flashline.com.au/',
  prod_url: '',
  status: 'dev',
  build_cost_cents: 1853,
  notes: 'All original content carried over (Our Story eras, vision/mission, team, 5 news posts); 180/180 fact probes present; Playwright desktop+mobile QA clean. Cost basis: Kimi K3 tokens, main build $17.07 + content remap $1.46. Awaiting customer review; prod deploy after sale.',
});

upsertEvent({
  customer_id: flashlineId,
  title: 'Discovery + crawl',
  details: 'Crawled flashline.com.au (pages, assets, content probes); scope confirmed with Boss.',
  event_type: 'note',
  happened_at: '2026-07-31',
});

upsertEvent({
  customer_id: flashlineId,
  title: 'v1 replacement website built',
  details: 'Full replacement built from the crawl with Hermes + Kimi K3; initial desktop/mobile QA.',
  event_type: 'website',
  build_cost_cents: 1707,
  happened_at: '2026-07-31',
});

upsertEvent({
  customer_id: flashlineId,
  title: 'Full content remap + QA pass',
  details: 'All original content carried over professionally. 180/180 fact probes present; Playwright desktop+mobile QA clean (0 broken images, no overflow); synced into platform websites/.',
  event_type: 'website',
  build_cost_cents: 146,
  happened_at: '2026-07-31',
});

ensureCustomerLogin({
  email: 'info@flashline.com.au',
  password: 'Flashline!2026',
  customer_id: flashlineId,
});

// --- 2. iConstruct Electrical -------------------------------------------------
// Build cost basis (build report, Kimi K3 session tokens):
//   140,483 in + 5,134,166 cache-read + 51,723 out = $2.80 -> 280 cents
const iconstructId = upsertCustomer({
  name: 'iConstruct Electrical',
  company: 'iConstruct Electrical',
  email: 'info@iconstructelectrical.com.au',
  phone: '0412 249 151',
  status: 'active',
  notes: 'Replacement-website customer. Licensed electrician: domestic, commercial, emergency; switchboard upgrades, oven installs, LED lighting. AU.',
});

upsertWebsite({
  customer_id: iconstructId,
  name: 'iconstructelectrical.com.au replacement',
  original_url: 'https://www.iconstructelectrical.com.au',
  dev_url: 'http://209.38.25.82:8080/iconstructelectrical.com.au/',
  prod_url: '',
  status: 'dev',
  build_cost_cents: 280,
  notes: '9-page replacement preserving all original content (68/68 checks); Playwright desktop+mobile QA clean, all 22 URLs 200. Contact form is front-end only; wire endpoint at deploy. Cost basis per build report: $2.80 Kimi K3. Awaiting customer review.',
});

upsertEvent({
  customer_id: iconstructId,
  title: 'Discovery + crawl',
  details: 'Crawled iconstructelectrical.com.au; 9 pages in scope.',
  event_type: 'note',
  happened_at: '2026-07-31',
});

upsertEvent({
  customer_id: iconstructId,
  title: 'Replacement website built',
  details: '9-page replacement built with Hermes + Kimi K3; 68/68 content checks passed; Playwright desktop+mobile QA clean (0 issues across 22 URLs).',
  event_type: 'website',
  build_cost_cents: 280,
  happened_at: '2026-07-31',
});

ensureCustomerLogin({
  email: 'info@iconstructelectrical.com.au',
  password: 'iConstruct!2026',
  customer_id: iconstructId,
});

// --- Report -------------------------------------------------------------------

console.log('Seed complete (real project data; demo rows removed).');
for (const c of db.prepare('SELECT id, name, company, status FROM customers ORDER BY id').all()) {
  console.log(`  customer #${c.id}: ${c.name} — ${c.company} [${c.status}]`);
}
for (const w of db.prepare('SELECT name, status, build_cost_cents, suggested_price_cents FROM websites ORDER BY id').all()) {
  console.log(`  website: ${w.name} [${w.status}]: build ${money(w.build_cost_cents)} -> suggested ${money(w.suggested_price_cents)}`);
}
for (const e of db.prepare('SELECT c.company, e.title, e.build_cost_cents, e.happened_at FROM customer_events e JOIN customers c ON c.id = e.customer_id ORDER BY e.happened_at, e.id').all()) {
  console.log(`  event: [${e.company}] ${e.title} (${e.happened_at}) ${e.build_cost_cents ? money(e.build_cost_cents) : ''}`);
}
console.log('Customer logins: info@flashline.com.au / Flashline!2026 · info@iconstructelectrical.com.au / iConstruct!2026');
