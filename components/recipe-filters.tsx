"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface RecipeFilters {
  productUsed: string
  dateCreated: string
  userCreator: string
  ingredientUsed: string
  colorUsed: string
  lastUpdatedDate: string
  category: string
  customerSpecific: string
  productionResultDate: string
}

interface RecipeFiltersProps {
  filters: RecipeFilters
  onFiltersChange: (next: RecipeFilters) => void
}

const EMPTY_FILTERS: RecipeFilters = {
  productUsed: "",
  dateCreated: "",
  userCreator: "",
  ingredientUsed: "",
  colorUsed: "",
  lastUpdatedDate: "",
  category: "",
  customerSpecific: "",
  productionResultDate: "",
}

export function RecipeFiltersPanel({ filters, onFiltersChange }: RecipeFiltersProps) {
  const updateFilter = (key: keyof RecipeFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filterProductUsed">Product Used</Label>
          <Input
            id="filterProductUsed"
            value={filters.productUsed}
            onChange={(e) => updateFilter("productUsed", e.target.value)}
            placeholder="e.g. A212"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterCategory">Category</Label>
          <Input
            id="filterCategory"
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            placeholder="e.g. Automotive"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterCustomerSpecific">Customer Specific</Label>
          <Input
            id="filterCustomerSpecific"
            value={filters.customerSpecific}
            onChange={(e) => updateFilter("customerSpecific", e.target.value)}
            placeholder="e.g. Northstar Materials"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterUserCreator">User Creator</Label>
          <Input
            id="filterUserCreator"
            value={filters.userCreator}
            onChange={(e) => updateFilter("userCreator", e.target.value)}
            placeholder="e.g. Rina"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterIngredientUsed">Ingredient Used</Label>
          <Input
            id="filterIngredientUsed"
            value={filters.ingredientUsed}
            onChange={(e) => updateFilter("ingredientUsed", e.target.value)}
            placeholder="e.g. Elastomer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterColorUsed">Color Used</Label>
          <Input
            id="filterColorUsed"
            value={filters.colorUsed}
            onChange={(e) => updateFilter("colorUsed", e.target.value)}
            placeholder="e.g. Red"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterDateCreated">Date Created</Label>
          <Input
            id="filterDateCreated"
            type="date"
            value={filters.dateCreated}
            onChange={(e) => updateFilter("dateCreated", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterLastUpdatedDate">Last Updated Date</Label>
          <Input
            id="filterLastUpdatedDate"
            type="date"
            value={filters.lastUpdatedDate}
            onChange={(e) => updateFilter("lastUpdatedDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterProductionResultDate">Production Result Date</Label>
          <Input
            id="filterProductionResultDate"
            type="date"
            value={filters.productionResultDate}
            onChange={(e) => updateFilter("productionResultDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
