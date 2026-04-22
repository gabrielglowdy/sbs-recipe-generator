"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/searchable-select"
import { FormulaReference } from "@/components/formula-reference"
import { IngredientsList } from "@/components/ingredients-list"
import GeneralLayout from "@/components/general-layout"
import { Ingredient, ProductionResultNote, useRecipes } from "@/hooks/use-recipes"

type ProductOption = {
  value: string
  label: string
  description: string
  productCode: string
  category: string
}

type CustomerOption = {
  value: string
  label: string
  description: string
}

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

const emptyIngredient = (): Ingredient => ({
  name: "",
  weight: 0,
  weightType: "fixed",
  percentage: 0,
  formula: "",
  recipeId: "",
})

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

const productOptions: ProductOption[] = [
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

const customerOptions: CustomerOption[] = [
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

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { recipes, updateRecipe } = useRecipes()

  const recipeId = params.id as string
  const recipe = recipes.find((r) => r.id === recipeId)

  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [creatorName, setCreatorName] = useState("")
  const [description, setDescription] = useState("")
  const [orderDate, setOrderDate] = useState("")
  const [productionDate, setProductionDate] = useState("")
  const [qtyOrderBatch, setQtyOrderBatch] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [colorName, setColorName] = useState("")
  const [gradeName, setGradeName] = useState("")
  const [hardness, setHardness] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()])
  const [colorings, setColorings] = useState<Ingredient[]>([emptyIngredient()])
  const [productionNotes, setProductionNotes] = useState<ProductionNoteEntry[]>([])
  const [versionNotes, setVersionNotes] = useState("")
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)

  const customProductOptions = useMemo<ProductOption[]>(() => {
    if (!recipe) return []
    const exists = productOptions.some((option) => option.productCode === recipe.productCode)
    if (exists) return []

    return [
      {
        value: `existing-${recipe.id}`,
        label: `${recipe.productCode} - Existing Product`,
        description: recipe.category,
        productCode: recipe.productCode,
        category: recipe.category,
      },
    ]
  }, [recipe])

  const productSelectOptions = useMemo(() => [...customProductOptions, ...productOptions], [customProductOptions])

  // Filter out current recipe to reduce self-reference risk.
  const availableRecipes = recipes.filter((r) => r.id !== recipeId)

  useEffect(() => {
    if (!recipe) return

    const matchedProduct = productSelectOptions.find((option) => option.productCode === recipe.productCode)
    const matchedCustomer = customerOptions.find((option) => option.label === recipe.customerSpecific)

    setSelectedProductId(matchedProduct?.value ?? "")
    setSelectedCustomerId(matchedCustomer?.value ?? "")
    setCreatorName(recipe.createdBy || "")
    setDescription(recipe.description || "")
    setOrderDate(recipe.orderDate || "")
    setProductionDate(recipe.productionDate || "")
    setQtyOrderBatch(recipe.qtyOrderBatch !== undefined ? String(recipe.qtyOrderBatch) : "")
    setLotNumber(recipe.lotNumber || "")
    setColorName(recipe.colorName || "")
    setGradeName(recipe.gradeName || "")
    setHardness(recipe.hardness || "")
    setKeterangan(recipe.keterangan || "")
    setIngredients(recipe.ingredients.length > 0 ? [...recipe.ingredients] : [emptyIngredient()])
    setColorings(recipe.colorings && recipe.colorings.length > 0 ? [...recipe.colorings] : [emptyIngredient()])
    setProductionNotes(
      (recipe.productionResultNotes ?? []).map((note) => ({
        date: note.date || "",
        shift: note.shift || "",
        lotNumber: note.lotNumber || "",
        keterangan: note.keterangan || "",
        ts: note.testProperties?.ts !== undefined ? String(note.testProperties.ts) : "",
        el: note.testProperties?.el !== undefined ? String(note.testProperties.el) : "",
        ab: note.testProperties?.ab !== undefined ? String(note.testProperties.ab) : "",
        bj: note.testProperties?.bj !== undefined ? String(note.testProperties.bj) : "",
        zakNote: note.zakNote || "",
        measurementNote: note.measurementNote || "",
        mesinNote: note.mesinNote || "",
        colorApproved: note.colorApproved === undefined ? "" : note.colorApproved ? "yes" : "no",
        signature: note.signature || "",
      })),
    )
  }, [recipe, productSelectOptions])

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

  const updateIngredientList = (
    list: Ingredient[],
    setter: React.Dispatch<React.SetStateAction<Ingredient[]>>,
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updated = [...list]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "weightType") {
      if (value === "fixed") {
        delete updated[index].percentage
        delete updated[index].formula
        if (!updated[index].weight) updated[index].weight = 0
      } else if (value === "percentage") {
        delete updated[index].formula
        delete updated[index].weight
        if (!updated[index].percentage) updated[index].percentage = 0
      } else if (value === "combined") {
        delete updated[index].percentage
        delete updated[index].weight
        if (!updated[index].formula) updated[index].formula = ""
      }
    }

    if (field === "recipeId" && value) {
      const referencedRecipe = recipes.find((r) => r.id === value)
      if (referencedRecipe) {
        updated[index].name = `${referencedRecipe.productCode} Base`
      }
    }

    if (field === "recipeId" && value === "none") {
      delete updated[index].recipeId
    }

    setter(updated)
  }

  const addIngredient = () => setIngredients([...ingredients, emptyIngredient()])
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index))
  const updateIngredient = (index: number, field: string, value: string | number) => {
    updateIngredientList(ingredients, setIngredients, index, field, value)
  }

  const addColoring = () => setColorings([...colorings, emptyIngredient()])
  const removeColoring = (index: number) => setColorings(colorings.filter((_, i) => i !== index))
  const updateColoring = (index: number, field: string, value: string | number) => {
    updateIngredientList(colorings, setColorings, index, field, value)
  }

  const addProductionNote = () => setProductionNotes([...productionNotes, emptyProductionNote()])
  const removeProductionNote = (index: number) => setProductionNotes(productionNotes.filter((_, i) => i !== index))
  const updateProductionNote = (index: number, field: keyof ProductionNoteEntry, value: string) => {
    const updated = [...productionNotes]
    updated[index] = { ...updated[index], [field]: value }
    setProductionNotes(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsVersionDialogOpen(true)
  }

  const saveWithVersion = () => {
    const selectedProduct = productSelectOptions.find((option) => option.value === selectedProductId)
    const selectedCustomer = customerOptions.find((option) => option.value === selectedCustomerId)

    if (!selectedProduct || ingredients.some((ingredient) => !ingredient.name)) {
      toast.error("Please fill all required fields")
      return
    }

    const [major, minor, patch] = recipe.version.split(".").map(Number)
    const newVersion = `${major}.${minor}.${patch + 1}`

    const productionResultNotes: ProductionResultNote[] = productionNotes.map((note, i) => ({
      id: `${recipe.id}_note_${i}`,
      recipeId: recipe.id,
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
    }))

    const updatedRecipe = {
      ...recipe,
      productCode: selectedProduct.productCode,
      productUsed: selectedProduct.productCode,
      category: selectedProduct.category,
      createdBy: creatorName || undefined,
      customerSpecific: selectedCustomer?.label || undefined,
      description,
      orderDate: orderDate || undefined,
      productionDate: productionDate || undefined,
      qtyOrderBatch: qtyOrderBatch ? Number.parseFloat(qtyOrderBatch) : undefined,
      lotNumber: lotNumber || undefined,
      colorName: colorName || undefined,
      gradeName: gradeName || undefined,
      hardness: hardness || undefined,
      keterangan: keterangan || undefined,
      ingredients: ingredients.map((ingredient) => ({
        ...ingredient,
        weight: typeof ingredient.weight === "string" ? Number.parseFloat(ingredient.weight) : ingredient.weight,
        percentage:
          typeof ingredient.percentage === "string"
            ? Number.parseFloat(ingredient.percentage)
            : ingredient.percentage,
      })),
      colorings: colorings.map((coloring) => ({
        ...coloring,
        weight: typeof coloring.weight === "string" ? Number.parseFloat(coloring.weight) : coloring.weight,
        percentage:
          typeof coloring.percentage === "string"
            ? Number.parseFloat(coloring.percentage)
            : coloring.percentage,
      })),
      productionResultNotes,
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link href={`/recipes/${recipe.id}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
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
                <Label htmlFor="productSelect">Product *</Label>
                <SearchableSelect
                  id="productSelect"
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  options={productSelectOptions}
                  placeholder="Search and select a product"
                  searchPlaceholder="Search products..."
                  emptyMessage="No products found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSelect">Customer</Label>
                <SearchableSelect
                  id="customerSelect"
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  options={customerOptions}
                  placeholder="Search and select a customer"
                  searchPlaceholder="Search customers..."
                  emptyMessage="No customers found."
                />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
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
              recipes={availableRecipes}
              onAddIngredient={addIngredient}
              onRemoveIngredient={removeIngredient}
              onUpdateIngredient={updateIngredient}
            />

            <IngredientsList
              listLabel="Coloring"
              addButtonLabel="Add Coloring"
              ingredients={colorings}
              recipes={availableRecipes}
              onAddIngredient={addColoring}
              onRemoveIngredient={removeColoring}
              onUpdateIngredient={updateColoring}
            />

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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Production Result Notes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProductionNote}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Note
                </Button>
              </div>

              {productionNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                  No production notes yet. Click "Add Note" to add one.
                </p>
              ) : null}

              {productionNotes.map((note, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Production Note #{index + 1}</h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProductionNote(index)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={note.date} onChange={(e) => updateProductionNote(index, "date", e.target.value)} />
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
                      <Select value={note.colorApproved} onValueChange={(v) => updateProductionNote(index, "colorApproved", v)}>
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
              You are creating a new version of this recipe. Please add version notes to track changes.
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
  )
}
