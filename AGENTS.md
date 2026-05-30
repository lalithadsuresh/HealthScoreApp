# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Port | Required |
|---------|------|----------|
| MongoDB (`docker compose up -d`) | 27017 | Yes |
| Express API (`npm run dev:server`) | 3001 | Yes |
| Vite client (`npm run dev:client`) | 5173 | Yes for UI |

### First-time / startup

```bash
docker compose up -d
cp -n server/.env.example server/.env   # only if server/.env missing
npm run install:all
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to port 3001.

### VM update script

Runs `npm run install:all` at repo root (installs root, `server/`, and `client/`).

### Gotchas

- API fails on boot if MongoDB is not running — start `docker compose` first.
- On macOS, `docker compose` fails with `Cannot connect to the Docker daemon` when Docker Desktop is not running — start it or use Homebrew `mongodb-community` (see README).
- `server/.env` is gitignored; copy from `server/.env.example` if missing.
- Barcode camera needs HTTPS or localhost; manual barcode entry works everywhere.
- Open Food Facts is public; some barcodes return incomplete nutrition (subscores default toward neutral).

### Lint / test

No dedicated lint/test scripts in MVP. Verify with `npm run build` (client) and `curl http://localhost:3001/api/health`.
