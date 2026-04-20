"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Copy, Eye, PlusCircle, Printer } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import { useRecipes } from "@/hooks/use-recipes"

export function RecipeList() {
  const { recipes, printRecipe } = useRecipes()
  const [filter, setFilter] = useState<string | null>(null)

  const filteredRecipes = filter ? recipes.filter((recipe) => recipe.category === filter) : recipes

  const categories = Array.from(new Set(recipes.map((recipe) => recipe.category)))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === null ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No recipes found. Create your first recipe!</p>
          <Link href="/recipes/create">
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Recipe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{recipe.productCode}</CardTitle>
                  <Badge>{recipe.category}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Updated {formatDistanceToNow(recipe.updatedAt)} ago
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Version:</span> {recipe.version}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Total Weight:</span>{" "}
                    {recipe.ingredients.reduce((sum, i) => sum + i.weight, 0).toFixed(2)}g
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Ingredients:</span> {recipe.ingredients.length}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex w-full justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => printRecipe(recipe.id)}>
                    <Printer className="mr-2 h-3 w-3" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-3 w-3" />
                    Duplicate
                  </Button>
                </div>
                <Link href={`/recipes/${recipe.id}`}>
                  <Button size="sm">
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
