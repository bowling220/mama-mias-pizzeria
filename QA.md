# Verification — September 8, 2026

- Production TypeScript/Vite build: passed.
- ESLint: passed, no errors or warnings.
- Vitest: 15 passing pricing, catalog, Eastern timezone, DST-season and holiday tests.
- Live API: 37 checks passed, including authentication, owner authorization, rejected invalid inputs, server-side totals, duplicate submission handling, cross-session isolation, inquiry persistence, kitchen status, settings validation/save and route HTTP responses.
- Browser: customized two large pepperoni pizzas, verified $25.10, submitted a test order, reloaded its receipt, opened the owner dashboard, changed status, and confirmed full kitchen notes/modifiers.
- Browser: contact form saved a QA inquiry and the same inquiry appeared in the owner inbox. Owner announcement save showed confirmation.
- Browser: search narrowed to Stromboli, favorite state persisted without clearing the filter, customizer opened and Escape closed it, mobile navigation opened and navigated correctly.
- Responsive: homepage and menu checked at 375, 430, 768, 1024 and 1440 pixels; no horizontal page overflow. Other public routes checked at 375 pixels. Dashboard landscape checked at 1024 × 600 without overflow.
- Mobile redesign pass: dedicated 375–700px layouts added for navigation, hero, featured cards, menu/search, bottom-sheet customizer, cart, story, locations, contact, footer and every owner-dashboard editor. Homepage, menu and customizer were visually rechecked at 375px after deployment.
- Browser route sweep: story, directory, Erie detail, expansion interest, specials, privacy, accessibility and custom not-found page rendered. Console error log was empty during the sweep.
- Keyboard: Tab reaches visible skip link; native dialog handles focus and Escape. Reduced-motion rules reviewed in CSS. This is a manual accessibility check, not a formal WCAG audit or automated Lighthouse score.
- Current address and telephone targets verified. Directions point to the West 38th Street address. No call was placed.
- QA orders/messages are clearly labeled and remain in the preview database. Automated check orders are Completed. No real payments, food preparation, restaurant emails or SMS were triggered.

Known launch gates are listed in README.md. Real business photography is still needed. Preview is deliberately unindexed, and client assets are not confidential.
