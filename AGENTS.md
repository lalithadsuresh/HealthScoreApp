# AGENTS.md

Guidance for AI agents working in this repository.

## Repository status

**HealthScoreApp** (`https://github.com/lalithadsuresh/HealthScoreApp`) is currently a **scaffold only**: the only tracked file is an empty `README.md`. There is no application source, no package manifests, no Docker/Compose setup, and no lint/test/build scripts yet.

Until application code lands, there is nothing to install beyond what the Cloud VM already provides, and no services to start for end-to-end testing.

## Cursor Cloud specific instructions

### What runs on VM startup

The update script is a no-op (`true`) because this repo has no dependency manifests. Do not add `npm install`, `pip install`, or similar until a lockfile or requirements file exists in the tree.

### Toolchain already on the VM

These are available without extra setup (versions may drift slightly on image updates):

| Tool | Notes |
|------|--------|
| **Git** | Repo root is `/workspace`; default branch `main` |
| **Node.js** | v22.x via nvm (`node`, `npm`, `pnpm`, `yarn`) |
| **Python** | 3.12 (`python3`, `pip`) |

Docker is not required for the current tree (no containers defined).

### Lint / test / build / run

No project commands exist yet. After code is added, document them here and in `README.md`, for example:

- Lint: TBD (e.g. `npm run lint`, `ruff check`)
- Test: TBD (e.g. `npm test`, `pytest`)
- Dev server: TBD (e.g. `npm run dev`)

### Services (when the app exists)

No required or optional services are defined today. When you add a backend, database, or frontend dev server, list startup order and ports in this section so future Cloud agents can run E2E flows without guessing.

### Gotchas

- **Do not assume monorepo layout** — there are no `apps/` or `packages/` directories yet.
- **No secrets or `.env.example`** — nothing to configure until the stack is chosen.
- If you add dependencies, update the VM **update script** via `SetupVmEnvironment` to match the lockfile (e.g. `npm ci` or `pnpm install --frozen-lockfile`) and add non-obvious startup notes here, not in the update script.
