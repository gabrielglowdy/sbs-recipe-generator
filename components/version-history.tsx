"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatDate } from "@/lib/utils"
import { useRecipes } from "@/hooks/use-recipes"
import { GitBranch, GitCompare } from "lucide-react"

export function VersionHistory({ recipeId }: { recipeId: string }) {
  const { recipes, restoreVersion } = useRecipes()
  const recipe = recipes.find((r) => r.id === recipeId)
  const [compareVersions, setCompareVersions] = useState<string[]>([])

  if (!recipe || recipe.versionHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>No previous versions available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is the first version of this recipe. When you make changes, they will be tracked here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleVersionCompare = (version: string) => {
    if (compareVersions.includes(version)) {
      setCompareVersions(compareVersions.filter((v) => v !== version))
    } else {
      if (compareVersions.length < 2) {
        setCompareVersions([...compareVersions, version])
      } else {
        setCompareVersions([compareVersions[1], version])
      }
    }
  }

  const canCompare = compareVersions.length === 2

  const getVersionData = (version: string) => {
    if (version === recipe.version) return recipe
    return recipe.versionHistory.find((v) => v.version === version)
  }

  const compareData = canCompare
    ? {
        v1: getVersionData(compareVersions[0]),
        v2: getVersionData(compareVersions[1]),
      }
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Track changes across different versions of your recipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Current Version: <Badge variant="outline">{recipe.version}</Badge>
              </div>
              {compareVersions.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setCompareVersions([])}>
                  Clear Selection
                </Button>
              )}
            </div>

            <div className="border rounded-md">
              <div className="flex items-center p-3 border-b bg-muted/50">
                <div className="w-10 flex-shrink-0"></div>
                <div className="flex-1 font-medium">Version</div>
                <div className="w-32 flex-shrink-0 font-medium">Date</div>
                <div className="w-24 flex-shrink-0"></div>
              </div>

              <div className="divide-y">
                <div className="flex items-center p-3 hover:bg-muted/50">
                  <div className="w-10 flex-shrink-0">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={compareVersions.includes(recipe.version)}
                      onChange={() => toggleVersionCompare(recipe.version)}
                    />
                  </div>
                  <div className="flex-1 flex items-center">
                    <GitBranch className="mr-2 h-4 w-4" />
                    {recipe.version} <Badge className="ml-2">Current</Badge>
                  </div>
                  <div className="w-32 flex-shrink-0 text-sm text-muted-foreground">{formatDate(recipe.updatedAt)}</div>
                  <div className="w-24 flex-shrink-0">
                    <Button variant="ghost" size="sm" disabled>
                      Current
                    </Button>
                  </div>
                </div>

                {recipe.versionHistory.map((version, index) => (
                  <div key={index} className="flex items-center p-3 hover:bg-muted/50">
                    <div className="w-10 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={compareVersions.includes(version.version)}
                        onChange={() => toggleVersionCompare(version.version)}
                      />
                    </div>
                    <div className="flex-1 flex items-center">
                      <GitBranch className="mr-2 h-4 w-4" />
                      {version.version}
                    </div>
                    <div className="w-32 flex-shrink-0 text-sm text-muted-foreground">{formatDate(version.date)}</div>
                    <div className="w-24 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => restoreVersion(recipeId, version.version)}>
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canCompare && compareData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitCompare className="mr-2 h-5 w-5" />
              Comparing Versions
            </CardTitle>
            <CardDescription>
              Comparing {compareVersions[0]} with {compareVersions[1]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="basic-info">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Field</div>
                    <div className="font-medium">{compareData.v1?.version}</div>
                    <div className="font-medium">{compareData.v2?.version}</div>

                    <div>Product Code</div>
                    <div
                      className={
                        compareData.v1?.productCode !== compareData.v2?.productCode ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v1?.productCode}
                    </div>
                    <div
                      className={
                        compareData.v1?.productCode !== compareData.v2?.productCode ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v2?.productCode}
                    </div>

                    <div>Category</div>
                    <div
                      className={
                        compareData.v1?.category !== compareData.v2?.category ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v1?.category}
                    </div>
                    <div
                      className={
                        compareData.v1?.category !== compareData.v2?.category ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v2?.category}
                    </div>

                    <div>Description</div>
                    <div
                      className={
                        compareData.v1?.description !== compareData.v2?.description ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v1?.description || "-"}
                    </div>
                    <div
                      className={
                        compareData.v1?.description !== compareData.v2?.description ? "bg-yellow-100 p-1 rounded" : ""
                      }
                    >
                      {compareData.v2?.description || "-"}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Ingredient</th>
                          <th className="text-left py-2 px-4 font-medium">{compareData.v1?.version} Weight (g)</th>
                          <th className="text-left py-2 px-4 font-medium">{compareData.v2?.version} Weight (g)</th>
                          <th className="text-left py-2 px-4 font-medium">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(
                          new Set([
                            ...(compareData.v1?.ingredients || []).map((i) => i.name),
                            ...(compareData.v2?.ingredients || []).map((i) => i.name),
                          ]),
                        ).map((name, index) => {
                          const ing1 = compareData.v1?.ingredients.find((i) => i.name === name)
                          const ing2 = compareData.v2?.ingredients.find((i) => i.name === name)
                          const weight1 = ing1?.weight || 0
                          const weight2 = ing2?.weight || 0
                          const diff = weight2 - weight1

                          return (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-4">{name}</td>
                              <td className={`py-2 px-4 ${!ing1 ? "bg-red-100" : ""}`}>
                                {ing1 ? weight1.toFixed(2) : "Not present"}
                              </td>
                              <td className={`py-2 px-4 ${!ing2 ? "bg-green-100" : ""}`}>
                                {ing2 ? weight2.toFixed(2) : "Not present"}
                              </td>
                              <td className={`py-2 px-4 ${diff !== 0 ? "font-medium" : ""}`}>
                                {diff === 0 ? (
                                  "No change"
                                ) : (
                                  <span className={diff > 0 ? "text-green-600" : "text-red-600"}>
                                    {diff > 0 ? "+" : ""}
                                    {diff.toFixed(2)}g
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="version-notes">
                <AccordionTrigger>Version Notes</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">{compareData.v1?.version} Notes</h4>
                      <div className="p-3 bg-muted rounded-md">{compareData.v1?.notes || "No notes available"}</div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{compareData.v2?.version} Notes</h4>
                      <div className="p-3 bg-muted rounded-md">{compareData.v2?.notes || "No notes available"}</div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
