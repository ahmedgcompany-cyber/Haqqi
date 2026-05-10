# PROJECT_MAP

## TECH_STACK
- Next.js 15 App Router
- TypeScript
- Tailwind CSS 4
- Supabase client wiring for auth/data integration
- `next-themes` for dark/light mode
- `jspdf` for settlement PDF generation
- `xlsx` for employee roster export
- Vercel-ready deployment target

## SYSTEM_FLOW
1. User enters bilingual workspace via `/en` or `/ar`.
2. Shared locale provider sets language, `dir`, and UI copy behavior.
3. Dashboard aggregates multi-company demo data for liability, onboarding, audit trail, and reminders.
4. Gratuity calculator applies country-specific formulas, with UAE and Saudi rules implemented explicitly.
5. Employee roster stores operational data in a feature-local UI state seeded from demo data and exports to Excel.
6. WPS generator converts UAE employee payroll inputs into a simple SIF-like text file for download.
7. Settlement generator combines gratuity, leave, notice, and deductions, then exports a bilingual PDF.
8. Supabase client scaffold is present for future real auth/database wiring.

## ARCHITECTURE
- `src/app/`
  - Root app shell, metadata, sitemap, robots, and locale routes.
  - `[locale]` segment contains route entry points for all user-facing pages.
- `src/components/`
  - `layout/` shared navigation, theme switcher, and language switcher.
  - `providers/` locale and theme providers.
  - `ui/` reusable design-system primitives in a shadcn-style pattern.
- `src/features/`
  - `marketing/` landing page and pricing experience.
  - `dashboard/` overview metrics and onboarding/audit surfaces.
  - `calculators/` gratuity logic and calculator UI.
  - `employees/` roster management and Excel export.
  - `wps/` SIF generation and preview.
  - `settlements/` final settlement calculation and PDF generation.
- `src/lib/`
  - Locale helpers, demo data, shared types, utils, and Supabase bootstrap.

## ORPHANS & PENDING
- Supabase auth, row-level security, and database schema are scaffolded but not yet connected to live tables.
- Email notifications are represented as product placeholders, not a live provider integration.
- WPS/SIF export uses a practical simplified record structure and may require bank-specific enrichment for production.
- PDF output is bilingual but does not yet embed a custom Arabic font for advanced Arabic shaping.
- No automated tests were added; validation currently relies on typecheck, lint, and production build.