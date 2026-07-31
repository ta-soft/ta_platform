const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

// Minimal zero-dependency .env loader (does not override real env vars).
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || match[1].startsWith('#')) continue;
    if (process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
})();
const { db, seedAdmin } = require('./lib/db');
const { verifyPassword, createSession, getSession, destroySession, parseCookies, SESSION_TTL_MS } = require('./lib/auth');
const { esc, layout, stat, centsInput, moneyCell } = require('./lib/views');
const { suggestedPriceCents, money } = require('./lib/pricing');

seedAdmin();

const PORT = Number(process.env.PORT || 8443);
const HOST = process.env.HOST || '0.0.0.0';
const COOKIE_NAME = 'ta_session';

function send(res, status, body, type = 'text/html; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body), ...headers });
  res.end(body);
}

function redirect(res, location, headers = {}) {
  res.writeHead(303, { Location: location, ...headers });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function form(body) {
  return Object.fromEntries(new URLSearchParams(body));
}

function toCents(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const session = getSession(db, cookies[COOKIE_NAME]);
  if (!session) return null;
  return { id: session.user_id, email: session.email, role: session.role, customer_id: session.customer_id, csrf: session.csrf, token: cookies[COOKIE_NAME] };
}

function requireAuth(req, res) {
  const user = currentUser(req);
  if (!user) {
    redirect(res, '/login');
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    redirect(res, '/dashboard?notice=Admin+access+required');
    return null;
  }
  return user;
}

function checkCsrf(user, data) {
  return user && data._csrf === user.csrf;
}

function customerAccess(user, customerId) {
  return user.role === 'admin' || Number(user.customer_id) === Number(customerId);
}

function pageNotice(url) {
  return url.searchParams.get('notice') || '';
}

function customerOptions(selected) {
  return db.prepare('SELECT id, name, company FROM customers ORDER BY name').all()
    .map((c) => `<option value="${c.id}" ${Number(selected) === c.id ? 'selected' : ''}>${esc(c.name)}${c.company ? ` · ${esc(c.company)}` : ''}</option>`).join('');
}

function websiteRow(w) {
  return `<tr>
    <td><a href="/websites/${w.id}">${esc(w.name)}</a><small>${esc(w.customer_name || '')}</small></td>
    <td>${esc(w.status)}</td>
    <td>${moneyCell(w.build_cost_cents)}</td>
    <td><strong>${moneyCell(w.suggested_price_cents)}</strong></td>
    <td>${w.dev_url ? `<a href="${esc(w.dev_url)}" target="_blank" rel="noreferrer">dev</a>` : ''}${w.prod_url ? ` · <a href="${esc(w.prod_url)}" target="_blank" rel="noreferrer">prod</a>` : ''}</td>
  </tr>`;
}

function eventRow(e) {
  return `<article class="event">
    <div><strong>${esc(e.title)}</strong><span>${esc(e.happened_at)}${e.tool_stack ? ` · ${esc(e.tool_stack)}` : ''}</span></div>
    ${e.details ? `<p>${esc(e.details)}</p>` : ''}
    ${e.build_cost_cents ? `<small>Build cost: ${moneyCell(e.build_cost_cents)}</small>` : ''}
  </article>`;
}

async function handle(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/public/')) {
    const file = path.join(__dirname, pathname);
    if (!file.startsWith(__dirname) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
    const type = file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=300' });
    return fs.createReadStream(file).pipe(res);
  }

  if (req.method === 'GET' && pathname === '/login') {
    return send(res, 200, layout({ title: 'Login', user: null, notice: pageNotice(url), content: `
      <section class="auth-card">
        <p class="eyebrow">TA Soft Platform</p>
        <h1>Sign in</h1>
        <p>Use your admin or customer account.</p>
        <form method="post" action="/login" class="stack">
          <label>Email<input name="email" type="email" autocomplete="username" required></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
          <button class="button" type="submit">Sign in</button>
        </form>
      </section>` }));
  }

  if (req.method === 'POST' && pathname === '/login') {
    const data = form(await readBody(req));
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(data.email || '').trim());
    if (!user || !verifyPassword(data.password || '', user.password_hash)) {
      return redirect(res, '/login?notice=Invalid+email+or+password');
    }
    const session = createSession(db, user.id);
    return redirect(res, '/dashboard', {
      'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(session.token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    });
  }

  if (req.method === 'POST' && pathname === '/logout') {
    const user = requireAuth(req, res); if (!user) return;
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    destroySession(db, user.token);
    return redirect(res, '/login?notice=Signed+out', { 'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }

  if (req.method === 'GET' && (pathname === '/' || pathname === '/dashboard')) {
    const user = requireAuth(req, res); if (!user) return;
    if (user.role === 'admin') {
      const customers = db.prepare('SELECT COUNT(*) c FROM customers').get().c;
      const websites = db.prepare('SELECT COUNT(*) c FROM websites').get().c;
      const cost = db.prepare('SELECT COALESCE(SUM(build_cost_cents),0) s FROM websites').get().s;
      const suggested = db.prepare('SELECT COALESCE(SUM(suggested_price_cents),0) s FROM websites').get().s;
      const recentWebsites = db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id ORDER BY w.updated_at DESC LIMIT 6').all();
      const recentEvents = db.prepare('SELECT e.*, c.name customer_name FROM customer_events e JOIN customers c ON c.id=e.customer_id ORDER BY e.happened_at DESC, e.id DESC LIMIT 6').all();
      return send(res, 200, layout({ title: 'Dashboard', user, notice: pageNotice(url), content: `
        <section class="hero-card">
          <p class="eyebrow">Command center</p>
          <h1>Customers, websites, costs and delivery history.</h1>
          <p>Track what was built, what it cost, what we should sell it for, and how to access dev/prod.</p>
        </section>
        <section class="stats">${stat('Customers', customers)}${stat('Websites', websites)}${stat('Build cost', money(cost))}${stat('Suggested sales', money(suggested))}</section>
        <div class="grid-2">
          <section class="panel"><div class="panel-head"><h2>Recent websites</h2><a href="/websites/new">New website</a></div><table><tbody>${recentWebsites.map(websiteRow).join('') || '<tr><td>No websites yet.</td></tr>'}</tbody></table></section>
          <section class="panel"><div class="panel-head"><h2>Recent history</h2><a href="/customers">Add via customer</a></div>${recentEvents.map(eventRow).join('') || '<p>No history yet.</p>'}</section>
        </div>` }));
    }
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(user.customer_id);
    const websites = db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id WHERE w.customer_id = ? ORDER BY w.updated_at DESC').all(user.customer_id);
    const events = db.prepare('SELECT * FROM customer_events WHERE customer_id = ? ORDER BY happened_at DESC, id DESC LIMIT 10').all(user.customer_id);
    return send(res, 200, layout({ title: 'Dashboard', user, notice: pageNotice(url), content: `
      <section class="hero-card"><p class="eyebrow">Customer portal</p><h1>${esc(customer?.name || 'Welcome')}</h1><p>Project access, history and website links.</p></section>
      <div class="grid-2">
        <section class="panel"><div class="panel-head"><h2>Your websites</h2></div><table><tbody>${websites.map(websiteRow).join('') || '<tr><td>No websites yet.</td></tr>'}</tbody></table></section>
        <section class="panel"><div class="panel-head"><h2>History</h2></div>${events.map(eventRow).join('') || '<p>No history yet.</p>'}</section>
      </div>` }));
  }

  if (req.method === 'GET' && pathname === '/customers') {
    const user = requireAuth(req, res); if (!user) return;
    if (user.role !== 'admin') return redirect(res, `/customers/${user.customer_id}`);
    const customers = db.prepare(`SELECT c.*, COUNT(w.id) websites, COALESCE(SUM(w.suggested_price_cents),0) suggested FROM customers c LEFT JOIN websites w ON w.customer_id=c.id GROUP BY c.id ORDER BY c.name`).all();
    return send(res, 200, layout({ title: 'Customers', user, notice: pageNotice(url), content: `
      <section class="panel"><div class="panel-head"><h1>Customers</h1><a href="/customers/new">New customer</a></div>
      <table><thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Websites</th><th>Suggested</th></tr></thead><tbody>
      ${customers.map((c) => `<tr><td><a href="/customers/${c.id}">${esc(c.name)}</a><small>${esc(c.company || '')}</small></td><td>${esc(c.email || '')}${c.phone ? `<small>${esc(c.phone)}</small>` : ''}</td><td>${esc(c.status)}</td><td>${c.websites}</td><td>${moneyCell(c.suggested)}</td></tr>`).join('') || '<tr><td>No customers yet.</td></tr>'}
      </tbody></table></section>` }));
  }

  if (req.method === 'GET' && pathname === '/customers/new') {
    const user = requireAdmin(req, res); if (!user) return;
    return send(res, 200, layout({ title: 'New customer', user, content: `
      <section class="panel narrow"><h1>New customer</h1><form method="post" action="/customers" class="stack">
        <input type="hidden" name="_csrf" value="${esc(user.csrf)}">
        <label>Name<input name="name" required></label>
        <label>Company<input name="company"></label>
        <label>Email<input name="email" type="email"></label>
        <label>Phone<input name="phone"></label>
        <label>Status<input name="status" value="active"></label>
        <label>Notes<textarea name="notes" rows="4"></textarea></label>
        <button class="button" type="submit">Create customer</button>
      </form></section>` }));
  }

  if (req.method === 'POST' && pathname === '/customers') {
    const user = requireAdmin(req, res); if (!user) return;
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    const info = db.prepare('INSERT INTO customers (name, company, email, phone, status, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(String(data.name || '').trim(), String(data.company || '').trim(), String(data.email || '').trim(), String(data.phone || '').trim(), String(data.status || 'active').trim(), String(data.notes || '').trim());
    return redirect(res, `/customers/${info.lastInsertRowid}?notice=Customer+created`);
  }

  const customerMatch = pathname.match(/^\/customers\/(\d+)$/);
  if (customerMatch && req.method === 'GET') {
    const user = requireAuth(req, res); if (!user) return;
    const id = Number(customerMatch[1]);
    if (!customerAccess(user, id)) return redirect(res, '/dashboard?notice=Not+authorized');
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) return send(res, 404, 'Customer not found', 'text/plain');
    const websites = db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id WHERE customer_id = ? ORDER BY updated_at DESC').all(id);
    const events = db.prepare('SELECT * FROM customer_events WHERE customer_id = ? ORDER BY happened_at DESC, id DESC').all(id);
    const isAdmin = user.role === 'admin';
    return send(res, 200, layout({ title: customer.name, user, notice: pageNotice(url), content: `
      <section class="hero-card"><p class="eyebrow">Customer</p><h1>${esc(customer.name)}</h1><p>${esc(customer.company || '')}${customer.email ? ` · ${esc(customer.email)}` : ''}${customer.phone ? ` · ${esc(customer.phone)}` : ''}</p></section>
      <div class="grid-2">
        <section class="panel"><div class="panel-head"><h2>Details</h2></div>
          ${isAdmin ? `<form method="post" action="/customers/${id}" class="stack"><input type="hidden" name="_csrf" value="${esc(user.csrf)}">
            <label>Name<input name="name" value="${esc(customer.name)}" required></label>
            <label>Company<input name="company" value="${esc(customer.company || '')}"></label>
            <label>Email<input name="email" type="email" value="${esc(customer.email || '')}"></label>
            <label>Phone<input name="phone" value="${esc(customer.phone || '')}"></label>
            <label>Status<input name="status" value="${esc(customer.status)}"></label>
            <label>Notes<textarea name="notes" rows="4">${esc(customer.notes || '')}</textarea></label>
            <button class="button" type="submit">Save customer</button></form>` : `<dl class="facts"><dt>Status</dt><dd>${esc(customer.status)}</dd><dt>Notes</dt><dd>${esc(customer.notes || '—')}</dd></dl>`}
        </section>
        <section class="panel"><div class="panel-head"><h2>Websites</h2>${isAdmin ? `<a href="/websites/new?customer_id=${id}">New website</a>` : ''}</div><table><tbody>${websites.map(websiteRow).join('') || '<tr><td>No websites yet.</td></tr>'}</tbody></table></section>
      </div>
      <section class="panel"><div class="panel-head"><h2>History</h2></div>
        ${isAdmin ? `<form method="post" action="/customers/${id}/events" class="stack event-form"><input type="hidden" name="_csrf" value="${esc(user.csrf)}">
          <div class="grid-2"><label>Title<input name="title" placeholder="v1 website built" required></label><label>Date<input name="happened_at" type="date" value="${nowDate()}"></label></div>
          <label>Details<textarea name="details" rows="3" placeholder="Built v1 replacement website using Hermes + Kimi..."></textarea></label>
          <div class="grid-3"><label>Type<input name="event_type" value="website"></label>${centsInput('build_cost', 0, 'Build cost')}<label>Tool stack<input name="tool_stack" value="Hermes + Kimi"></label></div>
          <button class="button" type="submit">Add history</button></form>` : ''}
        ${events.map(eventRow).join('') || '<p>No history yet.</p>'}
      </section>` }));
  }

  const customerPostMatch = pathname.match(/^\/customers\/(\d+)$/);
  if (customerPostMatch && req.method === 'POST') {
    const user = requireAdmin(req, res); if (!user) return;
    const id = Number(customerPostMatch[1]);
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    db.prepare('UPDATE customers SET name=?, company=?, email=?, phone=?, status=?, notes=? WHERE id=?')
      .run(String(data.name || '').trim(), String(data.company || '').trim(), String(data.email || '').trim(), String(data.phone || '').trim(), String(data.status || 'active').trim(), String(data.notes || '').trim(), id);
    return redirect(res, `/customers/${id}?notice=Customer+saved`);
  }

  const eventMatch = pathname.match(/^\/customers\/(\d+)\/events$/);
  if (eventMatch && req.method === 'POST') {
    const user = requireAdmin(req, res); if (!user) return;
    const id = Number(eventMatch[1]);
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    db.prepare('INSERT INTO customer_events (customer_id, title, details, event_type, build_cost_cents, tool_stack, happened_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, String(data.title || '').trim(), String(data.details || '').trim(), String(data.event_type || 'note').trim(), toCents(data.build_cost), String(data.tool_stack || '').trim(), String(data.happened_at || nowDate()), user.id);
    return redirect(res, `/customers/${id}?notice=History+added`);
  }

  if (req.method === 'GET' && pathname === '/websites') {
    const user = requireAuth(req, res); if (!user) return;
    const rows = user.role === 'admin'
      ? db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id ORDER BY w.updated_at DESC').all()
      : db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id WHERE w.customer_id = ? ORDER BY w.updated_at DESC').all(user.customer_id);
    return send(res, 200, layout({ title: 'Websites', user, notice: pageNotice(url), content: `
      <section class="panel"><div class="panel-head"><h1>Websites</h1>${user.role === 'admin' ? '<a href="/websites/new">New website</a>' : ''}</div>
      <table><thead><tr><th>Name</th><th>Status</th><th>Build cost</th><th>Suggested</th><th>Access</th></tr></thead><tbody>${rows.map(websiteRow).join('') || '<tr><td>No websites yet.</td></tr>'}</tbody></table></section>` }));
  }

  if (req.method === 'GET' && pathname === '/websites/new') {
    const user = requireAdmin(req, res); if (!user) return;
    const selected = url.searchParams.get('customer_id');
    return send(res, 200, layout({ title: 'New website', user, content: websiteForm({ user, customers: customerOptions(selected), action: '/websites' }) }));
  }

  if (req.method === 'POST' && pathname === '/websites') {
    const user = requireAdmin(req, res); if (!user) return;
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    const cost = toCents(data.build_cost);
    const suggested = data.suggested_price ? toCents(data.suggested_price) : suggestedPriceCents(cost);
    const info = db.prepare(`INSERT INTO websites (customer_id, name, original_url, dev_url, prod_url, status, build_cost_cents, suggested_price_cents, built_with, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(Number(data.customer_id), String(data.name || '').trim(), String(data.original_url || '').trim(), String(data.dev_url || '').trim(), String(data.prod_url || '').trim(), String(data.status || 'dev').trim(), cost, suggested, String(data.built_with || 'Hermes + Kimi').trim(), String(data.notes || '').trim());
    return redirect(res, `/websites/${info.lastInsertRowid}?notice=Website+created`);
  }

  const websiteMatch = pathname.match(/^\/websites\/(\d+)$/);
  if (websiteMatch && req.method === 'GET') {
    const user = requireAuth(req, res); if (!user) return;
    const id = Number(websiteMatch[1]);
    const website = db.prepare('SELECT w.*, c.name customer_name FROM websites w JOIN customers c ON c.id=w.customer_id WHERE w.id = ?').get(id);
    if (!website) return send(res, 404, 'Website not found', 'text/plain');
    if (!customerAccess(user, website.customer_id)) return redirect(res, '/dashboard?notice=Not+authorized');
    const body = user.role === 'admin'
      ? websiteForm({ user, customers: customerOptions(website.customer_id), action: `/websites/${id}`, w: website })
      : `<section class="panel"><h1>${esc(website.name)}</h1><dl class="facts"><dt>Status</dt><dd>${esc(website.status)}</dd><dt>Build cost</dt><dd>${moneyCell(website.build_cost_cents)}</dd><dt>Suggested price</dt><dd>${moneyCell(website.suggested_price_cents)}</dd><dt>Built with</dt><dd>${esc(website.built_with || '')}</dd><dt>Dev</dt><dd>${website.dev_url ? `<a href="${esc(website.dev_url)}" target="_blank" rel="noreferrer">${esc(website.dev_url)}</a>` : '—'}</dd><dt>Prod</dt><dd>${website.prod_url ? `<a href="${esc(website.prod_url)}" target="_blank" rel="noreferrer">${esc(website.prod_url)}</a>` : '—'}</dd><dt>Notes</dt><dd>${esc(website.notes || '—')}</dd></dl></section>`;
    return send(res, 200, layout({ title: website.name, user, notice: pageNotice(url), content: body }));
  }

  if (websiteMatch && req.method === 'POST') {
    const user = requireAdmin(req, res); if (!user) return;
    const id = Number(websiteMatch[1]);
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    const cost = toCents(data.build_cost);
    const suggested = data.recalculate === '1' || !data.suggested_price ? suggestedPriceCents(cost) : toCents(data.suggested_price);
    db.prepare(`UPDATE websites SET customer_id=?, name=?, original_url=?, dev_url=?, prod_url=?, status=?, build_cost_cents=?, suggested_price_cents=?, built_with=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(Number(data.customer_id), String(data.name || '').trim(), String(data.original_url || '').trim(), String(data.dev_url || '').trim(), String(data.prod_url || '').trim(), String(data.status || 'dev').trim(), cost, suggested, String(data.built_with || '').trim(), String(data.notes || '').trim(), id);
    return redirect(res, `/websites/${id}?notice=Website+saved`);
  }

  if (req.method === 'GET' && pathname === '/users') {
    const user = requireAdmin(req, res); if (!user) return;
    const users = db.prepare('SELECT u.*, c.name customer_name FROM users u LEFT JOIN customers c ON c.id=u.customer_id ORDER BY u.role, u.email').all();
    return send(res, 200, layout({ title: 'Users', user, notice: pageNotice(url), content: `
      <div class="grid-2">
        <section class="panel"><h1>Users</h1><table><thead><tr><th>Email</th><th>Role</th><th>Customer</th></tr></thead><tbody>${users.map((u) => `<tr><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${esc(u.customer_name || '—')}</td></tr>`).join('')}</tbody></table></section>
        <section class="panel"><h2>Create user</h2><form method="post" action="/users" class="stack"><input type="hidden" name="_csrf" value="${esc(user.csrf)}">
          <label>Email<input name="email" type="email" required></label>
          <label>Password<input name="password" type="password" required></label>
          <label>Role<select name="role"><option value="customer">customer</option><option value="admin">admin</option></select></label>
          <label>Customer<select name="customer_id"><option value="">—</option>${customerOptions('')}</select></label>
          <button class="button" type="submit">Create user</button></form></section>
      </div>` }));
  }

  if (req.method === 'POST' && pathname === '/users') {
    const user = requireAdmin(req, res); if (!user) return;
    const data = form(await readBody(req));
    if (!checkCsrf(user, data)) return send(res, 403, 'Bad CSRF token', 'text/plain');
    const { hashPassword } = require('./lib/auth');
    db.prepare('INSERT INTO users (email, password_hash, role, customer_id) VALUES (?, ?, ?, ?)')
      .run(String(data.email || '').trim(), hashPassword(data.password || ''), data.role === 'admin' ? 'admin' : 'customer', data.customer_id ? Number(data.customer_id) : null);
    return redirect(res, '/users?notice=User+created');
  }

  if (req.method === 'GET' && pathname === '/payments') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, layout({ title: 'Payments', user, content: `<section class="panel narrow"><p class="eyebrow">To be built</p><h1>Payments</h1><p>Customer payment flows will live here. For now, track suggested sale prices on each website and close sales manually.</p></section>` }));
  }

  return send(res, 404, layout({ title: 'Not found', user: currentUser(req), content: '<section class="panel narrow"><h1>Not found</h1><p>That route does not exist.</p></section>' }));
}

function websiteForm({ user, customers, action, w = {} }) {
  return `<section class="panel narrow"><h1>${w.id ? 'Edit website' : 'New website'}</h1><form method="post" action="${esc(action)}" class="stack">
    <input type="hidden" name="_csrf" value="${esc(user.csrf)}">
    <label>Customer<select name="customer_id" required>${customers}</select></label>
    <label>Name<input name="name" value="${esc(w.name || '')}" required></label>
    <label>Original URL<input name="original_url" type="url" value="${esc(w.original_url || '')}"></label>
    <div class="grid-2"><label>Dev URL<input name="dev_url" value="${esc(w.dev_url || '')}"></label><label>Prod URL<input name="prod_url" value="${esc(w.prod_url || '')}"></label></div>
    <div class="grid-3"><label>Status<input name="status" value="${esc(w.status || 'dev')}"></label>${centsInput('build_cost', w.build_cost_cents || 0, 'Build cost')}${centsInput('suggested_price', w.suggested_price_cents || 0, 'Suggested price', 'placeholder="auto"')}</div>
    <label>Built with<input name="built_with" value="${esc(w.built_with || 'Hermes + Kimi')}"></label>
    <label>Notes<textarea name="notes" rows="4">${esc(w.notes || '')}</textarea></label>
    <div class="actions"><button class="button" type="submit">Save website</button>${w.id ? '<button class="button secondary" type="submit" name="recalculate" value="1">Recalculate suggested</button>' : ''}</div>
  </form></section>`;
}

function main() {
  const keyPath = path.join(__dirname, 'certs', 'dev-key.pem');
  const certPath = path.join(__dirname, 'certs', 'dev-cert.pem');
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('Missing dev certs. Run: bash scripts/make-dev-cert.sh');
    process.exit(1);
  }
  const server = https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, (req, res) => {
    handle(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) send(res, 500, 'Internal server error', 'text/plain');
      else res.end();
    });
  });
  server.listen(PORT, HOST, () => console.log(`TA Soft Platform listening on https://${HOST}:${PORT}`));
}

main();
