# 3Bite Mobile (Expo)

## Dev setup

```bash
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your Mac LAN IP for physical devices
npm run dev:server     # from repo root — API on :3001
npx expo start -c
```

## Routing

- **`/`** — unauthenticated welcome (`app/index.tsx`)
- **`/(tabs)/index`** — authenticated home
- **`/scanner`** — camera (only via **Start Scanning** + `intent=scan`)

If you see errors mentioning `app/(welcome)/_layout.tsx`, delete that folder locally — it was removed; run `npx expo start -c` after pulling.

## Routes

| Path | Screen |
|------|--------|
| `/` | Welcome |
| `/(auth)/login` | Log in |
| `/(tabs)/index` | Home |
| `/scanner` | Barcode camera |
