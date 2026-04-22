"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

type SearchableSelectOption = {
  value: string
  label: string
  description?: string
}

type SearchableSelectProps = {
  emptyMessage: string
  id?: string
  options: SearchableSelectOption[]
  placeholder: string
  searchPlaceholder: string
  value: string
  onValueChange: (value: string) => void
}

export function SearchableSelect({
  emptyMessage,
  id,
  options,
  placeholder,
  searchPlaceholder,
  value,
  onValueChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.description ?? ""}`}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.description ? (
                    <span className="truncate text-xs text-muted-foreground">{option.description}</span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}