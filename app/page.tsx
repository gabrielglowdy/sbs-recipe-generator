"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, UploadCloud } from "lucide-react"
import { RecipeList } from "@/components/recipe-list"
import { RecipeFiltersPanel, type RecipeFilters } from "@/components/recipe-filters"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS)

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Thermoplastic Compound Recipe Manager</h1>
          <p className="text-muted-foreground">
            Create, manage, and version control your thermoplastic compound recipes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full flex-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <Popover>
              <PopoverTrigger>
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[700px]">
                <RecipeFiltersPanel filters={filters} onFiltersChange={setFilters} />
              </PopoverContent>
            </Popover>
          </div>
          <Link href="/recipes/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Recipe
            </Button>
          </Link>
          <Link href="/recipes/upload">
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Recipe
            </Button>
          </Link>
        </div>



        <RecipeList searchQuery={searchQuery} filters={filters} />
      </div>
    </div>
  )
}
