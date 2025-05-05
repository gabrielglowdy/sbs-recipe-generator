"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Save, Trash2, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Ingredient, useRecipes } from "@/hooks/use-recipes"
import { FormulaInput } from "@/components/formula-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IngredientsList } from "@/components/ingredients-list"
import GeneralLayout from "@/components/general-layout"
import { toast } from "react-hot-toast"

export default function NewRecipePage() {
  const router = useRouter()
  const { recipes, addRecipe, getSupportedFunctions } = useRecipes()
  const functions = getSupportedFunctions()

  const [productCode, setProductCode] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      name: "",
      weight: 0,
      weightType: "fixed" as "fixed" | "percentage" | "combined",
      percentage: 0,
      formula: "",
      recipeId: "",
    },
  ])

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: "",
        weight: 0,
        weightType: "fixed" as "fixed" | "percentage" | "combined",
        percentage: 0,
        formula: "",
        recipeId: "",
      },
    ])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }

    // Reset fields when weight type changes
    if (field === "weightType") {
      if (value === "fixed") {
        delete newIngredients[index].percentage
        delete newIngredients[index].formula
        if (!newIngredients[index].weight) {
          newIngredients[index].weight = 0
        }
      } else if (value === "percentage") {
        delete newIngredients[index].formula
        delete newIngredients[index].weight
        if (!newIngredients[index].percentage) {
          newIngredients[index].percentage = 0
        }
      } else if (value === "combined") {
        delete newIngredients[index].percentage
        delete newIngredients[index].weight
        if (!newIngredients[index].formula) {
          newIngredients[index].formula = ""
        }
      }
    }

    // When selecting a recipe reference, update the name
    if (field === "recipeId" && value) {
      const referencedRecipe = recipes.find((r) => r.id === value)
      if (referencedRecipe) {
        newIngredients[index].name = `${referencedRecipe.productCode} Base`
      }
    }

    // When selecting "none" for recipe reference, clear the recipeId
    if (field === "recipeId" && value === "none") {
      delete newIngredients[index].recipeId
    }

    setIngredients(newIngredients)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!productCode || !category || ingredients.some((i) => !i.name)) {
      toast.error("Please fill all required fields")
      return
    }

    const newRecipe = {
      id: Date.now().toString(),
      productCode,
      category,
      description,
      ingredients: ingredients.map((i) => ({
        ...i,
        weight: typeof i.weight === "string" ? Number.parseFloat(i.weight) : i.weight,
        percentage: typeof i.percentage === "string" ? Number.parseFloat(i.percentage) : i.percentage,
      })),
      version: "1.0.0",
      createdAt: new Date(),
      updatedAt: new Date(),
      versionHistory: [],
    }

    addRecipe(newRecipe)
    router.push("/")
  }

  return (
    <GeneralLayout>
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to recipes
        </Link>

        {/* Formula Help Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Formula Help
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Formula Reference</DialogTitle>
              <DialogDescription>Use Excel-style formulas to create dynamic weight calculations.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Variables</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>x</code> or <code>weight</code>
                    <div className="text-xs text-muted-foreground mt-1">Current batch size</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Basic Operators</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>+</code>
                    <div className="text-xs text-muted-foreground mt-1">Addition (10 + 5)</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>-</code>
                    <div className="text-xs text-muted-foreground mt-1">Subtraction (10 - 5)</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>*</code>
                    <div className="text-xs text-muted-foreground mt-1">Multiplication (10 * 5)</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>/</code>
                    <div className="text-xs text-muted-foreground mt-1">Division (10 / 5)</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>^</code>
                    <div className="text-xs text-muted-foreground mt-1">Power (10 ^ 2)</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>%</code>
                    <div className="text-xs text-muted-foreground mt-1">Percent (50%)</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Available Functions</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {functions.map((func) => (
                    <div key={func} className="p-2 border rounded-md bg-muted/30">
                      <code>{func}()</code>
                      <div className="text-xs text-muted-foreground mt-1">
                        {{
                          SUM: "Sum values: SUM(1, 2, 3)",
                          AVERAGE: "Average values: AVERAGE(1, 2, 3)",
                          MIN: "Minimum value: MIN(1, 2, 3)",
                          MAX: "Maximum value: MAX(1, 2, 3)",
                          ROUND: "Round number: ROUND(3.14159, 2)",
                          FLOOR: "Round down: FLOOR(3.7)",
                          CEILING: "Round up: CEILING(3.2)",
                          ABS: "Absolute value: ABS(-5)",
                          POWER: "Power: POWER(2, 3)",
                          SQRT: "Square root: SQRT(9)",
                          LOG: "Natural logarithm: LOG(10)",
                          LOG10: "Base-10 logarithm: LOG10(100)",
                          EXP: "e^x: EXP(2)",
                          PI: "Returns π: PI()",
                          SIN: "Sine in radians: SIN(1)",
                          COS: "Cosine in radians: COS(1)",
                          TAN: "Tangent in radians: TAN(1)",
                          IF: "Conditional: IF(x > 10, 20, 10)",
                        }[func] || `${func} function`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Examples</h3>
                <div className="space-y-2">
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>x * 0.5</code>
                    <div className="text-xs text-muted-foreground mt-1">50% of batch size</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>POWER(x, 0.5)</code> or <code>x ^ 0.5</code>
                    <div className="text-xs text-muted-foreground mt-1">Square root of batch size</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>x ^ 2 / 100</code>
                    <div className="text-xs text-muted-foreground mt-1">Square of batch size divided by 100</div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>IF(x &gt; 100, x * 0.2, x * 0.1)</code>
                    <div className="text-xs text-muted-foreground mt-1">
                      20% of batch if size &gt; 100g, otherwise 10%
                    </div>
                  </div>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <code>ROUND(x * 0.333, 1)</code>
                    <div className="text-xs text-muted-foreground mt-1">
                      One-third of batch size rounded to 1 decimal place
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Recipe</CardTitle>
            <CardDescription>Create a new thermoplastic compound recipe with precise measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  placeholder="e.g. A212"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Prototype">Prototype</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the compound"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <IngredientsList
              ingredients={ingredients}
              recipes={recipes}
              onAddIngredient={addIngredient}
              onRemoveIngredient={removeIngredient}
              onUpdateIngredient={updateIngredient}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Recipe
            </Button>
          </CardFooter>
        </Card>
      </form>
    </GeneralLayout>
  )
}
