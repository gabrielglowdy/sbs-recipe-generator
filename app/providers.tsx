"use client"

import type { ReactNode } from "react"
import { RecipesProvider } from "@/hooks/use-recipes"

export function Providers({ children }: { children: ReactNode }) {
  return <RecipesProvider>{children}</RecipesProvider>
}
