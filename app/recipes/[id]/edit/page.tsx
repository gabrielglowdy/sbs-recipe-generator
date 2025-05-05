"use client"

import type React from "react"
import { toast } from "react-hot-toast"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { Ingredient, useRecipes } from "@/hooks/use-recipes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FormulaInput } from "@/components/formula-input"
import { FormulaReference } from "@/components/formula-reference"
import { IngredientsList } from "@/components/ingredients-list";
import GeneralLayout from "@/components/general-layout"

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { recipes, updateRecipe } = useRecipes()

  const recipeId = params.id as string
  const recipe = recipes.find((r) => r.id === recipeId)

  const [productCode, setProductCode] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [versionNotes, setVersionNotes] = useState("")
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)

  // Filter out the current recipe from available recipes to prevent circular references
  const availableRecipes = recipes.filter((r) => r.id !== recipeId)

  useEffect(() => {
    if (recipe) {
      setProductCode(recipe.productCode)
      setCategory(recipe.category)
      setDescription(recipe.description || "")
      setIngredients([...recipe.ingredients])
    }
  }, [recipe])

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

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", weight: 0, weightType: "fixed" }])
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
    setIsVersionDialogOpen(true)
  }

  const saveWithVersion = () => {
    // Validate form
    if (!productCode || !category || ingredients.some((i) => !i.name)) {
      toast.error("Please fill all required fields")
      return
    }

    // Calculate new version
    const [major, minor, patch] = recipe.version.split(".").map(Number)
    const newVersion = `${major}.${minor}.${patch + 1}`

    const updatedRecipe = {
      ...recipe,
      productCode,
      category,
      description,
      ingredients: ingredients.map((i) => ({
        ...i,
        weight: typeof i.weight === "string" ? Number.parseFloat(i.weight) : i.weight,
      })),
      version: newVersion,
      updatedAt: new Date(),
      versionHistory: [
        ...recipe.versionHistory,
        {
          version: recipe.version,
          date: recipe.updatedAt,
          notes: versionNotes,
          ingredients: recipe.ingredients,
          productCode: recipe.productCode,
          category: recipe.category,
          description: recipe.description,
        },
      ],
    }

    updateRecipe(updatedRecipe)
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <GeneralLayout>
      <div className="mb-6 flex justify-between items-center">
        <Link
          href={`/recipes/${recipe.id}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to recipe
        </Link>
        <FormulaReference />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Recipe</CardTitle>
            <CardDescription>Edit your thermoplastic compound recipe and save as a new version</CardDescription>
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
              recipes={availableRecipes}
              onAddIngredient={addIngredient}
              onRemoveIngredient={removeIngredient}
              onUpdateIngredient={updateIngredient}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save New Version</DialogTitle>
            <DialogDescription>
              You're creating a new version of this recipe. Please add version notes to track changes.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe what changes you made in this version..."
            value={versionNotes}
            onChange={(e) => setVersionNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWithVersion}>Save New Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GeneralLayout>
  );
}
