# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Track ongoing changes here.

## [0.1.0] - Milestone 1: Backend foundations optimizations
- Backend (`backend/src/server.js`):
  - Improved `parseMinutes` to handle hours/minutes formats (e.g., `1h 30m`, `15 min`).
  - Optimized GET `/recipes`: filter on raw data and normalize only the paged results for better performance.
  - Aggregation for `/ai/shopping-list` now returns `{ name, quantity, unit, notes? }` aligning with the plan.

## [0.0.1] - Milestone 0: Frontend setup (TypeScript + Tailwind + shadcn/ui)
- Frontend: Enabled TypeScript (added `tsconfig.json`, `next-env.d.ts`).
- Frontend: Installed Tailwind and configured (`tailwind.config.ts`, `postcss.config.js`, Tailwind directives in `app/globals.css`).
- Frontend: Added shadcn-style `Button` component and `lib/utils` helper.
- Frontend: Converted `app/layout` and `app/page` to `.tsx`.
- Frontend: Implemented Home page with "Let's go" CTA and a visual Button variants grid for design system verification. 