# Recipe Manager - Full Stack Take-Home Exercise

## Overview
Create a recipe management application that allows users to view, search, and organize recipes. This exercise tests your ability to build a full-stack web application with a focus on data relationships and user experience.

## Setup Instructions
1. Clone this repository to your local machine
2. Install dependencies and start both servers:

#### Backend setup
```
cd backend
npm install
npm run dev # Starts expressserver on port 8080
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

Note: Feel free to use whatever frontend or backend framework you want. The sample contains a Next.js + Express server scaffold, but use whatever you're comfortable with.

## Requirements

#### Core Features (Required)
- Display a list of recipes with their basic information
- Implement recipe detail view showing:
  - Ingredients with quantities
  - Cooking instructions
  - Tags
  - Nutritional information (calculated from ingredients)
- Add search/filter functionality by:
  - Recipe name
  - Tags
  - Ingredients

#### Advanced Features (Bonus Points. Feel free to implement any of these)
- Implement dietary restriction filters (e.g., vegetarian, vegan, gluten-free)
- Add a "shopping list" generator for selected recipes
- Create a calorie calculator based on serving size
- Add recipe scaling functionality (e.g., adjust ingredients for different serving sizes)
- Implement recipe favoriting/saving
- Add sorting options (prep time, difficulty, etc.)

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

## Tips
- Use whatever frameworks/tools you're most comfortable with
- Focus on creating a working MVP before adding advanced features
- Be sure to document any assumptions or known limitations
- Test your application with different scenarios

Good luck! We're excited to see your implementation.
