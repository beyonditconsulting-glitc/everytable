# Breakroom Lead Finder

An internal tool for store managers to turn slow afternoon hours into B2B
leads: pull nearby gyms, medical clinics, schools, and offices within a
radius of the store, then generate a branded PDF flyer with a trackable
promo code and a draft outreach email — in one click per lead.

## How it works

1. **Set up your store** once: name, address, manager contact, and the
   promo/discount offer you want to run (e.g. `CLINIC20` for 20% off).
2. **Find leads**: pick a radius (0.5–5 miles) and business types, then
   search. Leads are pulled from a live map data source (see below).
3. **Per lead**: click **Generate flyer** to download a print-ready PDF
   with a unique trackable promo code and a QR code, or **Draft email**
   to get a personalized subject + body you can copy or open directly in
   your email client.
4. **Promo codes** page: every code generated for the store, who it was
   for, how it was sent (flyer/email), and a manual "mark redeemed"
   button for tracking redemptions at checkout.

Multiple stores are supported — switch between them from the top nav.

## Lead data source

- **Default (no setup needed): OpenStreetMap.** Geocoding via Nominatim,
  business search via the Overpass API. Free, no API key.
- **Optional upgrade: Google Places.** Set `GOOGLE_PLACES_API_KEY` in
  your environment (see `.env.example`) for better-curated results. When
  set, it's used instead of OpenStreetMap automatically.
- **Automatic fallback: demo data.** If OpenStreetMap returns nothing or
  is unreachable from your network, the app generates clearly-labeled
  sample leads (deterministic per store/radius) so the rest of the
  workflow can still be tested. A banner always tells you which source
  was used.

## Email sending

Emails are **drafted, not sent automatically**. The app has no SMTP
integration by design — the manager reviews the draft and sends it
themselves (copy to clipboard, or an "Open in email app" `mailto:` link).
This avoids needing mail credentials and keeps a human in the loop before
anything goes out to a real local business.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

If your network goes through an HTTP(S) proxy and you're on Node ≥22.21,
the `dev`/`start` scripts already set `NODE_USE_ENV_PROXY=1` so the
built-in `fetch` (used for geocoding/search) honors `HTTPS_PROXY`.

### Optional: Google Places

```bash
cp .env.example .env
# then set GOOGLE_PLACES_API_KEY in .env
```

## Data storage

Store profiles and promo codes are stored in `data/db.json` (gitignored),
a simple JSON file — no database setup needed. This is fine for a
single-instance internal tool; swap in a real database if you need
multi-instance deployment.

## Deploying

For shared hosting (e.g. Namecheap cPanel plans), see
[`docs/DEPLOY_NAMECHEAP.md`](docs/DEPLOY_NAMECHEAP.md). The app has no
native/system dependencies (PDF generation is pure JS), so it runs on
ordinary Node.js hosting — no headless browser or root access needed.

For any other Node.js host (VPS, Docker, etc.), it's a standard Next.js
app: `npm run build` then `npm start`, or `npm run start:passenger` /
`node server.js` for hosts (like cPanel's Node.js Selector) that expect a
single startup file listening on `process.env.PORT`.

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `pdfkit` renders the flyer PDF directly (no headless browser needed —
  works on ordinary shared hosting)
- `qrcode` for the flyer's redemption QR code
- Zod for API input validation
