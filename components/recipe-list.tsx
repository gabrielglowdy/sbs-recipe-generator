"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Copy, Eye, PlusCircle, Printer } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import { useRecipes } from "@/hooks/use-recipes"
import type { RecipeFilters } from "@/components/recipe-filters"

interface RecipeListProps {
  searchQuery?: string
  filters?: RecipeFilters
}

const EMPTY_FILTERS: RecipeFilters = {
  productUsed: "",
  dateCreated: "",
  userCreator: "",
  ingredientUsed: "",
  colorUsed: "",
  lastUpdatedDate: "",
  category: "",
  customerSpecific: "",
  productionResultDate: "",
}

const normalize = (value?: string) => value?.trim().toLowerCase() || ""

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10)

export function RecipeList({ searchQuery = "", filters = EMPTY_FILTERS }: RecipeListProps) {
  const { recipes, printRecipe } = useRecipes()

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesTitle = normalize(recipe.productCode).includes(normalize(searchQuery))

    const matchesProductUsed =
      !filters.productUsed ||
      normalize(recipe.productUsed || recipe.productCode).includes(normalize(filters.productUsed))

    const matchesDateCreated =
      !filters.dateCreated || toDateInputValue(recipe.createdAt) === filters.dateCreated

    const matchesUserCreator =
      !filters.userCreator || normalize(recipe.createdBy).includes(normalize(filters.userCreator))

    const matchesIngredientUsed =
      !filters.ingredientUsed ||
      recipe.ingredients.some((ingredient) => normalize(ingredient.name).includes(normalize(filters.ingredientUsed)))

    const matchesColorUsed =
      !filters.colorUsed ||
      normalize(recipe.colorName).includes(normalize(filters.colorUsed)) ||
        (recipe.colorings || []).some((coloring) => normalize(coloring.name).includes(normalize(filters.colorUsed)))

    const matchesLastUpdatedDate =
      !filters.lastUpdatedDate || toDateInputValue(recipe.updatedAt) === filters.lastUpdatedDate

    const matchesCategory = !filters.category || normalize(recipe.category).includes(normalize(filters.category))

    const matchesCustomerSpecific =
      !filters.customerSpecific || normalize(recipe.customerSpecific).includes(normalize(filters.customerSpecific))

    const matchesProductionResultDate =
      !filters.productionResultDate ||
      (recipe.productionResultNotes || []).some((note) => note.date === filters.productionResultDate)

    return (
      matchesTitle &&
      matchesProductUsed &&
      matchesDateCreated &&
      matchesUserCreator &&
      matchesIngredientUsed &&
      matchesColorUsed &&
      matchesLastUpdatedDate &&
      matchesCategory &&
      matchesCustomerSpecific &&
      matchesProductionResultDate
    )
  })

  return (
    <div className="space-y-6">
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No recipes match your search and filter settings.</p>
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
