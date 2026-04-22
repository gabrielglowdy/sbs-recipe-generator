"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, RefreshCw, HelpCircle } from "lucide-react"
import type { Ingredient } from "@/hooks/use-recipes"
import { useRecipes } from "@/hooks/use-recipes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WeightCalculatorProps {
  ingredients: Ingredient[]
  onWeightsCalculated?: (newIngredients: Ingredient[]) => void
}

export function WeightCalculator({ ingredients, onWeightsCalculated }: WeightCalculatorProps) {
  const { recipes, evaluateFormula, calculateRecipeWeight, getSupportedFunctions } = useRecipes()
  const [batchSize, setBatchSize] = useState<number>(() => {
    // Calculate initial batch size from fixed weights
    return ingredients.reduce((sum, i) => sum + (i.weightType === "fixed" ? (i.weight ?? 0) : 0), 0)
  })

  const [calculatedIngredients, setCalculatedIngredients] = useState<Ingredient[]>(ingredients)
  const [formulaErrors, setFormulaErrors] = useState<Record<number, string>>({})

  // Get recipe names for referenced recipes
  const getRecipeName = (recipeId: string): string => {
    const recipe = recipes.find((r) => r.id === recipeId)
    return recipe ? recipe.productCode : "Unknown Recipe"
  }

  // Calculate total weight and percentages
  const calculateWeights = useCallback(() => {
    // Create a copy of ingredients to work with
    const newIngredients = [...ingredients]
    const newFormulaErrors: Record<number, string> = {}

    // Calculate weights for all ingredients
    newIngredients.forEach((ingredient, index) => {
      if (ingredient.recipeId && ingredient.recipeId !== "none") {
        // Recipe references should override any local weight fields.
        const referencedRecipeWeight = calculateRecipeWeight(ingredient.recipeId)
        newIngredients[index] = {
          ...ingredient,
          weight: referencedRecipeWeight,
        }
      } else if (ingredient.weightType === "fixed") {
        newIngredients[index] = {
          ...ingredient,
          weight: ingredient.weight ?? 0,
        }
      } else if (ingredient.weightType === "percentage" && ingredient.percentage !== undefined) {
        // Calculate weight based on percentage of batch size
        newIngredients[index] = {
          ...ingredient,
          weight: (ingredient.percentage / 100) * batchSize,
        }
      } else if (ingredient.weightType === "combined" && ingredient.formula) {
        // Evaluate the formula with batch size
        try {
          const calculatedWeight = evaluateFormula(ingredient.formula, batchSize)
          newIngredients[index] = {
            ...ingredient,
            weight: calculatedWeight,
          }
        } catch (error) {
          // If there's an error evaluating the formula, keep the existing weight
          // and record the error
          if (error instanceof Error) {
            newFormulaErrors[index] = error.message
          } else {
            newFormulaErrors[index] = "Invalid formula"
          }
        }
      } else {
        newIngredients[index] = {
          ...ingredient,
          weight: ingredient.weight ?? 0,
        }
      }
    })

    setCalculatedIngredients(newIngredients)
    setFormulaErrors(newFormulaErrors)

    if (onWeightsCalculated) {
      onWeightsCalculated(newIngredients)
    }
  }, [ingredients, batchSize, calculateRecipeWeight, evaluateFormula, onWeightsCalculated])

  // Recalculate when batch size changes
  useEffect(() => {
    calculateWeights()
  }, [calculateWeights])

  // Calculate total weight
  const totalWeight = calculatedIngredients.reduce((sum, i) => sum + (i.weight ?? 0), 0)

  // Get list of supported functions for the tooltip
  const supportedFunctions = getSupportedFunctions()
  const functionsList =
    supportedFunctions.slice(0, 10).join(", ") + (supportedFunctions.length > 10 ? ", and more..." : "")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            <CardTitle>Weight Calculator</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <div className="space-y-2 text-sm">
                  <p>Formula supports standard operators (+, -, *, /, ^) and functions:</p>
                  <p className="text-xs">{functionsList}</p>
                  <p>
                    Use <code>x</code> or <code>weight</code> to reference batch size
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Calculate ingredient weights based on batch size, percentages, and formulas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch-size">Batch Size (g)</Label>
            <div className="flex space-x-2">
              <Input
                id="batch-size"
                type="number"
                min="0.01"
                step="0.01"
                value={batchSize}
                onChange={(e) => setBatchSize(Number.parseFloat(e.target.value) || 0)}
              />
              <Button variant="outline" size="icon" onClick={calculateWeights} title="Recalculate">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Total Weight</Label>
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
              {totalWeight.toFixed(2)}g
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Ingredient</th>
                <th className="text-left py-2 px-4 font-medium">Type</th>
                <th className="text-left py-2 px-4 font-medium">Details</th>
                <th className="text-left py-2 px-4 font-medium">Weight (g)</th>
                <th className="text-right py-2 px-4 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {calculatedIngredients.map((ingredient, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">
                    {ingredient.name}
                    {ingredient.recipeId && ingredient.recipeId !== "none" && (
                      <span className="text-xs text-muted-foreground ml-1">({getRecipeName(ingredient.recipeId)})</span>
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
                          (x = batch size = {batchSize}g)
                          {formulaErrors[index] && <div className="text-destructive">{formulaErrors[index]}</div>}
                        </div>
                      </div>
                    )}
                    {ingredient.recipeId && ingredient.recipeId !== "none" && "Recipe Reference"}
                  </td>
                  <td className="py-2 px-4">{ingredient.weight.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right">
                    {totalWeight > 0 ? (((ingredient.weight ?? 0) / totalWeight) * 100).toFixed(2) : "0.00"}%
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

        <div className="md:hidden space-y-3 mt-4">
          {calculatedIngredients.map((ingredient, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-tight">{ingredient.name}</p>
                <p className="text-sm font-semibold">{(ingredient.weight ?? 0).toFixed(2)}g</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {ingredient.weightType === "fixed"
                  ? "Fixed"
                  : ingredient.weightType === "percentage"
                    ? `Percentage (${ingredient.percentage ?? 0}%)`
                    : "Combined"}
              </p>
              {ingredient.formula ? <p className="text-xs font-mono break-all">{ingredient.formula}</p> : null}
              <p className="text-xs text-muted-foreground">
                Share: {totalWeight > 0 ? (((ingredient.weight ?? 0) / totalWeight) * 100).toFixed(2) : "0.00"}%
              </p>
              {formulaErrors[index] ? <p className="text-xs text-destructive">{formulaErrors[index]}</p> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
