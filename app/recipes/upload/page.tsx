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

export default function NewRecipeByUploadPage() {
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
                <Label htmlFor="productCode">Nama Produk</Label>
                <Input
                  id="productCode"
                  placeholder="e.g. A212"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="category">Customer (Optinal)</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">
                    None
                  </SelectItem>
                  <SelectItem value="Customer A">
                    Customer A
                  </SelectItem>
                  <SelectItem value="Customer B">
                    Customer B
                  </SelectItem>
                  <SelectItem value="Customer C">
                    Customer C
                  </SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-4 flex flex-col">
              <Label>Ingredients</Label>
              <small>Upload the Excel file with the recipe details. Don't have the template? <a href="/path-to-template" className="text-blue-500 underline">Download it here</a></small>
              <Input
                placeholder="Upload the Excel file with the recipe details"

                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Handle file upload
                  }
                }}
              />
            </div>
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
