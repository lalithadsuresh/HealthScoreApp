# 3Bite — iOS (Expo)

React Native + Expo Router + TypeScript mobile app for **3Bite** / HealthScoreApp.

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your iPhone
- API server running (see repo root `README.md`)

## 1. Start the backend

```bash
# From repo root — MongoDB + API on port 3001
docker compose up -d   # or Homebrew MongoDB
cp server/.env.example server/.env
npm run install:all
npm run dev:server
```

The API must listen on **`0.0.0.0:3001`** so your phone can reach your Mac on the LAN.

## 2. Configure API URL for your iPhone

Copy `.env.example` to `.env` and set your Mac’s LAN IP (not `localhost`):

```bash
cd mobile
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3001
```

Find your Mac IP: **System Settings → Network**, or `ipconfig getifaddr en0`.

## 3. Run in Expo Go

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Camera** app (iOS) → opens in Expo Go.

Press `i` in the terminal for iOS Simulator (uses `localhost` for API if simulator runs on same Mac).

## Screens

| Route | Screen |
|-------|--------|
| `/` | Welcome |
| `/(auth)/login`, `/(auth)/signup` | Auth |
| `/(onboarding)/goals`, `/(onboarding)/sliders` | Onboarding |
| `/(tabs)` | Dashboard, Scan hub, Profile |
| `/scanner` | Camera barcode scan |
| `/search` | Product search |
| `/product/[barcode]` | Goal-based score result |
| `/legal/privacy`, `/legal/terms` | Legal |

## App Store prep (later)

- Use [EAS Build](https://docs.expo.dev/build/introduction/) for production iOS binaries
- Not configured in this MVP — Expo Go is the target for local testing

## Notes

- Camera permission is requested before scanning
- Account deletion: Profile → Delete account
- Scores are **goal-based nutrition support**, not medical advice
