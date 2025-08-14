# Recipe Manager Implementation Plan (Next.js App Router + TypeScript + shadcn/ui)

## Goals
- Core: list recipes, recipe detail, search/filter by name/tags/ingredients, show ingredients, instructions, tags, nutrition (calculated), solid UX.
- Bonus: favorites/saving, sorting (prep time, difficulty, etc.), LLM-generated shopping list for selected recipes.
- Constraints: Use Next.js App Router and TypeScript on the frontend. Keep design system simple with shadcn/ui. Provide a home page with a "Let's go" button that routes into the app.

## High-level Architecture
- Frontend: Next.js (App Router) in `frontend/` using TypeScript.
  - Uses shadcn/ui for components and Tailwind CSS for styling.
  - Fetches data from backend Express API.
  - Client state for favorites and selected recipes (for shopping list) persisted in `localStorage`.
- Backend: Express server in `backend/` reading `backend/db/data.json` as a mock DB (initially JavaScript for speed; optional TS migration later).
  - Implements filter/sort/search on the server via query params.
  - Provides a route to generate an AI-assisted shopping list (OpenAI or provider-compatible API).

## Frontend Tech Choices
- Next.js App Router with TypeScript.
- Tailwind CSS for utility styling.
- shadcn/ui for accessible, unopinionated UI primitives (no DoorDash-specific theming).
- `lucide-react` for icons.

## Home Page ("/" route)
- Simple hero with app title/description and a primary CTA button labeled "Let's go".
- CTA navigates to `/recipes`.
- Keep accessible and keyboard-friendly.

## Data Model (JSON shape)
Recipe
- `id: string`
- `name: string`
- `description: string`
- `tags: string[]`
- `ingredients: { name: string; quantity: number; unit: string; nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number } }[]`
- `instructions: string[]`
- `prepTimeMinutes: number`
- `cookTimeMinutes: number`
- `difficulty: "easy" | "medium" | "hard"`
- `servings: number`
- `imageUrl?: string`
- `nutritionTotal?: { calories: number; protein: number; carbs: number; fat: number }` (computed)

Favorites (MVP)
- Persist a set of recipe IDs in `localStorage` (later could sync to backend if desired).

Selected for Shopping List (MVP)
- Persist a set of recipe IDs in `localStorage` for generating a shopping list.

## Backend API Design (Express)
Base URL: `http://localhost:8080`

- GET `/recipes`
  - Query params: `q` (search text), `tags` (comma-separated), `ingredients` (comma-separated), `sortBy` (`prepTimeMinutes|cookTimeMinutes|difficulty|name`), `sortOrder` (`asc|desc`), `limit`, `offset`.
  - Behavior: server-side filtering and sorting; pagination optional.

- GET `/recipes/:id`
  - Returns a single recipe with computed `nutritionTotal`.

- POST `/ai/shopping-list`
  - Body: `{ recipeIds: string[]; pantry?: { name: string; quantity?: number; unit?: string }[] }`
  - Behavior: aggregates ingredients across recipes, normalizes names/units, merges quantities; uses LLM to normalize/merge edge cases. Returns `{ items: { name: string; quantity: number; unit: string; notes?: string }[] }`.
  - Requires `OPENAI_API_KEY` (or provider) via env var. If not set, fall back to deterministic aggregation without LLM and include `notes`.

Implementation notes
- Nutrition calculation: sum ingredient-level nutrition fields when present; omit missing values gracefully. Compute on read to ensure consistency.
- Sorting: map `difficulty` to rank `easy=1, medium=2, hard=3` for stable sorting.

## Frontend (Next.js App Router, TypeScript)
Routes
- `/` (Home): title, brief description, and a "Let's go" button that routes to `/recipes`.
- `/recipes` (list + filters + sorting + selection + favorites toggle)
- `/recipes/[id]` (detail view)
- Optional: `/favorites` (filtered view) or a filter toggle in `/recipes`.

State
- `FavoritesContext`: set of recipe IDs; persisted to `localStorage`.
- `SelectionContext`: set of selected recipe IDs (for shopping list); persisted to `localStorage`.
- Search/filter/sort UI state stored in URL query params to enable deep-linking and SSR.

Styling & UI Library
- Tailwind configured with default theme (no special brand theming required). Keep sensible radii and spacing.
- shadcn/ui for primitives; icons with `lucide-react`.

Key Components (shadcn/ui powered)
- `Button`, `Badge`, `Card`, `Command` (search), `DropdownMenu`, `Dialog`, `Drawer` (mobile filters), `Select`, `Checkbox`, `Toggle`, `Tooltip`, `Skeleton`, `Toast`, `Popover`.
- App-specific components:
  - `RecipeCard` (title, tags, times, difficulty, favorite button, select checkbox)
  - `RecipeFilters` (wraps filter controls)
  - `SortMenu` (sort by name/prep/cook/difficulty asc/desc)
  - `Tag` chips
  - `IngredientList`
  - `NutritionFacts`
  - `FavoriteButton`
  - `ShoppingListPanel` (shows current selections and CTA to generate)

Data Fetching
- Use Next.js Server Components for `/recipes` and `/recipes/[id]` to fetch from the Express API.
- Hydrate client components for interactive controls (favorites, selection, filters UI).

LLM Shopping List UX
- Selection checkboxes on list and detail pages.
- Persistent floating action (or panel) to generate shopping list from selection.
- On click: call `/ai/shopping-list`, show loading state, then display result with copy, export (txt/csv), and print.

## Searchable Dropdown Filter UX
- A single Filters dropdown (button in the header) opens a panel (popover/dialog on desktop, drawer on mobile).
- Inside the dropdown:
  - Search input to filter available options live.
  - Multi-select sections for Tags and Ingredients (checkbox list with search).
  - Difficulty segmented control (easy/medium/hard).
  - Prep-time range (preset chips: `<15`, `15–30`, `30–60`, `>60`).
  - Optional toggle: Favorites only.
- Applied filters appear as removable chips under the header.
- URL Sync: serialize active filters to query params to enable shareable links and SSR.
- Accessibility: full keyboard navigation; ensure focus management when the dropdown opens/closes.

## Search / Filter / Sort Behavior
- Search `q`: matches recipe name substring (case-insensitive).
- Filter `tags`: union by default (discoverability); can add intersection toggle later.
- Filter `ingredients`: include recipes that contain ALL specified ingredients.
- Sort: client controls build query params; backend returns sorted results.

## Accessibility & UX
- Keyboard-accessible controls, visible focus states via Tailwind + shadcn/ui.
- Semantic HTML for lists and sections.
- Empty states for no results and error states with retry.

## Performance Considerations
- Server-side filtering/sorting to limit payloads.
- Basic pagination or infinite scroll.
- Memoize heavy calculations in backend and/or cache computed nutrition in-memory while the process runs.

## Testing Strategy (MVP)
- Backend: unit tests for filter/sort/nutrition aggregation, and shopping list aggregation utility (LLM mocked).
- Frontend: component tests for filters/sorting state serialization and favorites persistence; happy-path render tests for pages.

## Environment & Config
- Backend `.env`:
  - `OPENAI_API_KEY=...` (optional; if absent, fall back without LLM)
  - `PORT=8080`
- Frontend `.env.local`:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`

## Frontend Setup Tasks (TypeScript + Tailwind + shadcn/ui)
- Enable TypeScript in `frontend/` (Next.js will guide initial `tsconfig.json` if missing). Convert pages/components to `.tsx`.
- Install Tailwind and configure per Next.js docs. Include base directives in `globals.css` and configure `content` paths for App Router.
- Initialize shadcn/ui and add needed components (`button`, `card`, `badge`, `command`, `dropdown-menu`, `select`, `checkbox`, `dialog`, `drawer`, `tooltip`, `toast`, `popover`).
- Install `lucide-react` for icons.

## Deployment (Vercel + Backend host)
- Frontend on Vercel:
  - Connect `frontend/` to Vercel. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL.
  - Build: `npm install && npm run build` with Next.js defaults.
  - Manage env vars in Vercel Project Settings.
- Backend hosting options:
  - Option A (simple): Deploy Express to Render/Railway/Fly/Heroku. Keep `OPENAI_API_KEY` only on the backend host.
  - Option B (future): Migrate Express routes to Next.js Route Handlers (serverless) and deploy a single app on Vercel.
- Domain & CORS:
  - If separate hosts, enable CORS on backend for the Vercel domain.
  - Use HTTPS URLs for production.

## Milestones & Tasks
0) Frontend foundations (TypeScript + UI)
- Enable TypeScript; configure Tailwind; initialize shadcn/ui.
- Create `/` home page with title and "Let's go" button to `/recipes`.
- Build base layout and header.

1) Backend foundations
- Read `data.json`, compute nutrition totals on the fly.
- Implement GET `/recipes` with query filters and sorting.
- Implement GET `/recipes/:id`.

2) Recipe list & detail
- `/recipes` list page (Server Component data fetch) + `RecipeCard`.
- `/recipes/[id]` detail page with ingredients, instructions, tags, nutrition.

3) Filters dropdown and sorting
- Filters dropdown with searchable multi-select for tags and ingredients, difficulty control, time presets, and favorites toggle (using shadcn/ui primitives).
- Sync filters to URL; render active chips; wire to backend `/recipes`.
- Add `SortMenu` and persist choice in URL.

4) Favorites (local persistence)
- `FavoritesContext` with `localStorage` sync, `FavoriteButton` on card/detail.

5) Shopping list (aggregation + LLM)
- Selection UX + `SelectionContext`.
- Backend `/ai/shopping-list` route: aggregate + optional LLM normalization.
- Frontend `ShoppingListPanel` to display, copy, export.

6) Deploy
- Deploy backend; set env vars; enable CORS.
- Deploy frontend to Vercel; set `NEXT_PUBLIC_API_BASE_URL`.
- Smoke test production URLs.

7) Polish & resilience
- Empty/error/loading states; pagination or infinite scroll; accessibility pass.
- Basic tests for utilities and components.

## Success Criteria
- Home page with a working "Let's go" CTA into `/recipes`.
- Smooth recipe browsing with accurate filtering/sorting.
- Clear detail view with computed nutrition.
- Favorites persist across sessions.
- Shopping list generated for selected recipes; works without LLM key and improves with it. 