import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { FavoriteButton } from "@/components/FavoriteButton";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  const difficulty = (recipe.difficulty || "").toUpperCase();
  const tags = (recipe.tags || []).slice(0, 3);

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 min-h-[72px]">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate" title={recipe.name}>{recipe.name}</h2>
            <p className="text-slate-300 text-sm line-clamp-2">{recipe.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-medium">
              <ChefHat className="w-3 h-3 mr-1" />
              {difficulty}
            </Badge>
            <FavoriteButton id={recipe.id} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6">
          {tags.map((t) => (
            <Badge key={t} variant="outline" className="bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50">
              {t}
            </Badge>
          ))}
          {recipe.tags && recipe.tags.length > 3 && (
            <Badge variant="outline" className="bg-slate-800/50 text-slate-200 border-slate-600">+{recipe.tags.length - 3}</Badge>
          )}
        </div>

        {/* Recipe Info */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4" />
            <span>
              Servings: <span className="text-white font-medium">{recipe.servings}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4" />
            <span>
              Total time: <span className="text-white font-medium">{totalTime} min</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 transition-colors" size="lg">
          <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
        </Button>
      </CardContent>
    </Card>
  );
} 