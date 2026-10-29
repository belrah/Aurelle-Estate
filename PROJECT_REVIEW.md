# Aurelle Estates — source review

Reviewed 29 October 2026. These findings apply to the current local source and production build. Review fixes have not been pushed to GitHub or deployed to Sites during this review.

## Structure and stack

| Path | Purpose |
| --- | --- |
| `index.html` | HTML document and React root; loads `src/main.tsx`. |
| `src/main.tsx` | Main application entry point; mounts React and `App`. |
| `src/App.tsx` | Router, shared header/footer and most public page components. |
| `src/components/Common.tsx` | Shared headings, links and icon treatment. |
| `src/pages/Mortgage.tsx` | Lazy-loaded calculator, chart and mortgage education. |
| `src/data.ts` | Six sample properties, six sample articles, services and business configuration. |
| `src/logic.ts` | Filtering, currency formatting, mortgage mathematics, validation and draft agreement. |
| `src/hooks/useFocusTrap.ts` | Overlay keyboard focus, Escape, scroll locking and focus restoration. |
| `src/styles.css` | Design tokens and responsive layouts. |
| `public/` | Supplied logo, robots, sitemap, manifest and a static-host SPA redirect rule. |
| `server/guide.mjs` | Separate, optional server-side Gemini adapter. |
| `tests/` | Vitest, Playwright and Node server tests. |
| `scripts/check-secrets.mjs` | Credential-pattern checks without printing credential values. |
| `.openai/hosting.json` | Sites project/output configuration; no authentication token. |

The stack is React 19, strict TypeScript, Vite 7 and React Router 7, with React Hook Form/Zod, Recharts, Lucide and custom responsive CSS with a Tailwind import. Supabase's SDK is installed but unused by a live integration. npm is the package manager; `package-lock.json` pins dependency versions. Review environment: Node 24.14.1 and npm 11.11.0. Most pages remain in `App.tsx`; extracting more page modules is a possible maintenance improvement, not a prerequisite for publishing the repository.

## Checks actually executed

| Check | Result |
| --- | --- |
| `npm ls --depth=0` | Passed; installed dependency tree is consistent. |
| `npm run lint` | Passed; React Hooks rules are now enabled. |
| `npm run typecheck` | Passed. |
| `npm run test` | 18 unit/component tests passed. |
| `npm run test:server` | 5 local/mocked server tests passed; no real Gemini response is claimed. |
| `npm run test:e2e` | 27 Chromium browser tests passed. |
| Focused mobile-menu rerun | Passed after adding closure on same-page navigation. |
| `npm run build` | Passed after the final source correction. |
| Production preview smoke | Passed for `/`, `/agents`, `/mortgage`, one property detail and `/contact`; deep links, the lazy calculator, brand styles and mobile search visibility checked. |
| `npm audit --json` | Zero known vulnerabilities reported for the locked dependency tree at review time. |
| Secret-pattern checks | No matches in working files, reachable Git history or generated browser assets. |
| Git ignore verification | Secret environment files and common private-key/credential file names are ignored; `.env.example` is intentionally tracked and empty. |

The browser suite visits all 24 concrete pages at **360, 768, 1024 and 1440 px**: 96 page/width checks. It checks one visible main heading, horizontal overflow, internal link targets, fragment targets and JavaScript page errors. Interaction tests cover navigation, property cards, category/location/price/bedroom/bathroom/type/status filters, clear filters, map fallback, keyboard-submitted home search, service CTAs, contact and inspection validation, agent steps/consent, save/share, article search, gallery controls, unknown routes, reduced motion and keyboard focus. Production screenshots were visually inspected at 360 and 1440 px.

Chromium was tested. Safari, Firefox, real-device touch behaviour, a comprehensive screen-reader audit and full WCAG AAA compliance have not been certified. Dependency audit results and pattern scans are point-in-time checks, not guarantees against every possible issue.

## Corrections made

- Preserved the existing application and routes; no feature replacement or test disabling.
- Fixed hero image animation causing horizontal overflow when reduced motion was off.
- Unified homepage search submission so keyboard Enter includes the selected property type.
- Fixed a zero maximum price being interpreted as an unlimited budget; location searches now trim accidental whitespace.
- Refreshed listing filters when query-string navigation changes and refreshed enquiry context when a different contact link is followed on the same route.
- Fixed saved status carrying over incorrectly when navigating between property detail pages; guarded malformed local save data.
- Added keyboard focus containment/restoration and Escape handling for mobile navigation and the gallery; made the mobile drawer scrollable and close on same-page links.
- Added explicit accessible names for filter selects, rejected separator-only phone numbers and blocked invalid profile uploads at the first agent step.
- Aligned the mortgage slider with the number input's allowed range.
- Corrected the optional Guide server's handling of null/invalid request bodies and added isolated boundary/error/rate-limit tests.
- Restored original ivory/body-text tokens and Source Sans Pro fallback; darkened the default muted text token from a measured 5.16:1 to 7.05:1 against the original ivory.
- Strengthened `.gitignore`, added a repeatable secret check, and corrected/expanded the README.

## Brand comparison

| Requirement | Finding |
| --- | --- |
| Supplied logo | Byte-for-byte hash comparison with the supplied PNG passed. |
| Accent | `#D55B0A`, sampled from the supplied logo, intentionally replaces the original `#CC4E00` following the user's instruction. |
| Primary navy | `#003467`, sampled from the supplied logo and used for primary actions and the subsequently requested city/footer backgrounds. This differs intentionally from the original deep blue `#00436F`. |
| Blue highlight/focus | `#0073D1`, as in the original brief. |
| Ivory / main body text | `#FAF7F2` / `#1A1A1A`, restored to the original values. Additional raised-surface tints remain. |
| Orange text | `#8F3500`, matching the original readable-orange token. |
| Typography | Montserrat headings and Source Sans 3 body text; Source Sans Pro/Arial fallbacks. |
| Tagline | “Homes, land and stays, curated with care.” Present and checked. |
| Layout | Editorial imagery, generous spacing, reusable cards, responsive navigation and no gradients. |

The result follows the brief plus the later logo, background and Agents-page changes. It is not an exact copy of every original colour or every proposed motion/detail feature.

## Demonstrations and remaining integration work

- Properties, prices, availability, photography, REED articles and leadership roles are illustrative. No live property database or administration system is connected.
- Contact/inspection forms validate and prepare enquiries. No default delivery service is connected. A configured endpoint can be called, but its real delivery/security behaviour has not been verified.
- Agent registration is a local four-step demonstration. Banking/BVN inputs are disabled. Documents are checked locally and not uploaded. No applications, consent records or identity documents are persisted; no application reference is fabricated. Agent authentication is unavailable.
- Anonymous property saves work in the current browser only. There is no authenticated saved-property backend.
- The mortgage calculator is functional local mathematics, not a lender integration, approval or confirmed financial offer.
- Newsletter signup checks email syntax but does not subscribe anyone. WhatsApp/Instagram contacts, office hours and external Airbnb booking URLs await verified details.
- Live maps, genuine 360° tours and the mortgage video are unavailable. No Pannellum viewer is installed; the room controls show honest panorama fallbacks.
- The Guide UI is unavailable; the optional server has mocked tests but no verified live Gemini integration. Production authentication, abuse prevention and sensitive-data controls still require work before exposing it publicly.
- Privacy, site terms and the agency agreement remain drafts requiring operator/professional review before real use.
- Some original presentation extras, including achievement counters/testimonial carousels and extensive timeline/scroll motion, are not implemented. This review did not invent business metrics or testimonials to fill those gaps.
- Canonical/sitemap URLs target the existing Sites origin. A different host needs updated URLs and SPA deep-link configuration; GitHub Pages also needs an appropriate base path and routing strategy.
- Google Fonts and Unsplash are external asset dependencies. The build emits harmless upstream Zod annotation warnings, without failing compilation.

## Commands to use next

From PowerShell:

```powershell
Set-Location 'C:\Users\DELL\Documents\ChatGPT\Aurelle Estate2'
npm ci
npx playwright install chromium
npm run dev
```

Stop the development server with Ctrl+C, or run checks in a second terminal:

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:server
npm run test:e2e
npm run build
npm run secrets:check -- --dist
git diff --check
git status --short
npm run preview
```

`npm ci` is the recommended fresh-install command; this review validated the existing dependency tree rather than reinstalling it. Review all changed and new files before committing. Confirm the intended GitHub repository/remote before pushing: existing Sites source configuration is not automatically the GitHub destination you want. Publishing this source is separate from making the unfinished integrations production-ready.
