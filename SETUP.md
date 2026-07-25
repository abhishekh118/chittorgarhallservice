# Chittorgarh All Services Frontend

Professional React + Vite frontend with separate CSS files for pages and components.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Update `VITE_API_URL` in `.env` with your backend URL.

## Demo data

Fake data is available in `src/data/demoData.json`.

Home, sector, nearby-help, city-guide, dashboard, groups and admin pages use this data automatically when their API is unavailable or returns an empty list.

## Production build

```bash
npm run build
```
