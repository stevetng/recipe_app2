# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Track ongoing changes here.

## [0.2.0] - Milestone 2: Recipe list & detail pages
- Frontend: Added `types/recipe.ts` for shared types.
- Frontend: Added API helpers in `lib/api.ts` with `NEXT_PUBLIC_API_BASE_URL` fallback.
- Frontend: Added shadcn-style `ui/card` primitives.
- Frontend: Implemented `/recipes` list page rendering `RecipeCard`s.
- Frontend: Implemented `/recipes/[id]` detail page with ingredients, instructions, tags, and nutrition.

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