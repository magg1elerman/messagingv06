"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronRight, MessageSquare, Plus, Search, X, Sliders, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { FilterCategory } from "./customer-types"

interface FilterOption {
  label: string
  value: string
}

interface FilterDefinition {
  label: string
  key: string
  type?: string
  options?: FilterOption[]
}

interface FilterCategoryDefinition {
  id: string
  label: string
  icon: React.ReactNode
  filters: FilterDefinition[]
  hasPreWrittenMessages: boolean
}

interface ActiveFilter {
  category: string
  value: string
  label: string
}

interface ImprovedFilterSystemProps {
  activeFilters: ActiveFilter[]
  onAddFilter: (category: string, value: string, label: string) => void
  onRemoveFilter: (index: number) => void
  onClearAllFilters: () => void
  onShowPreWrittenMessages: (category: FilterCategory) => void
  filterCategories: FilterCategoryDefinition[]
  selectedFilterCategory: string
  onSelectFilterCategory: (categoryId: string) => void
}

export function ImprovedFilterSystem({
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  onShowPreWrittenMessages,
  filterCategories,
  selectedFilterCategory,
  onSelectFilterCategory,
}: ImprovedFilterSystemProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // Initialize expanded state for all categories
  useEffect(() => {
    const initialState: Record<string, boolean> = {}
    filterCategories.forEach((category) => {
      initialState[category.id] = true
    })
    setExpandedGroups(initialState)
  }, [filterCategories])

  // Set default selected tab to the first category when component mounts
  useEffect(() => {
    if (selectedFilterCategory === "all" && filterCategories.length > 0) {
      onSelectFilterCategory(filterCategories[0].id)
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  // Filter the filter options based on search query
  const getFilteredOptions = (options: FilterOption[] = []) => {
    if (!searchQuery.trim()) return options
    return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  return (
    <div className="filter-system space-y-4 border rounded-lg p-4 bg-background shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={onClearAllFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="filter-categories">
        <Tabs value={selectedFilterCategory} onValueChange={onSelectFilterCategory} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0 mb-3">
            <TabsTrigger
              value="all"
              className={cn(
                "flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                selectedFilterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              All Filters
            </TabsTrigger>
            {filterCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  selectedFilterCategory === category.id ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <span className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Active filters section */}
          {activeFilters.length > 0 && (
            <div className="active-filters mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-1.5">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1 h-6 px-2 text-xs bg-muted/50 hover:bg-muted"
                  >
                    <span className="font-medium">{filter.category.split(".").pop()}:</span> {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-muted-foreground/20"
                      onClick={() => onRemoveFilter(index)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px] pr-4 overflow-auto">
              {filterCategories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={expandedGroups[category.id]}
                  onOpenChange={() => toggleGroup(category.id)}
                  className="mb-3 border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-1 text-xs font-medium bg-muted/50 hover:bg-muted">
                    <div className="flex items-center gap-1">
                      {category.icon}
                      {category.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {category.hasPreWrittenMessages && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            let messageCategory: FilterCategory = "Invoice Reminders"
                            switch (category.id) {
                              case "invoice-reminders":
                                messageCategory = "Invoice Reminders"
                                break
                              case "route-changes":
                                messageCategory = "Route Changes"
                                break
                              case "price-rate-changes":
                                messageCategory = "Price/Rate Changes"
                                break
                              case "general-office-notes":
                                messageCategory = "General Office Notes"
                                break
                            }
                            onShowPreWrittenMessages(messageCategory)
                          }}
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline text-xs">Templates</span>
                        </Button>
                      )}
                      {expandedGroups[category.id] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-2 bg-background">
                    <div className="flex flex-wrap gap-1">
                      {category.filters.map((filter) => (
                        <Popover key={`${category.id}-${filter.key}`}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-xs px-2 py-0 justify-between">
                              <span className="truncate">{filter.label}</span>
                              <ChevronDown className="ml-1 h-3 w-3 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto min-w-[200px] max-w-[280px] p-0" align="start">
                            <div className="p-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="font-medium text-sm">{filter.label}</h4>
                                {activeFilters.some((af) => af.category === filter.key) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs px-2 text-muted-foreground"
                                    onClick={() => {
                                      activeFilters
                                        .filter((af) => af.category === filter.key)
                                        .forEach((_, idx) => {
                                          const index = activeFilters.findIndex((af) => af.category === filter.key)
                                          if (index !== -1) {
                                            onRemoveFilter(index)
                                          }
                                        })
                                    }}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>

                              {filter.options && filter.options.length > 5 && (
                                <div className="relative mb-2">
                                  <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input
                                    placeholder={`Search ${filter.label.toLowerCase()}...`}
                                    className="pl-7 h-7 text-xs"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                </div>
                              )}

                              <ScrollArea className="max-h-[200px] pr-2">
                                <div className="space-y-1">
                                  {getFilteredOptions(filter.options).map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${filter.key}-${option.value}`}
                                        className="h-3.5 w-3.5 rounded-sm"
                                        checked={activeFilters.some(
                                          (activeFilter) =>
                                            activeFilter.category === filter.key && activeFilter.value === option.value,
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            onAddFilter(filter.key, option.value, option.label)
                                          } else {
                                            const index = activeFilters.findIndex(
                                              (activeFilter) =>
                                                activeFilter.category === filter.key &&
                                                activeFilter.value === option.value,
                                            )
                                            if (index !== -1) {
                                              onRemoveFilter(index)
                                            }
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`${filter.key}-${option.value}`}
                                        className="text-xs cursor-pointer"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  ))}

                                  {getFilteredOptions(filter.options).length === 0 && (
                                    <div className="text-xs text-muted-foreground py-2 text-center">
                                      No options match your search
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </ScrollArea>
          </TabsContent>

          {filterCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="m-0">
              <ScrollArea className="max-h-[400px] h-auto pr-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <h3 className="text-sm font-medium">{category.label} Filters</h3>
                  </div>
                  {category.hasPreWrittenMessages && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        let messageCategory: FilterCategory = "Invoice Reminders"
                        switch (category.id) {
                          case "invoice-reminders":
                            messageCategory = "Invoice Reminders"
                            break
                          case "route-changes":
                            messageCategory = "Route Changes"
                            break
                          case "price-rate-changes":
                            messageCategory = "Price/Rate Changes"
                            break
                          case "general-office-notes":
                            messageCategory = "General Office Notes"
                            break
                        }
                        onShowPreWrittenMessages(messageCategory)
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Templates
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {category.filters.map((filter) => (
                    <Popover key={`${category.id}-${filter.key}`}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2 py-0 justify-between">
                          <span className="truncate">{filter.label}</span>
                          <div className="flex items-center gap-1">
                            {activeFilters.some((af) => af.category === filter.key) && (
                              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                {activeFilters.filter((af) => af.category === filter.key).length}
                              </Badge>
                            )}
                            <ChevronDown className="h-3 w-3 shrink-0" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto min-w-[200px] max-w-[280px] p-0" align="start">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-medium text-sm">{filter.label}</h4>
                            {activeFilters.some((af) => af.category === filter.key) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 text-muted-foreground"
                                onClick={() => {
                                  activeFilters
                                    .filter((af) => af.category === filter.key)
                                    .forEach((_, idx) => {
                                      const index = activeFilters.findIndex((af) => af.category === filter.key)
                                      if (index !== -1) {
                                        onRemoveFilter(index)
                                      }
                                    })
                                }}
                              >
                                Clear
                              </Button>
                            )}
                          </div>

                          {filter.options && filter.options.length > 5 && (
                            <div className="relative mb-2">
                              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder={`Search ${filter.label.toLowerCase()}...`}
                                className="pl-7 h-7 text-xs"
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                          )}

                          <ScrollArea className="max-h-[200px] pr-2">
                            <div className="space-y-1">
                              {getFilteredOptions(filter.options).map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${filter.key}-${option.value}`}
                                    className="h-3.5 w-3.5 rounded-sm"
                                    checked={activeFilters.some(
                                      (activeFilter) =>
                                        activeFilter.category === filter.key && activeFilter.value === option.value,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        onAddFilter(filter.key, option.value, option.label)
                                      } else {
                                        const index = activeFilters.findIndex(
                                          (activeFilter) =>
                                            activeFilter.category === filter.key && activeFilter.value === option.value,
                                        )
                                        if (index !== -1) {
                                          onRemoveFilter(index)
                                        }
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`${filter.key}-${option.value}`} className="text-xs cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}

                              {getFilteredOptions(filter.options).length === 0 && (
                                <div className="text-xs text-muted-foreground py-2 text-center">
                                  No options match your search
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClearAllFilters}>
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Reset Filters
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Custom Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="end">
            <h4 className="font-medium mb-2 text-sm">Add Custom Filter</h4>
            <div className="space-y-3">
              <div className="grid gap-1">
                <Label htmlFor="filter-category" className="text-xs">
                  Filter Category
                </Label>
                <select
                  id="filter-category"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedFilterCategory === "all"
                    ? filterCategories.flatMap((category) =>
                        category.filters.map((filter) => (
                          <option key={`${category.id}-${filter.key}`} value={filter.key}>
                            {category.label}: {filter.label}
                          </option>
                        )),
                      )
                    : filterCategories
                        .find((category) => category.id === selectedFilterCategory)
                        ?.filters.map((filter) => (
                          <option key={`${selectedFilterCategory}-${filter.key}`} value={filter.key}>
                            {filter.label}
                          </option>
                        ))}
                </select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="filter-value" className="text-xs">
                  Filter Value
                </Label>
                <Input id="filter-value" placeholder="Enter filter value" className="h-8 text-xs" />
              </div>
              <Button
                className="w-full h-8 text-xs"
                onClick={() => {
                  const categorySelect = document.getElementById("filter-category") as HTMLSelectElement
                  const valueInput = document.getElementById("filter-value") as HTMLInputElement

                  if (categorySelect && valueInput && valueInput.value.trim()) {
                    const categoryKey = categorySelect.value
                    const filterCategory =
                      selectedFilterCategory === "all"
                        ? filterCategories.find((category) =>
                            category.filters.some((filter) => filter.key === categoryKey),
                          )
                        : filterCategories.find((category) => category.id === selectedFilterCategory)

                    const filter = filterCategory?.filters.find((f) => f.key === categoryKey)

                    if (filter) {
                      onAddFilter(categoryKey, valueInput.value.trim(), valueInput.value.trim())
                      valueInput.value = ""
                    }
                  }
                }}
              >
                Add Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
