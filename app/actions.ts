"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string().describe("The name of the recipe"),
    ingredients: z
      .array(
        z.object({
          name: z.string().describe("The name of the ingredient"),
          amount: z.string().describe("The amount of the ingredient needed"),
        }),
      )
      .describe("List of ingredients with amounts"),
    steps: z.array(z.string()).describe("Step by step instructions for the Thermomix"),
    time: z.string().describe("Total time to prepare and cook"),
    difficulty: z.string().describe("Difficulty level (Easy, Medium, Hard)"),
    servings: z.number().describe("Number of servings"),
  }),
})

export async function generateRecipe(prompt: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: recipeSchema,
      prompt: `Generate a detailed Thermomix recipe based on this request: "${prompt}".
      
      The recipe should include specific Thermomix instructions with appropriate speeds, times, and temperatures.
      Make sure the steps are detailed and specific to Thermomix usage.
      Include prep time, cooking time, and appropriate Thermomix techniques.`,
    })

    return object.recipe
  } catch (error) {
    console.error("Error generating recipe:", error)
    throw new Error("Failed to generate recipe")
  }
}
