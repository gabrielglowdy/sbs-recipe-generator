"use client"
import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileSpreadsheet, HelpCircle, Plus, Save, Trash2, Upload, X } from "lucide-react"
import Link from "next/link"
import { Ingredient, ProductionResultNote, useRecipes } from "@/hooks/use-recipes"
import { IngredientsList } from "@/components/ingredients-list"
import GeneralLayout from "@/components/general-layout"
import { SearchableSelect } from "@/components/searchable-select"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const productOptions = [
  { value: "thermoflex-a212", label: "A212 - ThermoFlex Base", description: "Automotive", productCode: "A212", category: "Automotive" },
  { value: "consumer-c103", label: "C103 - Flex Consumer Blend", description: "Consumer", productCode: "C103", category: "Consumer" },
  { value: "medical-m501", label: "M501 - MedCore Compound", description: "Medical", productCode: "M501", category: "Medical" },
  { value: "industrial-i880", label: "I880 - Industrial Shield Resin", description: "Industrial", productCode: "I880", category: "Industrial" },
]

const customerOptions = [
  { value: "northstar-materials", label: "Northstar Materials", description: "Tier 1 manufacturing partner" },
  { value: "atlas-polymers", label: "Atlas Polymers", description: "Consumer products account" },
  { value: "helios-medtech", label: "Helios MedTech", description: "Regulated medical program" },
  { value: "forge-industrial", label: "Forge Industrial", description: "High-volume industrial buyer" },
]

type ProductionNoteEntry = {
  date: string; shift: string; lotNumber: string; keterangan: string
  ts: string; el: string; ab: string; bj: string
  zakNote: string; measurementNote: string; mesinNote: string; colorApproved: string; signature: string
}

const emptyProductionNote = (): ProductionNoteEntry => ({
  date: "", shift: "", lotNumber: "", keterangan: "",
  ts: "", el: "", ab: "", bj: "",
  zakNote: "", measurementNote: "", mesinNote: "", colorApproved: "", signature: "",
})

const emptyIngredient = (): Ingredient => ({
  name: "", weight: 0, weightType: "fixed", percentage: 0, formula: "", recipeId: "",
})

const SHEET_RECIPE_INFO = "Recipe Info"
const SHEET_INGREDIENTS = "Ingredients"
const SHEET_COLORINGS = "Colorings"
const SHEET_PRODUCTION_NOTES = "Production Notes"

const PRODUCTION_NOTE_HEADERS = [
  "date", "shift", "lotNumber", "keterangan",
  "ts", "el", "ab", "bj",
  "zakNote", "measurementNote", "mesinNote", "colorApproved", "signature",
]

function buildTemplateWorkbook(withExample: boolean): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const infoRows = [
    ["Field", "Value", "Notes"],
    ["productCode", withExample ? "A212" : "", "Required. e.g. A212"],
    ["category", withExample ? "Automotive" : "", "Required. Automotive | Consumer | Industrial | Medical | Prototype"],
    ["createdBy", withExample ? "Rina" : "", "Optional"],
    ["customer", withExample ? "Northstar Materials" : "", "Optional"],
    ["description", withExample ? "High-temp automotive compound" : "", "Optional"],
    ["orderDate", withExample ? "2026-04-01" : "", "Optional. YYYY-MM-DD"],
    ["productionDate", withExample ? "2026-04-10" : "", "Optional. YYYY-MM-DD"],
    ["qtyOrderBatch", withExample ? "100" : "", "Optional. Number"],
    ["lotNumber", withExample ? "LOT-2026-001" : "", "Optional"],
    ["colorName", withExample ? "Red" : "", "Optional"],
    ["gradeName", withExample ? "Grade A" : "", "Optional"],
    ["hardness", withExample ? "60 Shore A" : "", "Optional"],
    ["keterangan", withExample ? "Standard production batch" : "", "Optional"],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoRows), SHEET_RECIPE_INFO)
  const ingRows: (string | number)[][] = [
    ["name", "weightType", "weight", "percentage", "formula"],
    ["Notes ->", "fixed | percentage | combined", "used when weightType=fixed", "used when weightType=percentage", "used when weightType=combined"],
  ]
  if (withExample) {
    ingRows.push(["Red Compound", "fixed", 23, "", ""])
    ingRows.push(["Base Mixture", "percentage", "", 25.37, ""])
    ingRows.push(["Elastomer", "combined", "", "", "x * 0.45"])
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ingRows), SHEET_INGREDIENTS)
  const colRows: (string | number)[][] = [
    ["name", "weightType", "weight", "percentage", "formula"],
    ["Notes ->", "fixed | percentage | combined", "used when weightType=fixed", "used when weightType=percentage", "used when weightType=combined"],
  ]
  if (withExample) {
    colRows.push(["Black Pigment", "fixed", 1.5, "", ""])
    colRows.push(["White Tint", "percentage", "", 0.8, ""])
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(colRows), SHEET_COLORINGS)
  const prodRows: (string | number)[][] = [
    PRODUCTION_NOTE_HEADERS,
    ["date", "shift", "lotNumber", "keterangan", "ts (MPa)", "el (%)", "ab (kJ/m2)", "bj (g/cm3)", "zakNote", "measurementNote", "mesinNote", "yes | no", "signature"],
  ]
  if (withExample) {
    prodRows.push(["2026-04-10", "Morning", "LOT-2026-001", "Normal run", "14.5", "420", "3.2", "1.18", "OK", "Within spec", "Machine A", "yes", "JDoe"])
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodRows), SHEET_PRODUCTION_NOTES)
  return wb
}

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename)
}

function parseIngredientSheet(ws: XLSX.WorkSheet): Ingredient[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })
  return rows.filter((r) => r.name && r.name !== "Notes ->").map((r) => {
    const wt = String(r.weightType ?? "fixed").trim().toLowerCase() as Ingredient["weightType"]
    const safeWt: Ingredient["weightType"] = (["fixed", "percentage", "combined"] as const).includes(wt) ? wt : "fixed"
    return {
      name: String(r.name ?? "").trim(),
      weightType: safeWt,
      weight: safeWt === "fixed" ? (Number(r.weight) || 0) : undefined,
      percentage: safeWt === "percentage" ? (Number(r.percentage) || 0) : undefined,
      formula: safeWt === "combined" ? String(r.formula ?? "").trim() : undefined,
    }
  })
}

function parseProductionNoteSheet(ws: XLSX.WorkSheet): ProductionNoteEntry[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })
  return rows.filter((r) => r.date && r.date !== "date").map((r) => ({
    date: String(r.date ?? "").trim(),
    shift: String(r.shift ?? "").trim(),
    lotNumber: String(r.lotNumber ?? "").trim(),
    keterangan: String(r.keterangan ?? "").trim(),
    ts: String(r.ts ?? "").trim(),
    el: String(r.el ?? "").trim(),
    ab: String(r.ab ?? "").trim(),
    bj: String(r.bj ?? "").trim(),
    zakNote: String(r.zakNote ?? "").trim(),
    measurementNote: String(r.measurementNote ?? "").trim(),
    mesinNote: String(r.mesinNote ?? "").trim(),
    colorApproved: String(r.colorApproved ?? "").trim().toLowerCase(),
    signature: String(r.signature ?? "").trim(),
  }))
}

type ParseResult = {
  productCode: string; category: string; createdBy: string; customer: string; description: string
  orderDate: string; productionDate: string; qtyOrderBatch: string; lotNumber: string
  colorName: string; gradeName: string; hardness: string; keterangan: string
  ingredients: Ingredient[]; colorings: Ingredient[]; productionNotes: ProductionNoteEntry[]
}

function parseWorkbook(wb: XLSX.WorkBook): ParseResult {
  const wsInfo = wb.Sheets[SHEET_RECIPE_INFO]
  if (!wsInfo) throw new Error(`Missing sheet "${SHEET_RECIPE_INFO}". Please use the provided template.`)
  const infoRows = XLSX.utils.sheet_to_json<{ Field: string; Value: string }>(wsInfo, { defval: "" })
  const info: Record<string, string> = {}
  for (const row of infoRows) {
    if (row.Field && row.Field !== "Field") info[row.Field.trim()] = String(row.Value ?? "").trim()
  }
  if (!info.productCode) throw new Error('Required field "productCode" is missing in the "Recipe Info" sheet.')
  if (!info.category) throw new Error('Required field "category" is missing in the "Recipe Info" sheet.')
  const wsIng = wb.Sheets[SHEET_INGREDIENTS]
  if (!wsIng) throw new Error(`Missing sheet "${SHEET_INGREDIENTS}". Please use the provided template.`)
  const ingredients = parseIngredientSheet(wsIng)
  if (ingredients.length === 0) throw new Error('The "Ingredients" sheet contains no ingredient rows. At least one is required.')
  const wsCol = wb.Sheets[SHEET_COLORINGS]
  const colorings = wsCol ? parseIngredientSheet(wsCol) : []
  const wsProd = wb.Sheets[SHEET_PRODUCTION_NOTES]
  const productionNotes = wsProd ? parseProductionNoteSheet(wsProd) : []
  return {
    productCode: info.productCode, category: info.category,
    createdBy: info.createdBy ?? "",
    customer: info.customer ?? "", description: info.description ?? "",
    orderDate: info.orderDate ?? "", productionDate: info.productionDate ?? "",
    qtyOrderBatch: info.qtyOrderBatch ?? "", lotNumber: info.lotNumber ?? "",
    colorName: info.colorName ?? "", gradeName: info.gradeName ?? "",
    hardness: info.hardness ?? "", keterangan: info.keterangan ?? "",
    ingredients, colorings, productionNotes,
  }
}

export default function NewRecipeByUploadPage() {
  const router = useRouter()
  const { recipes, addRecipe, getSupportedFunctions } = useRecipes()
  const functions = getSupportedFunctions()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
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

  const selectedProduct = productOptions.find((o) => o.value === selectedProductId)
  const selectedCustomer = customerOptions.find((o) => o.value === selectedCustomerId)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsing(true)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const parsed = parseWorkbook(wb)
      const matchedProduct = productOptions.find((o) => o.productCode.toLowerCase() === parsed.productCode.toLowerCase())
      setSelectedProductId(matchedProduct ? matchedProduct.value : parsed.productCode)
      const matchedCustomer = customerOptions.find((o) => o.label.toLowerCase() === parsed.customer.toLowerCase())
      if (matchedCustomer) setSelectedCustomerId(matchedCustomer.value)
      setCreatorName(parsed.createdBy)
      setDescription(parsed.description)
      setOrderDate(parsed.orderDate)
      setProductionDate(parsed.productionDate)
      setQtyOrderBatch(parsed.qtyOrderBatch)
      setLotNumber(parsed.lotNumber)
      setColorName(parsed.colorName)
      setGradeName(parsed.gradeName)
      setHardness(parsed.hardness)
      setKeterangan(parsed.keterangan)
      setIngredients(parsed.ingredients.length ? parsed.ingredients : [emptyIngredient()])
      setColorings(parsed.colorings.length ? parsed.colorings : [emptyIngredient()])
      setProductionNotes(parsed.productionNotes)
      setUploadedFileName(file.name)
      toast.success("Excel parsed successfully � review the form below and save.")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to parse the file."
      toast.error(`Upload error: ${msg}`)
    } finally {
      setIsParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const clearFile = () => {
    setUploadedFileName(null)
    setSelectedProductId(""); setSelectedCustomerId(""); setCreatorName(""); setDescription("")
    setOrderDate(""); setProductionDate(""); setQtyOrderBatch(""); setLotNumber("")
    setColorName(""); setGradeName(""); setHardness(""); setKeterangan("")
    setIngredients([emptyIngredient()]); setColorings([emptyIngredient()]); setProductionNotes([])
  }

  const addIngredient = () => setIngredients([...ingredients, emptyIngredient()])
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index))
  const updateIngredient = (index: number, field: string, value: string | number) => {
    const next = [...ingredients]
    next[index] = { ...next[index], [field]: value }
    if (field === "weightType") {
      if (value === "fixed") { delete next[index].percentage; delete next[index].formula; if (!next[index].weight) next[index].weight = 0 }
      else if (value === "percentage") { delete next[index].formula; delete next[index].weight; if (!next[index].percentage) next[index].percentage = 0 }
      else if (value === "combined") { delete next[index].percentage; delete next[index].weight; if (!next[index].formula) next[index].formula = "" }
    }
    if (field === "recipeId" && value) { const ref = recipes.find((r) => r.id === value); if (ref) next[index].name = `${ref.productCode} Base` }
    if (field === "recipeId" && value === "none") delete next[index].recipeId
    setIngredients(next)
  }

  const addColoring = () => setColorings([...colorings, emptyIngredient()])
  const removeColoring = (index: number) => setColorings(colorings.filter((_, i) => i !== index))
  const updateColoring = (index: number, field: string, value: string | number) => {
    const next = [...colorings]
    next[index] = { ...next[index], [field]: value }
    if (field === "weightType") {
      if (value === "fixed") { delete next[index].percentage; delete next[index].formula; if (!next[index].weight) next[index].weight = 0 }
      else if (value === "percentage") { delete next[index].formula; delete next[index].weight; if (!next[index].percentage) next[index].percentage = 0 }
      else if (value === "combined") { delete next[index].percentage; delete next[index].weight; if (!next[index].formula) next[index].formula = "" }
    }
    if (field === "recipeId" && value) { const ref = recipes.find((r) => r.id === value); if (ref) next[index].name = `${ref.productCode} Base` }
    if (field === "recipeId" && value === "none") delete next[index].recipeId
    setColorings(next)
  }

  const addProductionNote = () => setProductionNotes([...productionNotes, emptyProductionNote()])
  const removeProductionNote = (index: number) => setProductionNotes(productionNotes.filter((_, i) => i !== index))
  const updateProductionNote = (index: number, field: keyof ProductionNoteEntry, value: string) => {
    const updated = [...productionNotes]; updated[index] = { ...updated[index], [field]: value }; setProductionNotes(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || ingredients.some((i) => !i.name)) { toast.error("Please fill all required fields"); return }
    const recipeId = Date.now().toString()
    const newRecipe = {
      id: recipeId, productCode: selectedProduct.productCode, category: selectedProduct.category,
      productUsed: selectedProduct.productCode,
      createdBy: creatorName || undefined,
      customerSpecific: selectedCustomer?.label || undefined,
      description, orderDate: orderDate || undefined, productionDate: productionDate || undefined,
      qtyOrderBatch: qtyOrderBatch ? Number.parseFloat(qtyOrderBatch) : undefined,
      lotNumber: lotNumber || undefined, colorName: colorName || undefined,
      gradeName: gradeName || undefined, hardness: hardness || undefined, keterangan: keterangan || undefined,
      ingredients: ingredients.map((i) => ({ ...i, weight: typeof i.weight === "string" ? Number.parseFloat(i.weight) : i.weight, percentage: typeof i.percentage === "string" ? Number.parseFloat(i.percentage) : i.percentage })),
      colorings: colorings.map((c) => ({ ...c, weight: typeof c.weight === "string" ? Number.parseFloat(c.weight) : c.weight, percentage: typeof c.percentage === "string" ? Number.parseFloat(c.percentage) : c.percentage })),
      productionResultNotes: productionNotes.map((note, i): ProductionResultNote => ({
        id: `${recipeId}_note_${i}`, recipeId,
        date: note.date || undefined, shift: note.shift || undefined, lotNumber: note.lotNumber || undefined, keterangan: note.keterangan || undefined,
        testProperties: { ts: note.ts !== "" ? Number.parseFloat(note.ts) : undefined, el: note.el !== "" ? Number.parseFloat(note.el) : undefined, ab: note.ab !== "" ? Number.parseFloat(note.ab) : undefined, bj: note.bj !== "" ? Number.parseFloat(note.bj) : undefined },
        zakNote: note.zakNote || undefined, measurementNote: note.measurementNote || undefined, mesinNote: note.mesinNote || undefined,
        colorApproved: note.colorApproved === "yes" ? true : note.colorApproved === "no" ? false : undefined,
        signature: note.signature || undefined,
      })),
      version: "1.0.0", createdAt: new Date(), updatedAt: new Date(), versionHistory: [],
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
              <div><p className="font-medium mb-1">Variables</p><code className="bg-muted px-1 rounded">x</code> / <code className="bg-muted px-1 rounded">weight</code> � current batch size</div>
              <div><p className="font-medium mb-1">Operators</p><code className="bg-muted px-1 rounded">+ - * / ^ %</code></div>
              <div>
                <p className="font-medium mb-1">Functions</p>
                <div className="grid grid-cols-2 gap-1">{functions.map((f) => <div key={f} className="p-1 border rounded bg-muted/30"><code>{f}()</code></div>)}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />Upload Recipe from Excel</CardTitle>
          <CardDescription>Download the template, fill it in, then upload to auto-populate the form below. Use the filled example as a reference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => downloadWorkbook(buildTemplateWorkbook(false), "recipe-template.xlsx")}>
              <Download className="mr-2 h-4 w-4" />Download Blank Template
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadWorkbook(buildTemplateWorkbook(true), "recipe-example.xlsx")}>
              <Download className="mr-2 h-4 w-4" />Download Filled Example
            </Button>
          </div>
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3 text-center">
            {uploadedFileName ? (
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <span className="font-medium">{uploadedFileName}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select or drag & drop an Excel file (.xlsx / .xls)</p>
              </>
            )}
            <Input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="max-w-xs" disabled={isParsing} onChange={handleFileChange} />
          </div>
          <p className="text-xs text-muted-foreground">
            The file must contain four sheets named exactly: <strong>Recipe Info</strong>, <strong>Ingredients</strong>, <strong>Colorings</strong>, and <strong>Production Notes</strong>. Use the template above to ensure correct formatting.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
            <CardDescription>Review and adjust the auto-populated fields, then save.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productSelect">Product *</Label>
                <SearchableSelect id="productSelect" value={selectedProductId} onValueChange={setSelectedProductId} options={productOptions} placeholder="Search and select a product" searchPlaceholder="Search products..." emptyMessage="No products found." />
                <p className="text-xs text-muted-foreground">{selectedProduct ? `Category: ${selectedProduct.category}` : "Selecting a product sets the recipe product code and category."}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSelect">Customer</Label>
                <SearchableSelect id="customerSelect" value={selectedCustomerId} onValueChange={setSelectedCustomerId} options={customerOptions} placeholder="Search and select a customer" searchPlaceholder="Search customers..." emptyMessage="No customers found." />
                <p className="text-xs text-muted-foreground">{selectedCustomer?.description ?? "Dummy customer options are used for now."}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Brief description of the compound" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creatorName">User Creator</Label>
              <Input id="creatorName" placeholder="e.g. Rina" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label htmlFor="orderDate">Order Date</Label><Input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="productionDate">Production Date</Label><Input id="productionDate" type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="qtyOrderBatch">Qty Order Batch</Label><Input id="qtyOrderBatch" type="number" min="0" step="0.01" placeholder="e.g. 100" value={qtyOrderBatch} onChange={(e) => setQtyOrderBatch(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="lotNumber">LOT Number</Label><Input id="lotNumber" placeholder="e.g. LOT-2024-001" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="colorName">Color Name</Label><Input id="colorName" placeholder="e.g. Red" value={colorName} onChange={(e) => setColorName(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="gradeName">Grade Name</Label><Input id="gradeName" placeholder="e.g. Grade A" value={gradeName} onChange={(e) => setGradeName(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="hardness">Hardness</Label><Input id="hardness" placeholder="e.g. 60 Shore A" value={hardness} onChange={(e) => setHardness(e.target.value)} /></div>
            </div>
            <IngredientsList ingredients={ingredients} recipes={recipes} onAddIngredient={addIngredient} onRemoveIngredient={removeIngredient} onUpdateIngredient={updateIngredient} />
            <IngredientsList listLabel="Coloring" addButtonLabel="Add Coloring" ingredients={colorings} recipes={recipes} onAddIngredient={addColoring} onRemoveIngredient={removeColoring} onUpdateIngredient={updateColoring} />
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea id="keterangan" placeholder="Additional notes about this recipe..." value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Production Result Notes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProductionNote}><Plus className="mr-1 h-3 w-3" />Add Note</Button>
              </div>
              {productionNotes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">No production notes yet. Upload an Excel file with data or click "Add Note".</p>
              )}
              {productionNotes.map((note, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Production Note #{index + 1}</h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProductionNote(index)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Date</Label><Input type="date" value={note.date} onChange={(e) => updateProductionNote(index, "date", e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs">Shift</Label><Input placeholder="e.g. Morning" value={note.shift} onChange={(e) => updateProductionNote(index, "shift", e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs">LOT Number</Label><Input placeholder="e.g. LOT-001" value={note.lotNumber} onChange={(e) => updateProductionNote(index, "lotNumber", e.target.value)} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Keterangan</Label>
                    <Textarea placeholder="Notes for this production run..." value={note.keterangan} onChange={(e) => updateProductionNote(index, "keterangan", e.target.value)} className="min-h-[80px]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2">Test Properties</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(["ts", "el", "ab", "bj"] as const).map((key) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{key.toUpperCase()}</Label>
                          <Input type="number" step="0.01" placeholder="0.00" value={note[key]} onChange={(e) => updateProductionNote(index, key, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">ZAK Note</Label><Textarea placeholder="ZAK notes..." value={note.zakNote} onChange={(e) => updateProductionNote(index, "zakNote", e.target.value)} className="min-h-[80px]" /></div>
                    <div className="space-y-2"><Label className="text-xs">Measurement Note</Label><Textarea placeholder="Measurement notes..." value={note.measurementNote} onChange={(e) => updateProductionNote(index, "measurementNote", e.target.value)} className="min-h-[80px]" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Mesin Note</Label><Textarea placeholder="Machine notes..." value={note.mesinNote} onChange={(e) => updateProductionNote(index, "mesinNote", e.target.value)} className="min-h-[80px]" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Color Approved</Label>
                      <Select value={note.colorApproved} onValueChange={(v) => updateProductionNote(index, "colorApproved", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label className="text-xs">Signature</Label><Input placeholder="Name or initials" value={note.signature} onChange={(e) => updateProductionNote(index, "signature", e.target.value)} /></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Recipe</Button>
          </CardFooter>
        </Card>
      </form>
    </GeneralLayout>
  )
}
