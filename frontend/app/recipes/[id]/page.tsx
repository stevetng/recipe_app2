import { getRecipeNormalized } from "@/lib/recipes-server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Clock, Users, ChefHat } from "lucide-react";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipeNormalized(id);
  if (!recipe) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Recipe not found</h1>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/recipes">Back to recipes</Link>
          </Button>
        </div>
      </div>
    );
  }
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const difficultyClass = (d: string | undefined) => {
    const up = String(d || "").toUpperCase();
    if (up === "EASY") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (up === "MEDIUM") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (up === "HARD") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              <Link href="/recipes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to recipes
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">{recipe.name}</h1>
              <p className="text-xl text-slate-300 mb-4">{recipe.description}</p>
            </div>
            <Badge variant="outline" className={`ml-4 font-medium text-sm px-3 py-1 ${difficultyClass(recipe.difficulty)}`}>
              <ChefHat className="w-4 h-4 mr-1" />
              {String(recipe.difficulty || "").toUpperCase()}
            </Badge>
          </div>

          {/* Recipe Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-6 text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>
                Servings: <span className="text-white font-medium">{recipe.servings}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                Prep: <span className="text-white font-medium">{recipe.prepTimeMinutes} min</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                Cook: <span className="text-white font-medium">{recipe.cookTimeMinutes} min</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                Total: <span className="text-white font-medium">{totalTime} min</span>
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Ingredients */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4">
              <h2 className="text-white text-xl mb-2">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((i, idx) => (
                  <li key={idx} className="flex items-center text-slate-200">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 shrink-0"></span>
                    <span>
                      <span className="font-medium text-white">{i.amount} {i.unit}</span> {i.ingredientId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4">
              <h2 className="text-white text-xl mb-2">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-slate-200 leading-relaxed">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Nutrition Information */}
        {recipe.nutritionTotal && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4">
              <h2 className="text-white text-xl">Nutrition Information</h2>
              <p className="text-slate-400 text-sm">Per recipe</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{recipe.nutritionTotal.calories}</div>
                  <div className="text-slate-300 text-sm">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{recipe.nutritionTotal.protein}g</div>
                  <div className="text-slate-300 text-sm">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{recipe.nutritionTotal.carbs}g</div>
                  <div className="text-slate-300 text-sm">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{recipe.nutritionTotal.fat}g</div>
                  <div className="text-slate-300 text-sm">Fat</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 