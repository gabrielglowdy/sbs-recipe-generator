"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useRecipes } from "@/hooks/use-recipes"

export function FormulaReference() {
  const { getSupportedFunctions } = useRecipes()
  const functions = getSupportedFunctions()

  return (
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
                <div className="text-xs text-muted-foreground mt-1">20% of batch if size > 100g, otherwise 10%</div>
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
  )
}
