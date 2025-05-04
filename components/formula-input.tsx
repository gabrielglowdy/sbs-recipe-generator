"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calculator, HelpCircle } from "lucide-react"
import { useRecipes } from "@/hooks/use-recipes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FormulaInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function FormulaInput({
  value,
  onChange,
  placeholder = "e.g. x * 0.5 or POWER(weight, 0.5)",
  className = "",
}: FormulaInputProps) {
  const [formula, setFormula] = useState(value)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { evaluateFormula, validateFormula, getSupportedFunctions } = useRecipes()

  useEffect(() => {
    setFormula(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value)
    setError(null)
    onChange(e.target.value)
  }

  const calculateResult = () => {
    const validation = validateFormula(formula)

    if (!validation.isValid) {
      setError(validation.error || "Invalid formula")
      setResult(null)
      return
    }

    try {
      // Use a sample batch size of 100 for preview
      const calculatedResult = evaluateFormula(formula, 100)
      setResult(calculatedResult)
      setError(null)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Invalid formula")
      }
      setResult(null)
    }
  }

  const supportedFunctions = getSupportedFunctions()

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input value={formula} onChange={handleChange} placeholder={placeholder} className={className} />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-full aspect-square rounded-l-none mr-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Formula Help</h4>
                <div>
                  <h5 className="text-sm font-medium mb-1">Variables</h5>
                  <ul className="text-xs space-y-1">
                    <li>
                      <code>x</code> or <code>weight</code> - Current batch size
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Operators</h5>
                  <div className="grid grid-cols-2 text-xs">
                    <div>+ (addition)</div>
                    <div>- (subtraction)</div>
                    <div>* (multiplication)</div>
                    <div>/ (division)</div>
                    <div>^ (power)</div>
                    <div>% (percentage)</div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Functions</h5>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {supportedFunctions.map((func) => (
                      <div key={func}>{func}()</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Examples</h5>
                  <ul className="text-xs space-y-1">
                    <li>
                      <code>x * 0.5</code> - 50% of batch size
                    </li>
                    <li>
                      <code>POWER(x, 0.5)</code> - Square root of batch size
                    </li>
                    <li>
                      <code>x ^ 2 / 100</code> - Square of batch size divided by 100
                    </li>
                    <li>
                      <code>SUM(10, x * 0.2, 5)</code> - 10 plus 20% of batch size plus 5
                    </li>
                    <li>
                      <code>IF(x &gt; 100, 20, 10)</code> - 20 if batch size &gt; 100, otherwise 10
                    </li>
                  </ul>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={calculateResult}
            className="h-full aspect-square rounded-l-none"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {result !== null && !error && (
        <div className="text-xs text-muted-foreground">Result: {result.toFixed(2)}g (with batch size = 100g)</div>
      )}

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  )
}
