# Haqqi

Haqqi (حقي) is a bilingual GCC-focused micro-SaaS for WPS compliance, gratuity calculation, employee roster management, and termination settlements.

## Features

- Arabic/English interface with RTL support
- Landing page with pricing and conversion-focused sections
- GCC gratuity calculator with explicit UAE and Saudi formulas
- Employee roster with Excel export
- UAE WPS/SIF generator
- Termination settlement summary with PDF export
- Executive dashboard with multi-company structure, onboarding, notifications placeholder, and audit trail
- Dark/light mode

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS 4
- Supabase client scaffold
- `next-themes`
- `jspdf`
- `xlsx`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start development:

```bash
npm run dev
```

4. Validate production readiness:

```bash
npm run typecheck
npm run lint
npm run build
```

## Routes

- `/en` and `/ar`
- `/[locale]/dashboard`
- `/[locale]/calculator`
- `/[locale]/employees`
- `/[locale]/wps`
- `/[locale]/settlements`

## Notes

- Supabase auth and persistence are scaffolded for future live integration.
- WPS output is a simplified SIF-style export suitable for demo and extension.
- Settlement PDF generation is implemented client-side for quick export workflows.
- See `PROJECT_MAP.md` for architecture, flow, and pending items.
