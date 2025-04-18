"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react"

interface FilterSummaryProps {
  activeFilters: {
    category: string
    value: string
    label: string
  }[]
  onRemoveFilter: (index: number) => void
  onClearAllFilters: () => void
}

export function FilterSummary({ activeFilters, onRemoveFilter, onClearAllFilters }: FilterSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  if (activeFilters.length === 0) {
    return null
  }

  // Group filters by category for better organization
  const groupedFilters: Record<string, { label: string; value: string; index: number }[]> = {}

  activeFilters.forEach((filter, index) => {
    const category = filter.category.split(".").pop() || filter.category
    if (!groupedFilters[category]) {
      groupedFilters[category] = []
    }
    groupedFilters[category].push({
      label: filter.label,
      value: filter.value,
      index,
    })
  })

  return (
    <div className="filter-summary bg-muted/30 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Active Filters</h3>
          <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
            {activeFilters.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={onClearAllFilters}
          >
            Clear all
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {Object.entries(groupedFilters).map(([category, filters]) => (
            <div key={category} className="border rounded-md p-2 bg-background">
              <div className="text-xs font-medium mb-1">{category}:</div>
              <div className="flex flex-wrap gap-1">
                {filters.map((filter) => (
                  <Badge key={filter.index} variant="outline" className="flex items-center gap-1 h-6 px-2 text-xs">
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-muted-foreground/20"
                      onClick={() => onRemoveFilter(filter.index)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
