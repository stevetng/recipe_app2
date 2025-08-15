# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Track ongoing changes here.

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