const { money } = require('./pricing');

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function centsInput(name, valueCents, label, extra = '') {
  const value = valueCents ? (Number(valueCents) / 100).toFixed(2) : '';
  return `<label>${esc(label)}<input type="number" min="0" step="0.01" name="${esc(name)}" value="${esc(value)}" ${extra}></label>`;
}

function layout({ title, user, content, notice }) {
  const nav = user ? `
    <a href="/dashboard">Dashboard</a>
    <a href="/customers">Customers</a>
    <a href="/websites">Websites</a>
    <a href="/payments">Payments</a>
    ${user.role === 'admin' ? '<a href="/users">Users</a>' : ''}
    <form method="post" action="/logout" class="inline"><input type="hidden" name="_csrf" value="${esc(user.csrf)}"><button type="submit">Log out</button></form>
  ` : '<a href="/login">Login</a>';
  return `<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · TA Soft Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public/styles.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/dashboard"><img src="/public/logo.svg" alt="TA Soft"></a>
    <nav>${nav}</nav>
  </header>
  <main class="wrap">
    ${notice ? `<div class="notice">${esc(notice)}</div>` : ''}
    ${content}
  </main>
</body>
</html>`;
}

function stat(label, value, hint = '') {
  return `<div class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
}

function moneyCell(cents) {
  return esc(money(cents));
}

module.exports = { esc, layout, stat, centsInput, moneyCell };
