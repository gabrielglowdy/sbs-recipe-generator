# Agent Instructions — sbs-recipe-generator

This is a **Thermoplastic Compound Recipe Manager** for industrial compound formulations (automotive, consumer, medical, industrial grades). It is a Next.js 15 App Router project using React 19, TypeScript 5, Tailwind CSS, and shadcn/ui.

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Lint | `pnpm lint` |

No test suite is configured.

## Architecture

```
app/                    ← Next.js App Router pages (almost all "use client")
  actions.ts            ← ONLY server-side file ("use server"); OpenAI via Vercel AI SDK
  providers.tsx         ← Mounts RecipesProvider for global state
  recipes/[id]/         ← Detail view (tabs: Details, Weight Calculator, Version History)
  recipes/[id]/edit/    ← Edit form; auto-increments patch version, archives old version
  recipes/create/       ← Create form
  recipes/upload/       ← Excel (.xlsx) upload + template download
components/
  ui/                   ← shadcn/ui primitives (do not edit these directly)
  *.tsx                 ← Feature components; compose from ui/ primitives
hooks/
  use-recipes.tsx       ← ALL business logic: CRUD, formula eval, versioning, print, weight calc
lib/
  utils.ts              ← cn() (Tailwind merger), formatDate(), formatDistanceToNow()
```

## Key Conventions

- **`"use client"` is on almost every file.** Only `app/actions.ts` uses `"use server"`.
- **Path alias `@/`** maps to the workspace root (e.g., `import { cn } from "@/lib/utils"`).
- **`GeneralLayout`** (`components/general-layout.tsx`) is used as a `max-w-5xl` centering wrapper on all inner pages instead of nested Next.js layout files.
- **shadcn/ui pattern**: primitives live in `components/ui/`, feature components in `components/`.
- **State is entirely in-memory** via React Context (`RecipesProvider`). There is no database, no API, and no localStorage — data resets on page refresh.
- **All business logic** (CRUD, formula evaluation, versioning, weight calculation) lives in `hooks/use-recipes.tsx`. Prefer adding logic there rather than in page components.
- **Versioning**: Only the patch segment of `major.minor.patch` is ever auto-incremented on edit saves.

## State Management

`useRecipes()` (from `hooks/use-recipes.tsx`) provides:
- `recipes`, `addRecipe`, `updateRecipe`, `duplicateRecipe`, `restoreVersion`
- `calculateRecipeWeight(recipe, batchSize)` — resolves `recipeId` references recursively (no cycle detection)
- `evaluateFormula(formula, weight)` — uses `new Function()` internally; treat formula input as untrusted
- `validateFormula`, `printRecipe`, `getSupportedFunctions`

Seed data is 3 hardcoded sample recipes (A212, C103, M501) loaded on mount.

## Known Issues / Pitfalls

1. **No persistence** — all data is lost on page refresh.
2. **`evaluateFormula` uses `new Function()`** — XSS/code-injection risk if exposed to untrusted users.
3. **Search input on the home page** (`app/page.tsx`) has no `onChange` handler and does not filter recipes.
4. **`productOptions` / `customerOptions` are hardcoded and duplicated** in both `create/page.tsx` and `upload/page.tsx`.
5. **No circular reference protection** — recipe-referencing ingredients can cause infinite recursion in `calculateRecipeWeight`.
6. **AI generation** (`app/actions.ts`) is defined but not surfaced in any current UI.
7. **`sonner`** is installed but unused — `react-hot-toast` is the active toast library.
