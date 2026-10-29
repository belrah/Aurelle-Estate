# Aurelle Estates

A responsive real estate website for Aurelle Limited in Lagos. Built with React, TypeScript strict mode, Vite, React Router, Tailwind CSS, Lucide, React Hook Form, Zod and Recharts.

## Run locally

Requires Node 22.12+ (validated on Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the Local URL shown by Vite. `npm run preview` serves a production build.
Use `npm ci` for reproducible installs from the committed `package-lock.json`; use `npm install` when intentionally changing dependencies. The development URL is `http://127.0.0.1:5173/` unless that port is occupied.

## Structure and entry point

`index.html` loads **`src/main.tsx`**, the main application entry point. It mounts the exported `App` into `#root`. `src/App.tsx` defines React Router routes, the shared header/footer, and most page components. The mortgage page is lazy-loaded separately. This is a client-rendered single-page application; the optional Guide server is a separate process.

The package manager is **npm**. The lockfile pins React/React DOM 19.3.1, React Router 7.18.5, TypeScript 5.9.3, Vite 7.3.7, React Hook Form 7.91.0, Zod 4.6.7, Recharts 3.10.1, Tailwind CSS 4.3.3, Lucide React 0.468.0, Vitest 4.1.12 and Playwright 1.64.1. Layout styling is primarily custom CSS with a Tailwind import. The installed Supabase SDK is not connected to a database.

## Brand and content

The supplied Aurelle logo is copied unchanged into `public/images/aurelle-logo.png`. Orange #D55B0A and navy #003467 were sampled directly from it. Dark orange #8F3500 is used for readable accent text. Editorial layouts use generous space, responsive photography and accessible native controls.

Montserrat is used for headings and Source Sans 3 for body text, with Source Sans Pro and Arial fallbacks. The tagline is **“Homes, land and stays, curated with care.”** Ivory #FAF7F2 and main text #1A1A1A follow the original brief. The supplied-logo orange and navy intentionally replace the brief’s earlier orange/deep blue. The city section and footer use navy, following the subsequent request. Branded raised surfaces and decorative tints remain additional palette colours; no gradients are used. Fonts and illustrative photography require external Google Fonts/Unsplash access; local fallbacks keep the interface usable when those services are unavailable.

All 14 specified public route patterns are implemented, plus a useful 404. Six sample listings span sales, rentals, land, short stays and Airbnb concepts. Six complete REED articles cover buying, renting, land, investment, hosting and legal basics. Sample data, unconfirmed details and draft legal content are labelled throughout. Images are illustrative Unsplash photography and do not depict verified listings.

Property filters combine category, location, price range, bedrooms, bathrooms, type and status. Detail pages include galleries/lightboxes, local browser saves, clipboard sharing, property-specific enquiry routes and similar listings. Rooms without supplied panoramic assets show an honest coming-soon state. Maps link to a neighbourhood search; a map view explains the missing integration.

The mortgage module uses fixed-payment amortization, validates inputs, handles zero interest, separates fees and renders annual balances and a repayment table. These are estimates and not mortgage offers. Contact and service links preselect enquiry type. Agent registration validates four steps, preserves in-page state and requires explicit draft-agreement consent.

The Agents link appears in both desktop and mobile navigation. `/agents` includes an agent-only recruitment hero, partnership benefits, an application journey, the supplied agency agreement introduction and preamble, and the full embedded four-step signup form. `/agents/sign-up` remains available as a dedicated registration page. Draft agreement version `draft-2026-02` covers agency relationship, duties, commission, indemnification and termination. No final commission rate or claim of legal approval is added.

## Checks

```sh
npm run lint
npm run typecheck
npm run test
npm run test:server
npm run build
npm run test:e2e
npm run secrets:check -- --dist
```

Playwright requires Chromium (`npx playwright install chromium`). It starts a local development server when necessary. Tests cover domain calculations, filtering, validation, cards, navigation, forms, wizard consent, save/share, article search, unknown routes, keyboard focus, and all 24 concrete pages at 360, 768, 1024 and 1440 px. Server tests use local HTTP requests and mocked upstream responses, not live Gemini calls. Test artifacts are ignored. `npm run secrets:check` scans working files and reachable Git history without printing matching credential values; `-- --dist` also scans the built browser output. Pattern scans reduce risk but are not a guarantee that every possible secret format is detectable.

## Project files

- `src/App.tsx`: shared shell, public pages and interaction components.
- `src/components/Common.tsx`: shared page headings, links and icon treatment.
- `src/pages/Mortgage.tsx`: calculator and education page, loaded separately so chart libraries stay out of the initial home bundle.
- `src/data.ts`: typed demonstration listings, editorial copy, services and centralized contact configuration.
- `src/logic.ts`: independent mortgage calculations, filtering, validation and draft agreement metadata.
- `src/styles.css`: responsive design tokens and layouts.
- `src/hooks/useFocusTrap.ts`: overlay keyboard focus, Escape handling, scroll locking and focus restoration.
- `tests/`: unit, component and end-to-end checks.
- `server/guide.mjs`: optional server-side Gemini adapter with bounded input and in-memory rate limiting.
- `scripts/check-secrets.mjs`: repeatable credential-pattern scan.

## Environment and integrations

Copy `.env.example` to `.env.local` only when configuring services. The initial site works without credentials. `VITE_ENQUIRY_ENDPOINT` is an optional public endpoint URL; it must validate requests server-side, apply rate limits, enforce the intended CORS policy and implement appropriate data handling. The frontend confirms acceptance only after a successful HTTP response. There is no default email delivery service.

The floating Aurelle Agent chat connects to WhatsApp and Telegram at +2348102180628 and Instagram @belhrah, as supplied by the business owner. Visitors choose a topic, draft a message and open their chosen app. WhatsApp and Telegram links prepare a message; Instagram offers a copy button before opening its direct-message link. Nothing is sent automatically and there is no on-site inbox, AI conversation or guaranteed agent availability. Telegram phone discovery and Instagram direct messages depend on the accounts’ privacy settings and installed apps. Public contact configuration is in `src/data.ts`; URL construction is in `src/features/chat/agent-chat.ts`.

The optional, unconnected Guide server reads `GEMINI_API_KEY` and `GEMINI_MODEL` from its environment, never from VITE variables. Run `node server/guide.mjs` behind your own reverse proxy and authentication/abuse controls if adding a separate AI feature. The server prompts the model to refer property-specific questions to enquiries and rejects common sensitive-input patterns. These checks are not a comprehensive PII filter or an authorization layer. It has no access to private applications. A real Gemini response has not been verified with production credentials.

Supabase is not configured. No database claims or fake persistence are made. Before introducing persistent enquiries or applications, implement a reviewed schema, published-only public read policies, authenticated owner access, private storage, server-side submission functions and staff authorization. No sensitive schema is deployed by this project. Anonymous property saves currently persist only in the current browser.

Business email, office hours, approved agreement text, real listings, external Airbnb booking URLs, genuine panoramas and video are not supplied. Those flows expose useful explanatory fallbacks. Banking/BVN fields remain disabled; document inputs permit local validation only and never upload their selections. No form response claims an application reference, subscription or delivery in demo mode. Newsletter signup and agent login are also demonstration/unavailable flows. Mortgage calculations are functional local estimates, not a connected lending service. The direct social chat links work independently of the demonstration enquiry forms.

## Secrets and GitHub preparation

Only the empty `.env.example` template belongs in Git. `.env*` files are ignored with that single template exception. `.gitignore` also excludes dependencies, build output, test reports, coverage, logs, common private-key files, credential JSON files and the `secrets/` directory. Never put credentials in any `VITE_` variable: these are public build-time browser settings. The hosting project ID is configuration, not an authentication token. Run the secret check and inspect `git diff` before committing or pushing. No GitHub push is performed by the checks.

## Deployment

`npm run build` outputs `dist/`. Run `npm run preview` to inspect that build locally. Deploy it to a static host with SPA fallback to `index.html`. `.openai/hosting.json` records the Sites project and output directory; the audience is managed separately in Sites settings. Source and deployment are versioned through Sites tooling. Publishing source to a GitHub repository does not deploy the website. GitHub Pages additionally needs an appropriate base path and a solution for SPA deep links; the current configuration targets a domain root with an SPA fallback. For another host, update the canonical origin in `src/App.tsx` and regenerate URLs in `public/sitemap.xml` and `public/robots.txt`. Do not expose environment secrets or service-role keys in the browser.

## Production review still required

Confirm real company information, review all sample/draft copy, replace photography with approved property assets, review legal/privacy/agency agreements with qualified Nigerian counsel, configure and verify delivery/authentication/private storage, add live observability and abuse prevention, and audit deployed access controls before collecting real applicant information. No claim of production readiness is made.
