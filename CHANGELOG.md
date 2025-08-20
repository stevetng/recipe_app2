# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Track ongoing changes here.

## [0.5.1] - Serverless polish: no-HTTP SSR for Vercel previews
- Frontend (SSR): `/recipes` and `/recipes/[id]` now read data in-process via `lib/recipes-server` (no HTTP fetch), avoiding Vercel preview protection 401s.
- Frontend (client): API routes remain for browser interactions (`/api/recipes`, `/api/recipes/[id]`, `/api/ai/shopping-list`).
- Types: tightened normalized recipe and `NutritionTotal` typing to match `Recipe`.
- Docs: updated README Candidate Notes to reflect the no-HTTP SSR setup.

## [0.5.0] - Serverless API for Vercel-only deployment
- Frontend: Moved backend logic into Next.js Route Handlers under `app/api`:
  - `GET /api/recipes` (filter/sort/paginate)
  - `GET /api/recipes/[id]`
  - `POST /api/ai/shopping-list` (aggregation + optional LLM)
- Frontend: Ported helpers to `lib/recipes-server.ts` and copied dataset to `data/data.json`.
- Frontend: Updated `lib/api.ts` to call relative `/api/...` routes (no external backend URL required).
- Build verified for Vercel deployment with optional `OPENAI_API_KEY` env.

## [0.4.1] - UI polish: home cleanup and recipe detail restyle
- Frontend: Removed the "Design System Visual Test" section from the Home page.
- Frontend: Restyled `/recipes/[id]` page to the new slate gradient design with badge color mapping, meta info row, gradient cards for Ingredients/Instructions, and improved Nutrition section.

## [0.4.0] - Shopping list selection and generation
- Frontend: Added `SelectionProvider` to manage selected recipe IDs (persisted to localStorage) and selection mode.
- Frontend: Added `ShoppingControls` (Grocery list toggle + Generate) positioned below the sort bar; shows hint when no items selected.
- Frontend: Selectable recipe grid in select mode with green hover and persistent green border for selected cards; click toggles selection.
- Frontend: `RecipesClient` wires Generate to POST `/ai/shopping-list` with selected IDs and shows aggregated items in a dialog (loading/error states included).
- Frontend: Added minimal `ui/dialog` for the popup.

## [0.3.1] - Favorites (localStorage) and instant filtering
- Frontend: Added `FavoritesProvider` to persist recipe IDs in `localStorage` and expose `isFavorite`, `toggleFavorite`, `favoritesCsv`.
- Frontend: Added `FavoriteButton` on each `RecipeCard` header.
- Frontend: Updated `SortMenu` with a Favorites toggle that:
  - Sets `favoritesOnly=1` and passes `favorites` CSV via URL
  - Reacts instantly to changes while active (unfavorited cards disappear immediately)
- Backend: `GET /recipes` favorites-only behavior updated to return 0 items when `favoritesOnly=1` with no `favorites` provided.

## [0.3.0] - Milestone 3: Filters, Sorting, and Unified UI Styling
- Frontend: Implemented `Filters` (searchable tags/ingredients, difficulty, time presets) with URL sync.
- Frontend: Implemented `SortMenu` (sortBy/sortOrder) with URL sync.
- Frontend: Switched `/recipes` to dynamic rendering to reflect URL changes immediately.
- Frontend: Unified dark slate gradient style across Home, Recipes list, and Recipe detail pages.
- Frontend: Redesigned `RecipeCard` to gradient card style; added `ui/badge` component.
- Frontend: Navigation updates
  - Home: orange CTA; visual test preserved.
  - Recipes: sticky header, title "Recipes" now acts as link back to Home (button removed).
  - Recipe detail: added Back to recipes and Home buttons.

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

## Overall Architecture

### Frontend Structure (`/frontend/`)

#### Core App Routes (`app/`)
- **`/`** (`page.tsx`): Home page with "Let's go" button
- **`/recipes`** (`recipes/page.tsx`): Recipe list with filters, sorting, favorites, selection
- **`/recipes/[id]`** (`recipes/[id]/page.tsx`): Individual recipe detail view

#### API Routes (`app/api/`)
- **`GET /api/recipes`** (`api/recipes/route.ts`): Filter/sort/paginate recipes
- **`GET /api/recipes/[id]`** (`api/recipes/[id]/route.ts`): Get single recipe
- **`POST /api/ai/shopping-list`** (`api/ai/shopping-list/route.ts`): Generate shopping lists with AI

#### Data Layer (`lib/`)
- **`api.ts`**: Client-side API helpers for browser interactions
- **`recipes-server.ts`**: Server-side data access (direct JSON reading, no HTTP)
- **`server-api.ts`**: Server-side API helpers for SSR
- **`utils.ts`**: Utility functions

#### State Management (`components/`)
- **`FavoritesProvider.tsx`**: Manages favorite recipe IDs (localStorage)
- **`SelectionProvider.tsx`**: Manages selected recipes for shopping lists (localStorage)

#### UI Components (`components/`)
- **`RecipesClient.tsx`**: Main recipe grid with selection/favorites
- **`RecipeCard.tsx`**: Individual recipe cards
- **`Filters.tsx`**: Search, tags, ingredients, difficulty, time filters
- **`SortMenu.tsx`**: Sorting controls
- **`ShoppingControls.tsx`**: Shopping list generation controls
- **`FavoriteButton.tsx`**: Heart icon for favoriting
- **`ui/`**: shadcn/ui components (button, card, dialog, badge)

#### Data & Types
- **`data/data.json`**: Recipe dataset (copied from backend)
- **`types/recipe.ts`**: TypeScript interfaces

### Backend Structure (`/backend/`) - Legacy
- **`src/server.js`**: Express server with same API endpoints
- **`db/data.json`**: Original recipe dataset
- Uses OpenAI for shopping list normalization