# TA Soft Platform

Low-TCO customer/project platform for TA Soft.

## Stack
- Node 22 built-in `https`, `node:sqlite`, `crypto` — no npm dependencies.
- SQLite database in `data/` (gitignored).
- Session cookie auth with roles: `admin` and `customer`.
- Suggested sales price calculated from AI/build spend using Boss's priced-to-win curve.

## Run locally
```bash
cp .env.example .env   # optional; defaults work for dev
bash scripts/make-dev-cert.sh
node server.js
```

Open: `https://localhost:8443` (self-signed cert warning expected).

Default admin if no users exist:
- email: `dan@tasoft.pro`
- password: `TASoft!2026` — change for real use.

## Data model
- `users`: admin/customer login accounts.
- `customers`: customer registry.
- `customer_events`: history of what happened with each customer.
- `websites`: built websites, build cost, suggested price, dev/prod URLs.

## Seed demo data
```bash
npm run seed   # idempotent; adds demo customers, websites, events, customer login
```
Demo customer login: `karras@flashline.com.au` / `Flashline!2026`.

## Configuration
All config is via environment variables, optionally from a `.env` file
(loaded at startup; real environment variables always win). See `.env.example`.

| Var | Default | Purpose |
| --- | --- | --- |
| `ADMIN_EMAIL` | `dan@tasoft.pro` | First admin account (created only when no users exist) |
| `ADMIN_PASSWORD` | `TASoft!2026` | First admin password — override before first real boot |
| `PORT` | `8443` | HTTPS listen port |
| `HOST` | `0.0.0.0` | Listen address |

## Production notes
1. **Secrets**: set a strong `ADMIN_PASSWORD` in the environment or `.env`
   (mode `600`) before first boot so the seeded admin isn't the default.
2. **TLS**: `certs/dev-cert.pem` is self-signed for dev. For production either
   drop real cert/key PEMs into `certs/` (same filenames), or terminate TLS at
   a reverse proxy (Caddy/nginx) and run this app behind it.
3. **Service**: run under systemd, e.g.
   ```ini
   [Unit]
   Description=TA Soft Platform
   After=network.target

   [Service]
   WorkingDirectory=/opt/ta-soft-platform
   EnvironmentFile=/opt/ta-soft-platform/.env
   ExecStart=/usr/bin/node server.js
   Restart=always
   User=tasoft

   [Install]
   WantedBy=multi-user.target
   ```
4. **Backups**: the whole database is `data/ta-soft-platform.sqlite` (WAL mode).
   Nightly `sqlite3 data/ta-soft-platform.sqlite ".backup backup.sqlite"` or a
   file-level copy while the app is stopped is sufficient at this scale.
5. **TCO**: one Node process, one SQLite file, no npm dependencies —
   any $5 VPS runs it.
