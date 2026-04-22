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
  const { recipes, duplicateRecipe, evaluateFormula, printRecipe, calculateRecipeWeight } = useRecipes()
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

  const totalWeight = recipe.ingredients.reduce((sum, i) => sum + (i.weight ?? 0), 0)
  const totalColoringWeight = (recipe.colorings ?? []).reduce((sum, i) => sum + (i.weight ?? 0), 0)
  const fullMixWeight = totalWeight + totalColoringWeight
  const batchReference = recipe.qtyOrderBatch ?? fullMixWeight

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

  const getIngredientWeight = (ingredient: { recipeId?: string; weight?: number }) => {
    if (ingredient.recipeId && ingredient.recipeId !== "none") {
      return calculateRecipeWeight(ingredient.recipeId)
    }
    return ingredient.weight ?? 0
  }

  const getIngredientTypeLabel = (type: "fixed" | "percentage" | "combined") => {
    if (type === "fixed") return "Fixed"
    if (type === "percentage") return "Percentage"
    return "Combined"
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
            <h1 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-2">
              {recipe.productCode}
              <Badge>{recipe.category}</Badge>
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Clock className="mr-1 h-3 w-3" />
              Last updated on {formatDate(recipe.updatedAt)}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDuplicate} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Link href={`/recipes/${recipe.id}/edit`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium flex items-center">
                      <GitBranch className="mr-1 h-3 w-3" />
                      {recipe.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Weight</p>
                    <p className="font-medium">{fullMixWeight.toFixed(2)}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(recipe.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingredients</p>
                    <p className="font-medium">{recipe.ingredients.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Colorings</p>
                    <p className="font-medium">{recipe.colorings?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product Used</p>
                    <p className="font-medium">{recipe.productUsed || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{recipe.customerSpecific || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{recipe.createdBy || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{recipe.orderDate || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Production Date</p>
                    <p className="font-medium">{recipe.productionDate || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Qty Order Batch</p>
                    <p className="font-medium">
                      {recipe.qtyOrderBatch !== undefined ? `${recipe.qtyOrderBatch.toFixed(2)}g` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LOT Number</p>
                    <p className="font-medium">{recipe.lotNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color Name</p>
                    <p className="font-medium">{recipe.colorName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade Name</p>
                    <p className="font-medium">{recipe.gradeName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hardness</p>
                    <p className="font-medium">{recipe.hardness || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Keterangan</p>
                  <p className="font-medium">{recipe.keterangan || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block overflow-x-auto">
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
                            {getIngredientTypeLabel(ingredient.weightType)}
                          </td>
                          <td className="py-2 px-4">
                            {ingredient.weightType === "percentage" && `${ingredient.percentage}% of batch size`}
                            {ingredient.weightType === "combined" && ingredient.formula && (
                              <div>
                                <span className="font-mono text-sm">{ingredient.formula}</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  = {evaluateFormula(ingredient.formula, batchReference).toFixed(2)}g
                                  <br />
                                  (x = batch size {batchReference.toFixed(2)}g)
                                </div>
                              </div>
                            )}
                            {ingredient.recipeId && ingredient.recipeId !== "none" && "Recipe Reference"}
                          </td>
                          <td className="py-2 px-4">{getIngredientWeight(ingredient).toFixed(2)}</td>
                          <td className="py-2 px-4 text-right">
                            {fullMixWeight > 0
                              ? ((getIngredientWeight(ingredient) / fullMixWeight) * 100).toFixed(2)
                              : "0.00"}
                            %
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td className="py-2 px-4">Total</td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4">{totalWeight.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right">
                          {fullMixWeight > 0 ? ((totalWeight / fullMixWeight) * 100).toFixed(2) : "0.00"}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-tight">{ingredient.name}</p>
                        <p className="text-sm font-semibold">{getIngredientWeight(ingredient).toFixed(2)}g</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{getIngredientTypeLabel(ingredient.weightType)}</p>
                      {ingredient.recipeId && ingredient.recipeId !== "none" ? (
                        <Link href={`/recipes/${ingredient.recipeId}`} className="text-xs text-blue-600 hover:underline">
                          View {getRecipeName(ingredient.recipeId)} Recipe
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Colorings</CardTitle>
              </CardHeader>
              <CardContent>
                {(recipe.colorings ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No coloring entries.</p>
                ) : (
                  <div className="space-y-3">
                    {(recipe.colorings ?? []).map((coloring, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{coloring.name}</p>
                            <p className="text-xs text-muted-foreground">{getIngredientTypeLabel(coloring.weightType)}</p>
                          </div>
                          <p className="text-sm font-semibold">{getIngredientWeight(coloring).toFixed(2)}g</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-sm font-semibold text-right">Total: {totalColoringWeight.toFixed(2)}g</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Production Result Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {(recipe.productionResultNotes ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No production result notes.</p>
                ) : (
                  <div className="space-y-4">
                    {(recipe.productionResultNotes ?? []).map((note) => (
                      <div key={note.id} className="rounded-lg border p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <p><span className="text-muted-foreground">Date:</span> {note.date || "-"}</p>
                          <p><span className="text-muted-foreground">Shift:</span> {note.shift || "-"}</p>
                          <p><span className="text-muted-foreground">LOT:</span> {note.lotNumber || "-"}</p>
                        </div>
                        <p className="text-sm"><span className="text-muted-foreground">Keterangan:</span> {note.keterangan || "-"}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <p><span className="text-muted-foreground">TS:</span> {note.testProperties?.ts ?? "-"}</p>
                          <p><span className="text-muted-foreground">EL:</span> {note.testProperties?.el ?? "-"}</p>
                          <p><span className="text-muted-foreground">AB:</span> {note.testProperties?.ab ?? "-"}</p>
                          <p><span className="text-muted-foreground">BJ:</span> {note.testProperties?.bj ?? "-"}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <p><span className="text-muted-foreground">ZAK Note:</span> {note.zakNote || "-"}</p>
                          <p><span className="text-muted-foreground">Measurement Note:</span> {note.measurementNote || "-"}</p>
                        </div>
                        <p className="text-sm"><span className="text-muted-foreground">Mesin Note:</span> {note.mesinNote || "-"}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <p>
                            <span className="text-muted-foreground">Color Approved:</span>{" "}
                            {note.colorApproved === undefined ? "-" : note.colorApproved ? "Yes" : "No"}
                          </p>
                          <p><span className="text-muted-foreground">Signature:</span> {note.signature || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calculator">
            <WeightCalculator ingredients={[...recipe.ingredients, ...(recipe.colorings ?? [])]} />
          </TabsContent>
          <TabsContent value="versions">
            <VersionHistory recipeId={recipe.id} />
          </TabsContent>
        </Tabs>
      </div>
    </GeneralLayout>
  )
}
