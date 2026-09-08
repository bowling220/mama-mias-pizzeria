# Mama Mia’s takeover preview

Deployed at https://mama-mias-pizzeria.vercel.app on Vercel. This is a password-protected evaluation site, not the operating restaurant’s ordering system. The existing business website is unchanged.

## Owner tools

Unlock the preview, then open `/admin` and use the separate owner password supplied privately. Manage menu names, descriptions, categories, sizes, prices, availability, homepage favorites, weekly/holiday hours, location information, service flags, announcements, scheduled specials and expansion listings. View test orders, their full modifiers/notes, kitchen status and the inquiry inbox. Kitchen/customer order status refreshes every 15 seconds.

71 catalog entries were transcribed from https://mamamiaserie.com/menu on September 8, 2026. Unavailable items remain disabled. Owner must reverify all prices, modifiers, hours and fulfillment before real trading. The hero photograph is illustrative stock, visibly labeled, not an actual Mama Mia’s product photo.

## Architecture

- React, TypeScript, Vite, React Router. Separate URL routes for home, menu, bag, orders, story, locations, location detail, contact, expansion interest, specials, privacy, accessibility and owner dashboard.
- Real Erie storefront identity reference plus enhanced responsive logo and chef badge; source and production files are documented in `BRAND.md`.
- `src/catalog.ts`: initial menu and integer-cent modifier pricing.
- `src/business.ts`: initial Erie location and America/New_York opening engine.
- Firestore `config/site`: persisted owner configuration (overrides defaults).
- Firestore `testOrders`, `messages`, `rateLimits`: test workflows and server throttling.
- `api/app.ts`: Vercel server API. Signed HttpOnly/Secure/SameSite session cookies, separate owner authorization, server validation, authoritative totals, idempotent order IDs, origin checks, honeypot and rate limits.
- Firebase project: `mama-mias-erie-preview`, Firestore `(default)` in `nam5`. No billing was enabled. Firebase Authentication is not used; authentication is implemented by the server session layer.
- Client Firestore access is denied by `firestore.rules`. Server service account has datastore-user access. Credentials are stored only as sensitive Vercel variables.

## Development and deployment

`npm ci`, `npm run lint`, `npm test`, `npm run build`.

Use `npx vercel dev` for local server/API development after configuring local environment variables. `npm run dev` runs the frontend alone; it does not emulate the API. Deploy with `npx vercel --prod --yes`. Rules: `firebase deploy --only firestore:rules --project mama-mias-erie-preview`.

Server environment variables: `FIREBASE_SERVICE_ACCOUNT` (JSON), `SESSION_SECRET` (random high-entropy value), `PREVIEW_PASSWORD`, `ADMIN_PASSWORD`. Never prefix these with `VITE_`, commit them, or put them in client code. Changing SESSION_SECRET invalidates all existing sessions.

`scripts/api-check.mjs` runs integration tests against TEST_URL (defaults to deployed site). Provide TEST_PREVIEW_PASSWORD and TEST_OWNER_PASSWORD through the environment. It creates clearly labeled QA test orders/inquiries, completes its own orders and round-trips existing configuration. Do not run against real customer ordering.

## Explicit launch gates

No payments, taxes, real order fulfillment, delivery dispatch, transactional email/SMS, loyalty accounts or legal franchise offering are active. The owner inbox is functional but sends no email. Additional listings do not automatically establish a new store’s menu/payment integration. These require business decisions/accounts before public launch.

The preview intentionally uses noindex/noarchive and a disallow-all robots policy. It does not publish a public SEO sitemap or structured ratings. Assets and the application bundle remain downloadable; the gate protects app access and server data, not the source code. Do not store sensitive personal data in test records.

The build uses lightweight CSS perspective/hover effects with reduced-motion support, not WebGL. Manual browser checks and automated tests are documented in QA.md. No Lighthouse score or formal WCAG certification is claimed.
