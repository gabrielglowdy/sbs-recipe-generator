"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the Recipe type
export interface Ingredient {
  name: string
  weight: number
  weightType: "fixed" | "percentage" | "combined"
  percentage?: number
  formula?: string
  recipeId?: string // Reference to another recipe
}

export interface VersionData {
  version: string
  date: Date
  notes?: string
  ingredients: Ingredient[]
  productCode: string
  category: string
  description?: string
}

export interface Recipe {
  id: string
  productCode: string
  category: string
  description?: string
  ingredients: Ingredient[]
  version: string
  createdAt: Date
  updatedAt: Date
  versionHistory: VersionData[]
}

// Update the sample data to include the new weight specification types and recipe references
const sampleRecipes: Recipe[] = [
  {
    id: "1",
    productCode: "A212",
    category: "Automotive",
    description: "High-temperature resistant compound for automotive applications",
    ingredients: [
      { name: "Red Compound", weight: 23, weightType: "fixed" },
      { name: "Yellow Compound", weight: 12.3, weightType: "fixed" },
      { name: "Base Mixture", weight: 12, weightType: "percentage", percentage: 25.37 },
    ],
    version: "1.0.0",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
    versionHistory: [],
  },
  {
    id: "2",
    productCode: "C103",
    category: "Consumer",
    description: "Flexible compound for consumer electronics",
    ingredients: [
      { name: "Blue Compound", weight: 15.5, weightType: "fixed" },
      { name: "White Compound", weight: 8.2, weightType: "percentage", percentage: 18.7 },
      { name: "Elastomer Base", weight: 20, weightType: "combined", formula: "x * 0.45" },
    ],
    version: "2.1.0",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-03-05"),
    versionHistory: [
      {
        version: "1.0.0",
        date: new Date("2023-02-10"),
        notes: "Initial version",
        ingredients: [
          { name: "Blue Compound", weight: 10, weightType: "fixed" },
          { name: "White Compound", weight: 5, weightType: "percentage", percentage: 16.7 },
          { name: "Elastomer Base", weight: 15, weightType: "fixed" },
        ],
        productCode: "C103",
        category: "Consumer",
        description: "Flexible compound for consumer electronics",
      },
      {
        version: "2.0.0",
        date: new Date("2023-02-25"),
        notes: "Increased elastomer content for better flexibility",
        ingredients: [
          { name: "Blue Compound", weight: 12, weightType: "fixed" },
          { name: "White Compound", weight: 8, weightType: "percentage", percentage: 20 },
          { name: "Elastomer Base", weight: 20, weightType: "fixed" },
        ],
        productCode: "C103",
        category: "Consumer",
        description: "Flexible compound for consumer electronics",
      },
    ],
  },
  {
    id: "3",
    productCode: "M501",
    category: "Medical",
    description: "Medical grade compound with A212 base",
    ingredients: [
      { name: "A212 Base", weight: 30, weightType: "fixed", recipeId: "1" },
      { name: "Medical Additive", weight: 5, weightType: "fixed" },
      { name: "Stabilizer", weight: 3, weightType: "combined", formula: "weight * 0.08" },
    ],
    version: "1.0.0",
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-03-20"),
    versionHistory: [],
  },
]

// Create context
interface RecipesContextType {
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (recipe: Recipe) => void
  duplicateRecipe: (id: string) => string
  restoreVersion: (id: string, version: string) => void
  calculateRecipeWeight: (recipeId: string) => number
  evaluateFormula: (formula: string, batchSize?: number) => number
  validateFormula: (formula: string) => { isValid: boolean; error?: string }
  printRecipe: (recipeId: string) => void
  getSupportedFunctions: () => string[]
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined)

// Provider component
export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  // Load sample data on first render
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    setRecipes(sampleRecipes)
  }, [])

  const addRecipe = (recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe])
  }

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes((prev) => prev.map((recipe) => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe)))
  }

  const duplicateRecipe = (id: string) => {
    const recipe = recipes.find((r) => r.id === id)
    if (!recipe) return id

    const newId = Date.now().toString()
    const newRecipe: Recipe = {
      ...recipe,
      id: newId,
      productCode: `${recipe.productCode} (Copy)`,
      version: "1.0.0",
      createdAt: new Date(),
      updatedAt: new Date(),
      versionHistory: [],
    }

    setRecipes((prev) => [...prev, newRecipe])
    return newId
  }

  const restoreVersion = (id: string, version: string) => {
    const recipe = recipes.find((r) => r.id === id)
    if (!recipe) return

    const versionData = recipe.versionHistory.find((v) => v.version === version)
    if (!versionData) return

    // Calculate new version
    const [major, minor, patch] = recipe.version.split(".").map(Number)
    const newVersion = `${major}.${minor}.${patch + 1}`

    const updatedRecipe: Recipe = {
      ...recipe,
      productCode: versionData.productCode,
      category: versionData.category,
      description: versionData.description,
      ingredients: [...versionData.ingredients],
      version: newVersion,
      updatedAt: new Date(),
      versionHistory: [
        ...recipe.versionHistory,
        {
          version: recipe.version,
          date: recipe.updatedAt,
          notes: `Restored from version ${version}`,
          ingredients: recipe.ingredients,
          productCode: recipe.productCode,
          category: recipe.category,
          description: recipe.description,
        },
      ],
    }

    updateRecipe(updatedRecipe)
  }

  // Define support for Excel-like mathematical functions
  const mathFunctions = {
    SUM: (...args: number[]): number => args.reduce((sum, val) => sum + val, 0),
    AVERAGE: (...args: number[]): number =>
      args.length > 0 ? args.reduce((sum, val) => sum + val, 0) / args.length : 0,
    MIN: (...args: number[]): number => Math.min(...args),
    MAX: (...args: number[]): number => Math.max(...args),
    ROUND: (num: number, decimals: number): number =>
      Number(Math.round(Number(num + "e+" + decimals)) + "e-" + decimals),
    FLOOR: (num: number): number => Math.floor(num),
    CEILING: (num: number): number => Math.ceil(num),
    ABS: (num: number): number => Math.abs(num),
    POWER: (base: number, exponent: number): number => Math.pow(base, exponent),
    SQRT: (num: number): number => Math.sqrt(num),
    LOG: (num: number): number => Math.log(num),
    LOG10: (num: number): number => Math.log10(num),
    EXP: (num: number): number => Math.exp(num),
    PI: (): number => Math.PI,
    SIN: (num: number): number => Math.sin(num),
    COS: (num: number): number => Math.cos(num),
    TAN: (num: number): number => Math.tan(num),
    ASIN: (num: number): number => Math.asin(num),
    ACOS: (num: number): number => Math.acos(num),
    ATAN: (num: number): number => Math.atan(num),
    IF: (condition: boolean, trueValue: number, falseValue: number): number => (condition ? trueValue : falseValue),
  }

  // Get list of supported functions
  const getSupportedFunctions = () => {
    return Object.keys(mathFunctions)
  }

  // Function to validate formula before evaluation
  const validateFormula = (formula: string): { isValid: boolean; error?: string } => {
    if (!formula) {
      return { isValid: false, error: "Formula is empty" }
    }

    try {
      // Test formula with a sample batch size
      evaluateFormula(formula, 100)
      return { isValid: true }
    } catch (error: any) {
      return { isValid: false, error: error.message || "Invalid formula" }
    }
  }

  // Function to evaluate mathematical formulas with support for batch size variables and Excel-like functions
  const evaluateFormula = (formula: string, batchSize?: number): number => {
    if (!formula) return 0

    try {
      // Replace percentage symbol with division by 100
      let processedFormula = formula.replace(/%/g, "/100")

      // Replace power operation ^ with Math.pow
      processedFormula = processedFormula.replace(
        /(\d*\.?\d+|\w+$$[^)]*$$)\s*\^\s*(\d*\.?\d+|\w+$$[^)]*$$)/g,
        "Math.pow($1, $2)",
      )

      // Replace 'x' or 'weight' variables with the batch size
      if (batchSize !== undefined) {
        processedFormula = processedFormula.replace(/\bx\b/g, batchSize.toString())
        processedFormula = processedFormula.replace(/\bweight\b/g, batchSize.toString())
      }

      // Add Math functions to the evaluation context
      const mathContext = Object.entries(mathFunctions).reduce(
        (context, [key, func]) => {
          context[key] = func
          return context
        },
        {} as Record<string, any>,
      )

      // Add Math object methods
      Object.getOwnPropertyNames(Math).forEach((key) => {
        if (typeof Math[key as keyof typeof Math] === "function") {
          mathContext[key] = Math[key as keyof typeof Math]
        }
      })

      // Create a function that evaluates the formula with the context
      // eslint-disable-next-line no-new-func
      const evalFunction = new Function(...Object.keys(mathContext), `return ${processedFormula}`)

      // Execute the function with the math context values
      return evalFunction(...Object.values(mathContext))
    } catch (error) {
      console.error("Error evaluating formula:", error)
      throw new Error(`Formula error: ${error instanceof Error ? error.message : "Invalid formula"}`)
    }
  }

  // Function to calculate the total weight of a recipe, including nested recipes
  const calculateRecipeWeight = (recipeId: string): number => {
    const recipe = recipes.find((r) => r.id === recipeId)
    if (!recipe) return 0

    return recipe.ingredients.reduce((sum, ingredient) => {
      if (ingredient.recipeId && ingredient.recipeId !== "none") {
        // If the ingredient references another recipe, calculate its weight
        return sum + calculateRecipeWeight(ingredient.recipeId)
      } else if (ingredient.weightType === "combined" && ingredient.formula) {
        // If the ingredient has a formula, evaluate it
        return sum + evaluateFormula(ingredient.formula)
      } else {
        // Otherwise, use the ingredient's weight
        return sum + ingredient.weight
      }
    }, 0)
  }

  // Function to print a recipe
  const printRecipe = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId)
    if (!recipe) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print recipes")
      return
    }

    // Calculate total weight
    const totalWeight = recipe.ingredients.reduce((sum, i) => sum + i.weight, 0)

    // Generate HTML content for printing
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recipe: ${recipe.productCode}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
          }
          h1 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .recipe-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            font-size: 0.8em;
            color: #777;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()">Print Recipe</button>
        </div>
        
        <h1>Recipe: ${recipe.productCode}</h1>
        
        <div class="recipe-info">
          <div class="info-item">
            <div class="info-label">Category:</div>
            <div>${recipe.category}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Version:</div>
            <div>${recipe.version}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Weight:</div>
            <div>${totalWeight.toFixed(2)}g</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Description:</div>
          <div>${recipe.description || "No description provided"}</div>
        </div>
        
        <h2>Ingredients</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Details</th>
              <th>Weight (g)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${recipe.ingredients
              .map(
                (ingredient) => `
              <tr>
                <td>${ingredient.name}</td>
                <td>${
                  ingredient.weightType === "fixed"
                    ? "Fixed"
                    : ingredient.weightType === "percentage"
                      ? "Percentage"
                      : "Combined"
                }</td>
                <td>${
                  ingredient.weightType === "percentage"
                    ? `${ingredient.percentage}%`
                    : ingredient.weightType === "combined" && ingredient.formula
                      ? ingredient.formula
                      : ingredient.recipeId && ingredient.recipeId !== "none"
                        ? "Recipe Reference"
                        : ""
                }</td>
                <td>${ingredient.weight.toFixed(2)}</td>
                <td>${((ingredient.weight / totalWeight) * 100).toFixed(2)}%</td>
              </tr>
            `,
              )
              .join("")}
            <tr style="font-weight: bold;">
              <td>Total</td>
              <td></td>
              <td></td>
              <td>${totalWeight.toFixed(2)}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Printed on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    // Write the content to the new window and print
    printWindow.document.open()
    printWindow.document.write(content)
    printWindow.document.close()
  }

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        duplicateRecipe,
        restoreVersion,
        calculateRecipeWeight,
        evaluateFormula,
        validateFormula,
        printRecipe,
        getSupportedFunctions,
      }}
    >
      {children}
    </RecipesContext.Provider>
  )
}

// Hook for using the recipes context
export function useRecipes() {
  const context = useContext(RecipesContext)
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipesProvider")
  }
  return context
}
