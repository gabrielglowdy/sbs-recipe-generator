import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { FormulaInput } from "@/components/formula-input";
import { Ingredient } from "@/hooks/use-recipes";


type IngredientsListProps = {
  ingredients: Ingredient[];
  recipes: { id: string; productCode: string }[];
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, field: string, value: string | number) => void;
};

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  recipes,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Ingredients *</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddIngredient}>
          <Plus className="mr-1 h-3 w-3" />
          Add Ingredient
        </Button>
      </div>

      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor={`recipeRef-${index}`} className="text-xs">
              Recipe Reference
            </Label>
            <Select
              value={ingredient.recipeId || ""}
              onValueChange={(value) => onUpdateIngredient(index, "recipeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipe (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.productCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor={`ingredient-${index}`} className="text-xs">
              Name
            </Label>
            <Input
              id={`ingredient-${index}`}
              placeholder="e.g. Red Compound"
              value={ingredient.name}
              onChange={(e) => onUpdateIngredient(index, "name", e.target.value)}
              required
              disabled={
                ingredient.recipeId !== undefined &&
                ingredient.recipeId !== "" &&
                ingredient.recipeId !== "none"
              }
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <Label htmlFor={`weightType-${index}`} className="text-xs">
              Weight Type
            </Label>
            <Select
              value={ingredient.weightType}
              onValueChange={(value) => onUpdateIngredient(index, "weightType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select weight type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="combined">Combined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ingredient.weightType === "fixed" && (
            <div className="flex-auto">
              <Label htmlFor={`weight-${index}`} className="text-xs">
                Weight (g)
              </Label>
              <Input
                id={`weight-${index}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={ingredient.weight || ""}
                onChange={(e) => onUpdateIngredient(index, "weight", e.target.value)}
              />
            </div>
          )}

          {ingredient.weightType === "percentage" && (
            <div className="flex-auto">
              <Label htmlFor={`percentage-${index}`} className="text-xs">
                Percentage (%)
              </Label>
              <Input
                id={`percentage-${index}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={ingredient.percentage || ""}
                onChange={(e) => onUpdateIngredient(index, "percentage", e.target.value)}
              />
            </div>
          )}

          {ingredient.weightType === "combined" && (
            <div className="flex-auto">
              <Label htmlFor={`formula-${index}`} className="text-xs">
                Formula
              </Label>
              <FormulaInput
                value={ingredient.formula || ""}
                onChange={(value) => onUpdateIngredient(index, "formula", value)}
                placeholder="e.g. x * 0.5 or x^2/100"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveIngredient(index)}
              disabled={ingredients.length === 1}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};