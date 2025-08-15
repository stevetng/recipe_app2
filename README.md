# Recipe Manager - Full Stack Take-Home Exercise

## Overview
Create a recipe management application that allows users to view, search, and organize recipes. This exercise tests your ability to build a full-stack web application with a focus on data relationships and user experience.

## Tips
- Use whatever frameworks/tools you're most comfortable with
- Focus on creating a working MVP before adding advanced features
- Be sure to document any assumptions or known limitations
- Test your application with different scenarios

## Setup Instructions

#### Backend setup
```
cd backend
npm install
npm run dev # Starts express server on port 8080
```

#### Frontend setup
```
cd frontend
npm install
npm run dev # Starts nextjs frontend server on port 3000
```

#### Database setup
```
The application uses a JSON file (`data.json`) as a mock database
```

**Note: Feel free to use whatever frontend or backend framework you want. The sample contains a Next.js + Express server scaffold, but use whatever you're comfortable with.**

## Requirements

#### Core Features (Required)
- Display a list of recipes with their basic information (`/recipes`)
- Implement recipe detail page (`/recipes/:id`) showing:
  - Ingredients with quantities
  - Cooking instructions
  - Tags
  - Nutritional information (calculated from ingredients)
- Add search/filter functionality on (`/recipes`) by:
  - Recipe name
  - Tags
  - Ingredients

#### Example Advanced Features (Bonus Points. Feel free to implement any of these or add your own. Some examples below)
- Implement dietary restriction filters (e.g., vegetarian, vegan, gluten-free)
- Create a calorie calculator based on serving size
- Add recipe scaling functionality (e.g., adjust ingredients for different serving sizes)
- Implement recipe favoriting/saving
- Add sorting options (prep time, difficulty, etc.)
- Add a "shopping list" generator for selected recipes
- Incorporate an LLM feature
- Types

## Evaluation Criteria
- Code organization and clarity
- UI/UX design and responsiveness
- API design and implementation
- Error handling and edge cases
- Performance considerations
- TypeScript/JavaScript best practices 

## Submission
1. Update this README with a new section below called `Candidate Notes:
   - Setup instructions if you've added any requirements
   - Brief explanation of your implementation choices
   - List of completed features
   - Any assumptions made
   - Known limitations or bugs
   - Additional features you'd add with more time
  

2. Send us (via email to scott.nguyen@sprx.tax & anthony.difalco@sprx.tax):
   - A zip file of the entire project (frontend and backend)
   - A link to a deployed version of the application (bonus points)


Good luck! We're excited to see your implementation.


## Candidate Notes

### Setup additions
- Vercel (single app):
  - Root Directory: `frontend`
  - Build: `npm run build`, Install: `npm install`
  - Optional env: `OPENAI_API_KEY` (enables LLM normalization for shopping list)
- Local dev (single app):
  - `cd frontend && npm install && npm run dev`

### Implementation choices
- Frontend: Next.js App Router + TypeScript, Tailwind CSS, shadcn-style primitives (`button`, `badge`, `card`), dark slate UI.
- Serverless API (Vercel): Next.js Route Handlers under `frontend/app/api` using `frontend/data/data.json`.
  - `GET /api/recipes` filter/sort/paginate; `GET /api/recipes/[id]`; `POST /api/ai/shopping-list` (aggregate + optional LLM).
- State & UX
  - Favorites: `FavoritesProvider` stores IDs in `localStorage`; `FavoriteButton` on cards; sort bar toggle filters to favorites.
  - Shopping list: `SelectionProvider` manages selected recipe IDs; “Grocery list / Generate” controls; Generate calls `/api/ai/shopping-list` and displays items.
- Data fetching: `/recipes` fetches server-side and calls relative `/api/...` routes; dynamic to reflect URL changes immediately.

### Completed features
- Recipes list with search (name), filters (tags, ingredients), difficulty/time presets, and sorting (name/prep/cook/difficulty).
- Recipe detail page with ingredients, instructions, tags, and computed nutrition totals.
- Favorites with local persistence and instant filtering.
- Shopping list flow: select recipes, generate aggregated grocery list in a dialog.
- Serverless API for Vercel; no separate backend required.
- Consistent dark UI with gradient cards; sticky headers and clear navigation.

### Assumptions
- Ingredient matching for filters accepts IDs; name fallback is case-insensitive.
- Favorites and selection persist in `localStorage` between sessions.
- Dataset size is small; serverless JSON read is sufficient for MVP.

### Known limitations
- No pagination/infinite scroll on `/recipes`.
- Filters list computed from current dataset in memory.
- Shopping list dialog is minimal (no grouping/export yet).
- Unit normalization is basic; LLM step is optional.

### With more time
- Add pagination and caching on the API routes.
- Client caching (SWR/React Query) for instant back/forward UX.
- Export/print shopping list; group by categories; quantity/unit normalization.
- Dedicated favorites view and persisted grocery lists.
- Accessibility polish and broader test coverage.

### Questions
- what if there's 100+ recipes? 
- what if i need to include user auth for users to see their own preferences?
- what if i wanted to create a new recipe? 
- what if i wanted a suggestions thing? 
- ie. if i like these recipes, these are recipes id also like? 