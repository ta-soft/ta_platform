# TA Soft Platform

Source control for the TA Soft customer/project platform and built customer websites.

## Layout
- `platform/` — TA Soft Platform web app (Node 22, zero dependencies, built-in SQLite, HTTPS dev server).
- `websites/<domain>/` — built customer website replacements.

## Rules
- No secrets in git. Environment values live in `/home/hermes/.hermes/.env`.
- Every website entry should track build cost and suggested sales price in the platform.
