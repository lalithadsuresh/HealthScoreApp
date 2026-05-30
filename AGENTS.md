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

### Gotchas

- API fails on boot if MongoDB is not running — start MongoDB first (`sudo docker compose up -d` in Cursor Cloud; see below).
- In Cursor Cloud VMs, Docker is not pre-installed. After one-time Docker setup, start the daemon if needed: `sudo dockerd > /tmp/dockerd.log 2>&1 &` (uses `fuse-overlayfs` in `/etc/docker/daemon.json`). Use `sudo docker compose` until your user is in the `docker` group.
- On macOS, `docker compose` fails with `Cannot connect to the Docker daemon` when Docker Desktop is not running — start it or use Homebrew `mongodb-community` (see README).
- `server/.env` is gitignored; copy from `server/.env.example` if missing.
- Barcode camera needs HTTPS or localhost; manual barcode entry works everywhere.
- Open Food Facts is public; some barcodes return incomplete nutrition (subscores default toward neutral).

### Lint / test

| Command | What it checks |
|---------|----------------|
| `npm run build` | Production Vite client build |
| `cd mobile && npm run lint` | Mobile TypeScript (`tsc --noEmit`) |
| `curl http://localhost:3001/api/health` | API + MongoDB connectivity |

No dedicated web-client lint or automated test suite in MVP.

### Long-running dev servers

Use a tmux session (e.g. `3bite-dev`) for `npm run dev` so API (:3001) and Vite (:5173) stay up across agent turns.
