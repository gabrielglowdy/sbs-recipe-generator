"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, Copy, Edit, GitBranch, History, Calculator, Printer } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRecipes } from "@/hooks/use-recipes"
import { VersionHistory } from "@/components/version-history"
import { WeightCalculator } from "@/components/weight-calculator"
import GeneralLayout from "@/components/general-layout"

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { recipes, duplicateRecipe, evaluateFormula, printRecipe } = useRecipes()
  const [activeTab, setActiveTab] = useState("details")

  const recipeId = params.id as string
  const recipe = recipes.find((r) => r.id === recipeId)

  if (!recipe) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p>Recipe not found</p>
        <Link href="/">
          <Button className="mt-4">Back to recipes</Button>
        </Link>
      </div>
    )
  }

  const totalWeight = recipe.ingredients.reduce((sum, i) => sum + (i.weight || 0), 0)

  const handleDuplicate = () => {
    const newId = duplicateRecipe(recipe.id)
    router.push(`/recipes/${newId}`)
  }

  const handlePrint = () => {
    printRecipe(recipe.id)
  }

  // Get recipe name for referenced recipes
  const getRecipeName = (recipeId: string): string => {
    const referencedRecipe = recipes.find((r) => r.id === recipeId)
    return referencedRecipe ? referencedRecipe.productCode : "Unknown Recipe"
  }

  return (
    <GeneralLayout>
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to recipes
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {recipe.productCode}
              <Badge>{recipe.category}</Badge>
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Clock className="mr-1 h-3 w-3" />
              Last updated on {formatDate(recipe.updatedAt)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Link href={`/recipes/${recipe.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Recipe Details</TabsTrigger>
            <TabsTrigger value="calculator">
              <Calculator className="mr-1 h-4 w-4" />
              Weight Calculator
            </TabsTrigger>
            <TabsTrigger value="versions">
              <History className="mr-1 h-4 w-4" />
              Version History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recipe Information</CardTitle>
                <CardDescription>{recipe.description || "No description provided"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium flex items-center">
                      <GitBranch className="mr-1 h-3 w-3" />
                      {recipe.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Weight</p>
                    <p className="font-medium">{totalWeight.toFixed(2)}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(recipe.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingredients</p>
                    <p className="font-medium">{recipe.ingredients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">Name</th>
                        <th className="text-left py-2 px-4 font-medium">Type</th>
                        <th className="text-left py-2 px-4 font-medium">Details</th>
                        <th className="text-left py-2 px-4 font-medium">Weight (g)</th>
                        <th className="text-right py-2 px-4 font-medium">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.ingredients.map((ingredient, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">
                            {ingredient.name}
                            {ingredient.recipeId && ingredient.recipeId !== "none" && (
                              <div className="text-xs text-blue-600 mt-1">
                                <Link href={`/recipes/${ingredient.recipeId}`}>
                                  View {getRecipeName(ingredient.recipeId)} Recipe
                                </Link>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {ingredient.weightType === "fixed"
                              ? "Fixed"
                              : ingredient.weightType === "percentage"
                                ? "Percentage"
                                : "Combined"}
                          </td>
                          <td className="py-2 px-4">
                            {ingredient.weightType === "percentage" && `${ingredient.percentage}% of batch size`}
                            {ingredient.weightType === "combined" && ingredient.formula && (
                              <div>
                                <span className="font-mono text-sm">{ingredient.formula}</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  = {evaluateFormula(ingredient.formula, totalWeight).toFixed(2)}g
                                  <br />
                                  (x = batch size)
                                </div>
                              </div>
                            )}
                            {ingredient.recipeId && ingredient.recipeId !== "none" && "Recipe Reference"}
                          </td>
                          <td className="py-2 px-4">{(ingredient.weight ?? 0).toFixed(2)}</td>
                          <td className="py-2 px-4 text-right">
                            {(((ingredient.weight ?? 0) / totalWeight) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td className="py-2 px-4">Total</td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4">{totalWeight.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calculator">
            <WeightCalculator ingredients={recipe.ingredients} />
          </TabsContent>
          <TabsContent value="versions">
            <VersionHistory recipeId={recipe.id} />
          </TabsContent>
        </Tabs>
      </div>
    </GeneralLayout>
  )
}
