"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, HelpCircle, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { Ingredient, ProductionResultNote, useRecipes } from "@/hooks/use-recipes"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { SearchableSelect } from "@/components/searchable-select"
import { toast } from "react-hot-toast"

type ProductionNoteEntry = {
  date: string
  shift: string
  lotNumber: string
  keterangan: string
  ts: string
  el: string
  ab: string
  bj: string
  zakNote: string
  measurementNote: string
  mesinNote: string
  colorApproved: string
  signature: string
}

const emptyProductionNote = (): ProductionNoteEntry => ({
  date: "",
  shift: "",
  lotNumber: "",
  keterangan: "",
  ts: "",
  el: "",
  ab: "",
  bj: "",
  zakNote: "",
  measurementNote: "",
  mesinNote: "",
  colorApproved: "",
  signature: "",
})

const productOptions = [
  {
    value: "thermoflex-a212",
    label: "A212 - ThermoFlex Base",
    description: "Automotive",
    productCode: "A212",
    category: "Automotive",
  },
  {
    value: "consumer-c103",
    label: "C103 - Flex Consumer Blend",
    description: "Consumer",
    productCode: "C103",
    category: "Consumer",
  },
  {
    value: "medical-m501",
    label: "M501 - MedCore Compound",
    description: "Medical",
    productCode: "M501",
    category: "Medical",
  },
  {
    value: "industrial-i880",
    label: "I880 - Industrial Shield Resin",
    description: "Industrial",
    productCode: "I880",
    category: "Industrial",
  },
]

const customerOptions = [
  {
    value: "northstar-materials",
    label: "Northstar Materials",
    description: "Tier 1 manufacturing partner",
  },
  {
    value: "atlas-polymers",
    label: "Atlas Polymers",
    description: "Consumer products account",
  },
  {
    value: "helios-medtech",
    label: "Helios MedTech",
    description: "Regulated medical program",
  },
  {
    value: "forge-industrial",
    label: "Forge Industrial",
    description: "High-volume industrial buyer",
  },
]

export default function NewRecipePage() {
  const router = useRouter()
  const { recipes, addRecipe, getSupportedFunctions } = useRecipes()
  const functions = getSupportedFunctions()

  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [creatorName, setCreatorName] = useState("")
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

  // New recipe header metadata
  const [orderDate, setOrderDate] = useState("")
  const [productionDate, setProductionDate] = useState("")
  const [qtyOrderBatch, setQtyOrderBatch] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [colorName, setColorName] = useState("")
  const [gradeName, setGradeName] = useState("")
  const [hardness, setHardness] = useState("")
  const [keterangan, setKeterangan] = useState("")

  // Coloring state (same structure as ingredients)
  const [colorings, setColorings] = useState<Ingredient[]>([
    {
      name: "",
      weight: 0,
      weightType: "fixed" as "fixed" | "percentage" | "combined",
      percentage: 0,
      formula: "",
      recipeId: "",
    },
  ])

  // Production result notes form state
  const [productionNotes, setProductionNotes] = useState<ProductionNoteEntry[]>([])

  const selectedProduct = productOptions.find((option) => option.value === selectedProductId)
  const selectedCustomer = customerOptions.find((option) => option.value === selectedCustomerId)

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

  // Coloring handlers — mirrors ingredient logic
  const addColoring = () => {
    setColorings([
      ...colorings,
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

  const removeColoring = (index: number) => {
    setColorings(colorings.filter((_, i) => i !== index))
  }

  const updateColoring = (index: number, field: string, value: string | number) => {
    const newColorings = [...colorings]
    newColorings[index] = { ...newColorings[index], [field]: value }

    if (field === "weightType") {
      if (value === "fixed") {
        delete newColorings[index].percentage
        delete newColorings[index].formula
        if (!newColorings[index].weight) newColorings[index].weight = 0
      } else if (value === "percentage") {
        delete newColorings[index].formula
        delete newColorings[index].weight
        if (!newColorings[index].percentage) newColorings[index].percentage = 0
      } else if (value === "combined") {
        delete newColorings[index].percentage
        delete newColorings[index].weight
        if (!newColorings[index].formula) newColorings[index].formula = ""
      }
    }

    if (field === "recipeId" && value) {
      const referencedRecipe = recipes.find((r) => r.id === value)
      if (referencedRecipe) newColorings[index].name = `${referencedRecipe.productCode} Base`
    }

    if (field === "recipeId" && value === "none") delete newColorings[index].recipeId

    setColorings(newColorings)
  }

  // Production note handlers
  const addProductionNote = () => {
    setProductionNotes([...productionNotes, emptyProductionNote()])
  }

  const removeProductionNote = (index: number) => {
    setProductionNotes(productionNotes.filter((_, i) => i !== index))
  }

  const updateProductionNote = (index: number, field: keyof ProductionNoteEntry, value: string) => {
    const updated = [...productionNotes]
    updated[index] = { ...updated[index], [field]: value }
    setProductionNotes(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedProduct || !selectedCustomer || ingredients.some((i) => !i.name)) {
      toast.error("Please fill all required fields")
      return
    }

    const recipeId = Date.now().toString()

    const newRecipe = {
      id: recipeId,
      productCode: selectedProduct.productCode,
      productUsed: selectedProduct.productCode,
      category: selectedProduct.category,
      createdBy: creatorName || undefined,
      customerSpecific: selectedCustomer.label,
      description,
      orderDate: orderDate || undefined,
      productionDate: productionDate || undefined,
      qtyOrderBatch: qtyOrderBatch ? Number.parseFloat(qtyOrderBatch) : undefined,
      lotNumber: lotNumber || undefined,
      colorName: colorName || undefined,
      gradeName: gradeName || undefined,
      hardness: hardness || undefined,
      keterangan: keterangan || undefined,
      ingredients: ingredients.map((i) => ({
        ...i,
        weight: typeof i.weight === "string" ? Number.parseFloat(i.weight) : i.weight,
        percentage: typeof i.percentage === "string" ? Number.parseFloat(i.percentage) : i.percentage,
      })),
      colorings: colorings.map((c) => ({
        ...c,
        weight: typeof c.weight === "string" ? Number.parseFloat(c.weight) : c.weight,
        percentage: typeof c.percentage === "string" ? Number.parseFloat(c.percentage) : c.percentage,
      })),
      productionResultNotes: productionNotes.map((note, i): ProductionResultNote => ({
        id: `${recipeId}_note_${i}`,
        recipeId,
        date: note.date || undefined,
        shift: note.shift || undefined,
        lotNumber: note.lotNumber || undefined,
        keterangan: note.keterangan || undefined,
        testProperties: {
          ts: note.ts !== "" ? Number.parseFloat(note.ts) : undefined,
          el: note.el !== "" ? Number.parseFloat(note.el) : undefined,
          ab: note.ab !== "" ? Number.parseFloat(note.ab) : undefined,
          bj: note.bj !== "" ? Number.parseFloat(note.bj) : undefined,
        },
        zakNote: note.zakNote || undefined,
        measurementNote: note.measurementNote || undefined,
        mesinNote: note.mesinNote || undefined,
        colorApproved: note.colorApproved === "yes" ? true : note.colorApproved === "no" ? false : undefined,
        signature: note.signature || undefined,
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
                <Label htmlFor="productSelect">Product *</Label>
                <SearchableSelect
                  id="productSelect"
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  options={productOptions}
                  placeholder="Search and select a product"
                  searchPlaceholder="Search products..."
                  emptyMessage="No products found."
                />
                <p className="text-xs text-muted-foreground">
                  {selectedProduct
                    ? `Category: ${selectedProduct.category}`
                    : "Selecting a product sets the recipe product code and category."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSelect">Customer *</Label>
                <SearchableSelect
                  id="customerSelect"
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  options={customerOptions}
                  placeholder="Search and select a customer"
                  searchPlaceholder="Search customers..."
                  emptyMessage="No customers found."
                />
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer?.description ?? "Dummy customer options are used for now."}
                </p>
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

            <div className="space-y-2">
              <Label htmlFor="creatorName">User Creator</Label>
              <Input
                id="creatorName"
                placeholder="e.g. Rina"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
              />
            </div>

            {/* Order and production metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionDate">Production Date</Label>
                <Input
                  id="productionDate"
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtyOrderBatch">Qty Order Batch</Label>
                <Input
                  id="qtyOrderBatch"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 100"
                  value={qtyOrderBatch}
                  onChange={(e) => setQtyOrderBatch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lotNumber">LOT Number</Label>
                <Input
                  id="lotNumber"
                  placeholder="e.g. LOT-2024-001"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Color, grade, hardness */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input
                  id="colorName"
                  placeholder="e.g. Red"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeName">Grade Name</Label>
                <Input
                  id="gradeName"
                  placeholder="e.g. Grade A"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hardness">Hardness</Label>
                <Input
                  id="hardness"
                  placeholder="e.g. 60 Shore A"
                  value={hardness}
                  onChange={(e) => setHardness(e.target.value)}
                />
              </div>
            </div>

            <IngredientsList
              ingredients={ingredients}
              recipes={recipes}
              onAddIngredient={addIngredient}
              onRemoveIngredient={removeIngredient}
              onUpdateIngredient={updateIngredient}
            />

            {/* Coloring */}
            <IngredientsList
              listLabel="Coloring"
              addButtonLabel="Add Coloring"
              ingredients={colorings}
              recipes={recipes}
              onAddIngredient={addColoring}
              onRemoveIngredient={removeColoring}
              onUpdateIngredient={updateColoring}
            />

            {/* Recipe-level Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                placeholder="Additional notes about this recipe..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Production Result Notes */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Production Result Notes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProductionNote}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Note
                </Button>
              </div>

              {productionNotes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                  No production notes yet. Click &quot;Add Note&quot; to add one.
                </p>
              )}

              {productionNotes.map((note, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Production Note #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProductionNote(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={note.date}
                        onChange={(e) => updateProductionNote(index, "date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Shift</Label>
                      <Input
                        placeholder="e.g. Morning"
                        value={note.shift}
                        onChange={(e) => updateProductionNote(index, "shift", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">LOT Number</Label>
                      <Input
                        placeholder="e.g. LOT-001"
                        value={note.lotNumber}
                        onChange={(e) => updateProductionNote(index, "lotNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Keterangan</Label>
                    <Textarea
                      placeholder="Notes for this production run..."
                      value={note.keterangan}
                      onChange={(e) => updateProductionNote(index, "keterangan", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2">Test Properties</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">TS</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={note.ts}
                          onChange={(e) => updateProductionNote(index, "ts", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">EL</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={note.el}
                          onChange={(e) => updateProductionNote(index, "el", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">AB</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={note.ab}
                          onChange={(e) => updateProductionNote(index, "ab", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">BJ</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={note.bj}
                          onChange={(e) => updateProductionNote(index, "bj", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">ZAK Note</Label>
                      <Textarea
                        placeholder="ZAK notes..."
                        value={note.zakNote}
                        onChange={(e) => updateProductionNote(index, "zakNote", e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Measurement Note</Label>
                      <Textarea
                        placeholder="Measurement notes..."
                        value={note.measurementNote}
                        onChange={(e) => updateProductionNote(index, "measurementNote", e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Mesin Note</Label>
                    <Textarea
                      placeholder="Machine notes..."
                      value={note.mesinNote}
                      onChange={(e) => updateProductionNote(index, "mesinNote", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Color Approved</Label>
                      <Select
                        value={note.colorApproved}
                        onValueChange={(v) => updateProductionNote(index, "colorApproved", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Signature</Label>
                      <Input
                        placeholder="Name or initials"
                        value={note.signature}
                        onChange={(e) => updateProductionNote(index, "signature", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
