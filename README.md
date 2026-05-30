# 3Bite

**Personalized nutrition scanner** — choose your nutrition priorities, scan or search products, and get a custom 0–100 health score based on *your* goals (not a one-size-fits-all grade).

## Stack

- **Client:** React + Vite (mobile-first)
- **Server:** Node.js + Express
- **Database:** MongoDB
- **Product data:** [Open Food Facts](https://world.openfoodfacts.org)

## Quick start

### Prerequisites

- Node.js 20+
- Docker (for MongoDB) or a local MongoDB instance

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Start MongoDB

```bash
docker compose up -d
```

### 3. Configure API

```bash
cp server/.env.example server/.env
```

### 4. Run dev (API + web)

```bash
npm run dev
```

- Web app: http://localhost:5173  
- API: http://localhost:3001  

## User flow

1. Sign up / log in  
2. Onboarding — select goals + set importance sliders (0–10)  
3. Scan barcode, enter code, or search by name  
4. View personalized score, breakdown, explanations, and alternatives  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install root, server, and client deps |
| `npm run dev` | Run API and Vite dev servers |
| `npm run dev:server` | API only |
| `npm run dev:client` | Frontend only |
| `npm run build` | Build production client |

## Scoring

Each of your active goals contributes a subscore (0–100) based on per-100g nutrition and ingredient signals. Your slider weights (0–10) produce a weighted overall score — two users can see different scores for the same product.
