"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Plus, Trash2, Eye, EyeOff, ArrowUpDown, Layers, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Define types for filter conditions
interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
  isGroup?: boolean
  conditions?: FilterCondition[]
  logicalOperator?: "and" | "or"
}

interface EnhancedFilterSystemProps {
  onApplyFilters: (filters: FilterCondition[]) => void
  onSaveList: (name: string, description: string, filters: FilterCondition[]) => void
  availableFields: {
    name: string
    key: string
    type: "text" | "select" | "date" | "number" | "boolean"
    options?: { label: string; value: string }[]
  }[]
}

export function EnhancedFilterSystem({ onApplyFilters, onSaveList, availableFields }: EnhancedFilterSystemProps) {
  const [rootConditions, setRootConditions] = useState<FilterCondition[]>([
    {
      id: "1",
      field: availableFields[0]?.key || "",
      operator: "contains",
      value: "",
    },
  ])
  const [rootLogicalOperator, setRootLogicalOperator] = useState<"and" | "or">("and")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [activeTab, setActiveTab] = useState<string>("filter")
  const [visibleFields, setVisibleFields] = useState<string[]>(availableFields.map((field) => field.key))

  // Generate a unique ID for new conditions
  const generateId = () => `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Add a new condition at the root level
  const addCondition = () => {
    setRootConditions([
      ...rootConditions,
      {
        id: generateId(),
        field: availableFields[0]?.key || "",
        operator: "contains",
        value: "",
      },
    ])
  }

  // Add a new condition group at the root level
  const addConditionGroup = () => {
    setRootConditions([
      ...rootConditions,
      {
        id: generateId(),
        field: "",
        operator: "",
        value: "",
        isGroup: true,
        conditions: [
          {
            id: generateId(),
            field: availableFields[0]?.key || "",
            operator: "contains",
            value: "",
          },
        ],
        logicalOperator: "and",
      },
    ])
  }

  // Update a condition
  const updateCondition = (
    conditions: FilterCondition[],
    conditionId: string,
    updates: Partial<FilterCondition>,
  ): FilterCondition[] => {
    return conditions.map((condition) => {
      if (condition.id === conditionId) {
        return { ...condition, ...updates }
      }

      if (condition.isGroup && condition.conditions) {
        return {
          ...condition,
          conditions: updateCondition(condition.conditions, conditionId, updates),
        }
      }

      return condition
    })
  }

  // Remove a condition
  const removeCondition = (conditions: FilterCondition[], conditionId: string): FilterCondition[] => {
    return conditions
      .filter((condition) => condition.id !== conditionId)
      .map((condition) => {
        if (condition.isGroup && condition.conditions) {
          return {
            ...condition,
            conditions: removeCondition(condition.conditions, conditionId),
          }
        }
        return condition
      })
  }

  // Update a condition at any level
  const handleUpdateCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    setRootConditions((prevConditions) => updateCondition(prevConditions, conditionId, updates))
  }

  // Remove a condition at any level
  const handleRemoveCondition = (conditionId: string) => {
    setRootConditions((prevConditions) => removeCondition(prevConditions, conditionId))
  }

  // Add a condition to a group
  const addConditionToGroup = (groupId: string) => {
    setRootConditions((prevConditions) => {
      return prevConditions.map((condition) => {
        if (condition.id === groupId && condition.isGroup) {
          return {
            ...condition,
            conditions: [
              ...(condition.conditions || []),
              {
                id: generateId(),
                field: availableFields[0]?.key || "",
                operator: "contains",
                value: "",
              },
            ],
          }
        }

        if (condition.isGroup && condition.conditions) {
          return {
            ...condition,
            conditions: condition.conditions.map((subCondition) => {
              if (subCondition.id === groupId && subCondition.isGroup) {
                return {
                  ...subCondition,
                  conditions: [
                    ...(subCondition.conditions || []),
                    {
                      id: generateId(),
                      field: availableFields[0]?.key || "",
                      operator: "contains",
                      value: "",
                    },
                  ],
                }
              }
              return subCondition
            }),
          }
        }

        return condition
      })
    })
  }

  // Update logical operator for a group
  const updateGroupOperator = (groupId: string, operator: "and" | "or") => {
    if (groupId === "root") {
      setRootLogicalOperator(operator)
      return
    }

    setRootConditions((prevConditions) => {
      return prevConditions.map((condition) => {
        if (condition.id === groupId && condition.isGroup) {
          return {
            ...condition,
            logicalOperator: operator,
          }
        }

        if (condition.isGroup && condition.conditions) {
          return {
            ...condition,
            conditions: condition.conditions.map((subCondition) => {
              if (subCondition.id === groupId && subCondition.isGroup) {
                return {
                  ...subCondition,
                  logicalOperator: operator,
                }
              }
              return subCondition
            }),
          }
        }

        return condition
      })
    })
  }

  // Apply filters
  const applyFilters = () => {
    onApplyFilters(rootConditions)
  }

  // Save list
  const handleSaveList = () => {
    onSaveList(listName || `Customer List (${new Date().toLocaleTimeString()})`, listDescription, rootConditions)
    setShowSaveDialog(false)
  }

  // Toggle field visibility
  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => (prev.includes(fieldKey) ? prev.filter((key) => key !== fieldKey) : [...prev, fieldKey]))
  }

  // Render a single condition
  const renderCondition = (condition: FilterCondition, isInGroup = false) => {
    if (condition.isGroup && condition.conditions) {
      return renderConditionGroup(condition)
    }

    const fieldDef = availableFields.find((f) => f.key === condition.field)

    return (
      <div key={condition.id} className="flex items-center gap-2 mb-2">
        <Select
          value={condition.field}
          onValueChange={(value) => handleUpdateCondition(condition.id, { field: value })}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map((field) => (
              <SelectItem key={field.key} value={field.key} className="text-xs">
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value) => handleUpdateCondition(condition.id, { operator: value })}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains" className="text-xs">
              contains
            </SelectItem>
            <SelectItem value="equals" className="text-xs">
              equals
            </SelectItem>
            <SelectItem value="starts_with" className="text-xs">
              starts with
            </SelectItem>
            <SelectItem value="ends_with" className="text-xs">
              ends with
            </SelectItem>
            {fieldDef?.type === "number" || fieldDef?.type === "date" ? (
              <>
                <SelectItem value="greater_than" className="text-xs">
                  greater than
                </SelectItem>
                <SelectItem value="less_than" className="text-xs">
                  less than
                </SelectItem>
                <SelectItem value="between" className="text-xs">
                  between
                </SelectItem>
              </>
            ) : null}
            {fieldDef?.type === "boolean" ? (
              <SelectItem value="is" className="text-xs">
                is
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>

        {fieldDef?.type === "select" ? (
          <Select value={condition.value} onValueChange={(value) => handleUpdateCondition(condition.id, { value })}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {fieldDef.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter a value"
            className="w-[200px] h-9 text-xs"
          />
        )}

        <Button variant="ghost" size="icon" onClick={() => handleRemoveCondition(condition.id)} className="h-9 w-9">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Render a condition group
  const renderConditionGroup = (group: FilterCondition) => {
    if (!group.isGroup || !group.conditions) return null

    return (
      <div key={group.id} className="border rounded-md p-3 mb-3 bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium">Any of the following are true...</Label>
            <Select
              value={group.logicalOperator || "and"}
              onValueChange={(value: "and" | "or") => updateGroupOperator(group.id, value)}
            >
              <SelectTrigger className="w-[80px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and" className="text-xs">
                  and
                </SelectItem>
                <SelectItem value="or" className="text-xs">
                  or
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleRemoveCondition(group.id)} className="h-7 w-7">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="pl-4 border-l-2 border-muted-foreground/20">
          {group.conditions.map((condition) => renderCondition(condition, true))}
        </div>

        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addConditionToGroup(group.id)} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add condition
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="filter" className="text-xs">
                <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
              </TabsTrigger>
              <TabsTrigger value="sort" className="text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" /> Sort
              </TabsTrigger>
              <TabsTrigger value="group" className="text-xs">
                <Layers className="h-3.5 w-3.5 mr-1.5" /> Group
              </TabsTrigger>
              <TabsTrigger value="fields" className="text-xs">
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Hide fields
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="h-8 text-xs">
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save as list
              </Button>
              <Button size="sm" onClick={applyFilters} className="h-8 text-xs">
                Apply
              </Button>
            </div>
          </div>

          <TabsContent value="filter" className="m-0">
            <div className="mb-3">
              <Label className="text-xs font-medium mb-2 block">In this view, show records</Label>

              <div className="flex items-center gap-2 mb-2">
                <Select
                  value={rootLogicalOperator}
                  onValueChange={(value: "and" | "or") => setRootLogicalOperator(value as "and" | "or")}
                >
                  <SelectTrigger className="w-[80px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and" className="text-xs">
                      and
                    </SelectItem>
                    <SelectItem value="or" className="text-xs">
                      or
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {rootConditions.map((condition) => renderCondition(condition))}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={addCondition} className="h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add condition
                </Button>
                <Button variant="outline" size="sm" onClick={addConditionGroup} className="h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add condition group
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sort" className="m-0">
            <div className="p-4 flex flex-col gap-3">
              <Label className="text-sm font-medium">Sort by</Label>

              <div className="flex items-center gap-2">
                <Select defaultValue={availableFields[0]?.key}>
                  <SelectTrigger className="w-[200px] h-9 text-xs">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.key} value={field.key} className="text-xs">
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="asc">
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc" className="text-xs">
                      Ascending
                    </SelectItem>
                    <SelectItem value="desc" className="text-xs">
                      Descending
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" className="w-fit h-8 text-xs mt-2">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add sort
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="group" className="m-0">
            <div className="p-4 flex flex-col gap-3">
              <Label className="text-sm font-medium">Group by</Label>

              <div className="flex items-center gap-2">
                <Select defaultValue={availableFields[0]?.key}>
                  <SelectTrigger className="w-[200px] h-9 text-xs">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.key} value={field.key} className="text-xs">
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" className="w-fit h-8 text-xs mt-2">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add grouping
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="m-0">
            <div className="p-4">
              <Label className="text-sm font-medium mb-3 block">Toggle field visibility</Label>

              <div className="grid grid-cols-2 gap-2">
                {availableFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFieldVisibility(field.key)}
                      className={cn(
                        "h-8 text-xs justify-start",
                        !visibleFields.includes(field.key) && "text-muted-foreground",
                      )}
                    >
                      {visibleFields.includes(field.key) ? (
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {field.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save List Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-[400px] max-w-[90vw]">
              <h3 className="text-lg font-semibold mb-4">Save Customer List</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Enter list name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="list-description">Description (Optional)</Label>
                  <Input
                    id="list-description"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    placeholder="Enter description"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveList}>Save List</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
