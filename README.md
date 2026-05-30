# CloseMore Portal

A single-page insurance media portal (marketing site + client/admin dashboards).
Built with [Vite](https://vitejs.dev/) — vanilla HTML/CSS/JS, no framework.
All application state is stored client-side in `localStorage` (demo data is seeded
on first load).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
```

## Production build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the build locally
```

## Deploying on Railway

This repo is configured to deploy on [Railway](https://railway.com) out of the box:

1. Create a new Railway project → **Deploy from GitHub repo** → select this repo.
2. Railway uses Nixpacks (see `railway.json`):
   - **Build:** `npm run build`
   - **Start:** `npm run start` (runs `vite preview`)
3. `vite.config.js` binds the preview server to `0.0.0.0` on Railway's injected
   `$PORT` and allows Railway's `*.up.railway.app` domains.

No environment variables are required to run the app.

### Stripe checkout

The checkout screen embeds Stripe's `<stripe-buy-button>` web component
(the SDK is loaded in `index.html`). Replace the placeholders in
`app.js` (`showPlanCheckoutScreen`) with your own values before going live:

- `publishable-key` — your `pk_live_...` key
- `buy-button-id` — your real Buy Button IDs for Plan 1 and Plan 2

Payment "verification" in this build is mocked client-side; wire it to a real
backend/webhook before taking live payments.
