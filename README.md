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
- SSR data access (no HTTP): `/recipes` and `/recipes/[id]` read data in-process via `lib/recipes-server` to avoid preview protection 401s; API routes remain for client calls.
- State & UX
  - Favorites: `FavoritesProvider` stores IDs in `localStorage`; `FavoriteButton` on cards; sort bar toggle filters to favorites.
  - Shopping list: `SelectionProvider` manages selected recipe IDs; “Grocery list / Generate” controls; Generate calls `/api/ai/shopping-list` and displays items.
- Data fetching: `/recipes` page is dynamic to reflect URL changes immediately.

### Completed features
- Recipes list with search (name), filters (tags, ingredients), difficulty/time presets, and sorting (name/prep/cook/difficulty).
- Recipe detail page with ingredients, instructions, tags, and computed nutrition totals.
- Favorites with local persistence and instant filtering.
- Shopping list flow: select recipes, generate aggregated grocery list in a dialog.
- Serverless API for Vercel; no separate backend required.
- Consistent dark UI with gradient cards; sticky headers and clear navigation.

### Assumptions
- JSON is not large. 
- We don't care about auth or creating new recipes. 
- User doesn't care about data persistence.
- User knows about the grocery list feature. 
- User will search by name and not semantically. 

### Known limitations
- Currently loads all recipes then filters it in JS, long term use a real DB, caching, etc.
- Also every search scans the entire DB instead of more efficient search
- Client side local storage for the favorites/selections. 
- No auth for different users. 
- No way to create/add new recipes. Long term set up new APIs
- 

### With more time
- Add a real database. 
- User auth.
- Add new recipes.
- Suggestions based off of liked recipes. 