"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  X,
  Save,
  ArrowRight,
  Tag,
  Calendar,
  Hash,
  AlignLeft,
  Users,
  CheckCircle2,
  CreditCard,
  TruckIcon,
  DollarSign,
  MessageSquare,
} from "lucide-react"
import { useCustomerLists } from "./customer-lists-context"
import { useToast } from "@/components/ui/use-toast"
import { ListCreatedToast } from "./list-created-toast"
import type { Customer, FilterCategory } from "./customer-types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

// Import the updated mockCustomers
import { mockCustomers, preWrittenMessages, initializeMockData } from "./mock-data"

// Filter types
type FilterOperator =
  | "contains"
  | "equals"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "between"
  | "has_tag"
  | "before"
  | "after"
  | "is_empty"
  | "is_not_empty"

type FilterType = "text" | "number" | "date" | "tag" | "boolean" | "select"

interface FilterOption {
  id: string
  field: string
  fieldLabel: string
  type: FilterType
  operator: FilterOperator
  value: string | string[] | number | boolean | null
  secondValue?: string | number | null // For "between" operators
  category?: FilterCategory
}

interface FilterGroup {
  id: string
  label: string
  icon: React.ReactNode
  category: FilterCategory
  filters: {
    id: string
    field: string
    label: string
    type: FilterType
    operators: FilterOperator[]
    options?: { label: string; value: string }[]
  }[]
}

interface RecipientSelectionProps {
  onSelectRecipients: (recipients: Customer[]) => void
  onSaveList: (name: string, description: string, recipients: Customer[]) => void
  onCancel?: () => void
}

export function RecipientSelection({ onSelectRecipients, onSaveList, onCancel }: RecipientSelectionProps) {
  // State for active filters
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [selectedCount, setSelectedCount] = useState(0)
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [savedLists, setSavedLists] = useState<{ id: number; name: string; count: number }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null)
  // Add this with the other state variables
  const [configuringFilter, setConfiguringFilter] = useState<Omit<FilterOption, "id"> | null>(null)

  const { customerLists, addCustomerList } = useCustomerLists()
  const { toast } = useToast()

  // Add useEffect to ensure data is loaded
  useEffect(() => {
    // Make sure the mock data is initialized
    if (mockCustomers.length === 0) {
      initializeMockData()
    }
  }, [])

  // Initialize saved lists
  useEffect(() => {
    // Only update if the lists have actually changed
    const newSavedLists = customerLists.map((list) => ({
      id: list.id,
      name: list.name,
      count: list.count,
    }))

    // Compare current and new lists before updating state
    if (JSON.stringify(savedLists) !== JSON.stringify(newSavedLists)) {
      setSavedLists(newSavedLists)
    }
  }, [customerLists])

  // Initialize expanded groups
  useEffect(() => {
    const initialState: Record<string, boolean> = {}
    filterGroups.forEach((group) => {
      initialState[group.id] = true
    })
    setExpandedGroups(initialState)
  }, [])

  // Filter groups definition based on the provided structure
  const filterGroups: FilterGroup[] = [
    {
      id: "invoice-reminders",
      label: "Invoice Reminders",
      icon: <CreditCard className="h-4 w-4" />,
      category: "Invoice Reminders",
      filters: [
        {
          id: "account-groups",
          field: "accountGroup",
          label: "Account Groups",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "VIP", value: "VIP" },
            { label: "Standard", value: "Standard" },
            { label: "New", value: "New" },
            { label: "Delinquent", value: "Delinquent" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
        {
          id: "days-late",
          field: "invoices.daysLate",
          label: "Number of Days Late",
          type: "number",
          operators: ["greater_than", "less_than", "between", "equals"],
        },
        {
          id: "ar-balance",
          field: "arBalance",
          label: "AR Balance",
          type: "number",
          operators: ["greater_than", "less_than", "between", "equals"],
        },
        {
          id: "bill-group",
          field: "billGroup",
          label: "Bill Group",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Monthly", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Annual", value: "Annual" },
            { label: "Pre-paid", value: "Pre-paid" },
            { label: "Custom", value: "Custom" },
          ],
        },
        {
          id: "tags",
          field: "tags",
          label: "Tags",
          type: "tag",
          operators: ["has_tag"],
          options: [
            { label: "New Customer", value: "New Customer" },
            { label: "Recycling", value: "Recycling" },
            { label: "Paperless", value: "Paperless" },
            { label: "Large Account", value: "Large Account" },
            { label: "Multi-Location", value: "Multi-Location" },
            { label: "Former Customer", value: "Former Customer" },
            { label: "Hazardous Waste", value: "Hazardous Waste" },
            { label: "Yard Waste", value: "Yard Waste" },
            { label: "E-Waste", value: "E-Waste" },
            { label: "Municipal", value: "Municipal" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
      ],
    },
    {
      id: "route-changes",
      label: "Route Changes",
      icon: <TruckIcon className="h-4 w-4" />,
      category: "Route Changes",
      filters: [
        {
          id: "route-name",
          field: "routes.name",
          label: "Route Name",
          type: "text",
          operators: ["contains", "equals"],
        },
        {
          id: "route-day-of-week",
          field: "routes.dayOfWeek",
          label: "Route Day of Week",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Monday", value: "Monday" },
            { label: "Tuesday", value: "Tuesday" },
            { label: "Wednesday", value: "Wednesday" },
            { label: "Thursday", value: "Thursday" },
            { label: "Friday", value: "Friday" },
            { label: "Saturday", value: "Saturday" },
            { label: "Sunday", value: "Sunday" },
          ],
        },
        {
          id: "service-name",
          field: "services.name",
          label: "Service Name",
          type: "text",
          operators: ["contains", "equals"],
        },
        {
          id: "service-recurrence",
          field: "services.recurrence",
          label: "Service Recurrence",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Weekly", value: "Weekly" },
            { label: "Bi-Weekly", value: "Bi-Weekly" },
            { label: "Monthly", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Annually", value: "Annually" },
          ],
        },
        {
          id: "business-line",
          field: "services.businessLine",
          label: "Business Line",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Residential", value: "Residential" },
            { label: "Commercial", value: "Commercial" },
            { label: "Industrial", value: "Industrial" },
            { label: "Municipal", value: "Municipal" },
          ],
        },
        {
          id: "method",
          field: "services.method",
          label: "Method",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Curbside", value: "Curbside" },
            { label: "Driveway", value: "Driveway" },
            { label: "Alley", value: "Alley" },
            { label: "Container", value: "Container" },
          ],
        },
        {
          id: "material",
          field: "services.material",
          label: "Material",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Trash", value: "Trash" },
            { label: "Recycling", value: "Recycling" },
            { label: "Yard Waste", value: "Yard Waste" },
            { label: "Bulk", value: "Bulk" },
            { label: "Hazardous", value: "Hazardous" },
          ],
        },
        {
          id: "route-bill-group",
          field: "billGroup",
          label: "Bill Group",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Monthly", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Annual", value: "Annual" },
            { label: "Pre-paid", value: "Pre-paid" },
            { label: "Custom", value: "Custom" },
          ],
        },
        {
          id: "route-tags",
          field: "tags",
          label: "Tags",
          type: "tag",
          operators: ["has_tag"],
          options: [
            { label: "New Customer", value: "New Customer" },
            { label: "Recycling", value: "Recycling" },
            { label: "Paperless", value: "Paperless" },
            { label: "Large Account", value: "Large Account" },
            { label: "Multi-Location", value: "Multi-Location" },
            { label: "Former Customer", value: "Former Customer" },
            { label: "Hazardous Waste", value: "Hazardous Waste" },
            { label: "Yard Waste", value: "Yard Waste" },
            { label: "E-Waste", value: "E-Waste" },
            { label: "Municipal", value: "Municipal" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
        {
          id: "route-location-state",
          field: "location.state",
          label: "Location State",
          type: "text",
          operators: ["equals"],
        },
        {
          id: "route-location-zip",
          field: "location.zip",
          label: "Location ZIP",
          type: "text",
          operators: ["equals", "contains"],
        },
      ],
    },
    {
      id: "price-rate-changes",
      label: "Price/Rate Changes",
      icon: <DollarSign className="h-4 w-4" />,
      category: "Price/Rate Changes",
      filters: [
        {
          id: "price-bill-group",
          field: "billGroup",
          label: "Bill Group",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Monthly", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Annual", value: "Annual" },
            { label: "Pre-paid", value: "Pre-paid" },
            { label: "Custom", value: "Custom" },
          ],
        },
        {
          id: "priced-services",
          field: "services.name",
          label: "Priced Services",
          type: "text",
          operators: ["contains", "equals"],
        },
        {
          id: "configured-service-price",
          field: "services.configuredPrice",
          label: "Configured Service Price",
          type: "boolean",
          operators: ["is_empty", "is_not_empty"],
        },
        {
          id: "fees",
          field: "services.fees.name",
          label: "Fees",
          type: "text",
          operators: ["contains", "equals"],
        },
        {
          id: "pricing-zone",
          field: "pricingZone",
          label: "Pricing Zone",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Zone A", value: "Zone A" },
            { label: "Zone B", value: "Zone B" },
            { label: "Zone C", value: "Zone C" },
            { label: "Zone D", value: "Zone D" },
          ],
        },
        {
          id: "price-tags",
          field: "tags",
          label: "Tags",
          type: "tag",
          operators: ["has_tag"],
          options: [
            { label: "New Customer", value: "New Customer" },
            { label: "Recycling", value: "Recycling" },
            { label: "Paperless", value: "Paperless" },
            { label: "Large Account", value: "Large Account" },
            { label: "Multi-Location", value: "Multi-Location" },
            { label: "Former Customer", value: "Former Customer" },
            { label: "Hazardous Waste", value: "Hazardous Waste" },
            { label: "Yard Waste", value: "Yard Waste" },
            { label: "E-Waste", value: "E-Waste" },
            { label: "Municipal", value: "Municipal" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
        {
          id: "price-location-state",
          field: "location.state",
          label: "Location State",
          type: "text",
          operators: ["equals"],
        },
        {
          id: "price-location-zip",
          field: "location.zip",
          label: "Location ZIP",
          type: "text",
          operators: ["equals", "contains"],
        },
      ],
    },
    {
      id: "general-office-notes",
      label: "General Office Notes",
      icon: <MessageSquare className="h-4 w-4" />,
      category: "General Office Notes",
      filters: [
        {
          id: "notes-account-groups",
          field: "accountGroup",
          label: "Account Groups",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "VIP", value: "VIP" },
            { label: "Standard", value: "Standard" },
            { label: "New", value: "New" },
            { label: "Delinquent", value: "Delinquent" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
        {
          id: "notes-bill-group",
          field: "billGroup",
          label: "Bill Group",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Monthly", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Annual", value: "Annual" },
            { label: "Pre-paid", value: "Pre-paid" },
            { label: "Custom", value: "Custom" },
          ],
        },
        {
          id: "notes-tags",
          field: "tags",
          label: "Tags",
          type: "tag",
          operators: ["has_tag"],
          options: [
            { label: "New Customer", value: "New Customer" },
            { label: "Recycling", value: "Recycling" },
            { label: "Paperless", value: "Paperless" },
            { label: "Large Account", value: "Large Account" },
            { label: "Multi-Location", value: "Multi-Location" },
            { label: "Former Customer", value: "Former Customer" },
            { label: "Hazardous Waste", value: "Hazardous Waste" },
            { label: "Yard Waste", value: "Yard Waste" },
            { label: "E-Waste", value: "E-Waste" },
            { label: "Municipal", value: "Municipal" },
            { label: "Seasonal", value: "Seasonal" },
          ],
        },
        {
          id: "account-city",
          field: "location.city",
          label: "Account City",
          type: "text",
          operators: ["equals", "contains"],
        },
        {
          id: "account-state",
          field: "location.state",
          label: "Account State",
          type: "text",
          operators: ["equals"],
        },
        {
          id: "notes-pricing-zone",
          field: "pricingZone",
          label: "Pricing Zone",
          type: "select",
          operators: ["equals"],
          options: [
            { label: "Zone A", value: "Zone A" },
            { label: "Zone B", value: "Zone B" },
            { label: "Zone C", value: "Zone C" },
            { label: "Zone D", value: "Zone D" },
          ],
        },
      ],
    },
  ]

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  // Add a filter
  const addFilter = (filter: Omit<FilterOption, "id">) => {
    // Ensure the filter has a valid initial value
    const initialValue =
      filter.value !== undefined && filter.value !== null
        ? filter.value
        : filter.type === "select" || filter.type === "tag"
          ? filter.operator === "is_empty" || filter.operator === "is_not_empty"
            ? null
            : ""
          : filter.operator === "is_empty" || filter.operator === "is_not_empty"
            ? null
            : ""

    const newFilter = {
      ...filter,
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: initialValue,
    }
    setActiveFilters((prev) => [...prev, newFilter])
  }

  // Remove a filter
  const removeFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([])
  }

  // Helper function to apply operators
  const applyOperator = (
    fieldValue: any,
    operator: FilterOperator,
    value: string | string[] | number | boolean | null,
    secondValue?: string | number | null,
  ): boolean => {
    if (fieldValue === undefined || fieldValue === null) {
      return operator === "is_empty"
    }

    if (operator === "is_empty") return !fieldValue
    if (operator === "is_not_empty") return !!fieldValue

    // Convert to string for text operations
    const strFieldValue = String(fieldValue).toLowerCase()
    const strValue = value !== null ? String(value).toLowerCase() : ""

    switch (operator) {
      case "contains":
        return strFieldValue.includes(strValue)
      case "equals":
        return strFieldValue === strValue
      case "starts_with":
        return strFieldValue.startsWith(strValue)
      case "ends_with":
        return strFieldValue.endsWith(strValue)
      case "greater_than":
        return Number(fieldValue) > Number(value)
      case "less_than":
        return Number(fieldValue) < Number(value)
      case "between":
        return (
          secondValue !== undefined && Number(fieldValue) >= Number(value) && Number(fieldValue) <= Number(secondValue)
        )
      case "has_tag":
        return Array.isArray(fieldValue) && fieldValue.some((tag) => tag.toLowerCase() === strValue)
      case "before":
        // Simple date comparison for demo
        return new Date(fieldValue) < new Date(String(value))
      case "after":
        return new Date(fieldValue) > new Date(String(value))
      default:
        return false
    }
  }

  // Apply filters to customers
  const filteredCustomers = useMemo(() => {
    let results = [...mockCustomers]

    // Apply search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.phone.toLowerCase().includes(query),
      )
    }

    // Apply active filters
    if (activeFilters.length > 0) {
      results = results.filter((customer) => {
        return activeFilters.every((filter) => {
          const { field, operator, value, secondValue } = filter

          // Handle nested fields (e.g., location.city)
          const fieldParts = field.split(".")
          let fieldValue: any = customer

          for (const part of fieldParts) {
            if (fieldValue === undefined || fieldValue === null) return false

            // Handle array fields
            if (Array.isArray(fieldValue)) {
              // For arrays like services, routes, invoices, tags
              if (part === "services" || part === "routes" || part === "invoices" || part === "tags") {
                // For tags, which is a simple string array
                if (part === "tags") {
                  if (operator === "has_tag") {
                    return fieldValue.includes(value)
                  }
                }

                // For object arrays, we need to check if any item matches
                const remainingParts = fieldParts.slice(fieldParts.indexOf(part) + 1)
                return fieldValue.some((item: any) => {
                  let nestedValue = item

                  for (const nestedPart of remainingParts) {
                    if (nestedValue === undefined || nestedValue === null) return false
                    nestedValue = nestedValue[nestedPart]
                  }

                  // Now apply the operator to the nested value
                  return applyOperator(nestedValue, operator, value, secondValue)
                })
              }

              return fieldValue.includes(value)
            }

            fieldValue = fieldValue[part]
          }

          return applyOperator(fieldValue, operator, value, secondValue)
        })
      })
    }

    // Filter to show only selected customers if needed
    if (showSelectedOnly) {
      const selectedIds = selectedCustomers.map((c) => c.id)
      results = results.filter((customer) => selectedIds.includes(customer.id))
    }

    return results
  }, [activeFilters, searchQuery, showSelectedOnly, selectedCustomers])

  // Handle row selection
  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    const selectedIds = Object.entries(rowSelection)
      .filter(([_, selected]) => selected)
      .map(([id]) => id)

    const newSelectedCustomers = filteredCustomers.filter((customer) => selectedIds.includes(customer.id))

    // Only update state if the selection has actually changed
    if (
      JSON.stringify(newSelectedCustomers.map((c) => c.id).sort()) !==
      JSON.stringify(selectedCustomers.map((c) => c.id).sort())
    ) {
      setSelectedCustomers(newSelectedCustomers)
      setSelectedCount(newSelectedCustomers.length)
    }
  }

  // Handle save list
  const handleSaveList = () => {
    const finalName = listName.trim() || `Customer List (${new Date().toLocaleTimeString()})`

    // Add to customer lists
    addCustomerList({
      name: finalName,
      count: selectedCustomers.length,
      type: "Custom",
      description: listDescription,
    })

    // Show success toast
    toast({
      description: <ListCreatedToast listName={finalName} customerCount={selectedCustomers.length} />,
      duration: 5000,
    })

    // Call the parent callback
    onSaveList(finalName, listDescription, selectedCustomers)

    // Reset state
    setShowSaveDialog(false)
    setListName("")
    setListDescription("")
  }

  // Handle continue to compose
  const handleContinueToCompose = () => {
    onSelectRecipients(selectedCustomers)
  }

  // Handle selecting a saved list
  const handleSelectSavedList = (listId: number) => {
    const list = customerLists.find((l) => l.id === listId)
    if (list) {
      // In a real app, you would fetch the customers in this list
      // For this demo, we'll just simulate it with a subset of customers
      const simulatedCustomers = mockCustomers.slice(0, list.count)
      setSelectedCustomers(simulatedCustomers)
      setSelectedCount(simulatedCustomers.length)

      toast({
        title: "List Selected",
        description: `"${list.name}" with ${list.count} customers has been selected.`,
        duration: 3000,
      })
    }
  }

  // Handle selecting a message category
  const handleSelectCategory = (category: FilterCategory) => {
    setSelectedCategory(category)
    setShowTemplates(true)
  }

  // Define columns for the data table
  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.getValue("type") === "commercial" ? "default" : "secondary"}>{row.getValue("type")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "active" ? "outline" : "secondary"}>{row.getValue("status")}</Badge>
      ),
    },
    {
      accessorKey: "accountGroup",
      header: "Account Group",
      cell: ({ row }) => <div>{row.getValue("accountGroup")}</div>,
    },
  ]

  // Render filter operator dropdown
  const renderOperatorDropdown = (filter: FilterOption, onChange: (value: FilterOperator) => void) => {
    const filterDef = filterGroups.flatMap((group) => group.filters).find((f) => f.field === filter.field)

    if (!filterDef) return null

    return (
      <Select value={filter.operator} onValueChange={(value) => onChange(value as FilterOperator)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filterDef.operators.map((op) => (
            <SelectItem key={op} value={op} className="text-xs">
              {formatOperator(op)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Format operator for display
  const formatOperator = (operator: FilterOperator): string => {
    switch (operator) {
      case "contains":
        return "contains"
      case "equals":
        return "equals"
      case "starts_with":
        return "starts with"
      case "ends_with":
        return "ends with"
      case "greater_than":
        return "greater than"
      case "less_than":
        return "less than"
      case "between":
        return "between"
      case "has_tag":
        return "has tag"
      case "before":
        return "before"
      case "after":
        return "after"
      case "is_empty":
        return "is empty"
      case "is_not_empty":
        return "is not empty"
      default:
        return operator
    }
  }

  // Render filter value input
  const renderValueInput = (filter: FilterOption, onChange: (value: any, secondValue?: any) => void) => {
    const filterDef = filterGroups.flatMap((group) => group.filters).find((f) => f.field === filter.field)

    if (!filterDef) return null

    // For empty/not empty operators, no input needed
    if (filter.operator === "is_empty" || filter.operator === "is_not_empty") {
      return null
    }

    // Ensure values are never undefined
    const safeValue = filter.value !== undefined && filter.value !== null ? filter.value : ""
    const safeSecondValue = filter.secondValue !== undefined && filter.secondValue !== null ? filter.secondValue : ""

    switch (filterDef.type) {
      case "select":
        return (
          <Select value={safeValue as string} onValueChange={(value) => onChange(value)}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {filterDef.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "tag":
        return (
          <Select value={safeValue as string} onValueChange={(value) => onChange(value)}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              {filterDef.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        if (filter.operator === "between") {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={safeValue as string}
                onChange={(e) => onChange(e.target.value, safeSecondValue)}
                placeholder="Min"
                className="w-[90px] h-8 text-xs"
              />
              <span>and</span>
              <Input
                type="number"
                value={safeSecondValue as string}
                onChange={(e) => onChange(safeValue, e.target.value)}
                placeholder="Max"
                className="w-[90px] h-8 text-xs"
              />
            </div>
          )
        }
        return (
          <Input
            type="number"
            value={safeValue as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter value"
            className="w-[180px] h-8 text-xs"
          />
        )

      case "date":
        if (filter.operator === "between") {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={safeValue as string}
                onChange={(e) => onChange(e.target.value, safeSecondValue)}
                className="w-[140px] h-8 text-xs"
              />
              <span>and</span>
              <Input
                type="date"
                value={safeSecondValue as string}
                onChange={(e) => onChange(safeValue, e.target.value)}
                className="w-[140px] h-8 text-xs"
              />
            </div>
          )
        }
        return (
          <Input
            type="date"
            value={safeValue as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-[180px] h-8 text-xs"
          />
        )

      case "boolean":
        return (
          <Select value={String(safeValue)} onValueChange={(value) => onChange(value === "true")}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true" className="text-xs">
                Yes
              </SelectItem>
              <SelectItem value="false" className="text-xs">
                No
              </SelectItem>
            </SelectContent>
          </Select>
        )

      // Default to text input
      default:
        return (
          <Input
            value={safeValue as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter value"
            className="w-[180px] h-8 text-xs"
          />
        )
    }
  }

  // Update filter value
  const updateFilterValue = (filterId: string, value: any, secondValue?: any) => {
    setActiveFilters((prev) =>
      prev.map((filter) => {
        if (filter.id === filterId) {
          return {
            ...filter,
            value,
            ...(secondValue !== undefined ? { secondValue } : {}),
          }
        }
        return filter
      }),
    )
  }

  // Update filter operator
  const updateFilterOperator = (filterId: string, operator: FilterOperator) => {
    setActiveFilters((prev) =>
      prev.map((filter) => {
        if (filter.id === filterId) {
          // Reset value when changing operators
          const newFilter = { ...filter, operator }

          // Clear second value if not using 'between'
          if (operator !== "between") {
            delete newFilter.secondValue
          }

          // Clear value for is_empty/is_not_empty
          if (operator === "is_empty" || operator === "is_not_empty") {
            newFilter.value = null
          }

          return newFilter
        }
        return filter
      }),
    )
  }

  // Get icon for filter type
  const getFilterTypeIcon = (type: FilterType) => {
    switch (type) {
      case "text":
        return <AlignLeft className="h-3 w-3" />
      case "number":
        return <Hash className="h-3 w-3" />
      case "date":
        return <Calendar className="h-3 w-3" />
      case "tag":
        return <Tag className="h-3 w-3" />
      case "boolean":
        return <CheckCircle2 className="h-3 w-3" />
      case "select":
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <Filter className="h-3 w-3" />
    }
  }

  // Get icon for filter category
  const getCategoryIcon = (category: FilterCategory) => {
    switch (category) {
      case "Invoice Reminders":
        return <CreditCard className="h-4 w-4" />
      case "Route Changes":
        return <TruckIcon className="h-4 w-4" />
      case "Price/Rate Changes":
        return <DollarSign className="h-4 w-4" />
      case "General Office Notes":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Filter className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Select Recipients</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the customers you want to message. Use filters to narrow down your selection.
          </p>
        </div>

        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left panel - Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 py-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* Filter Categories */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Filters</h3>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full h-8 mb-2">
                  <TabsTrigger value="all" className="text-xs h-7">
                    All Filters
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-xs h-7">
                    Active
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-[300px] pr-2">
                    {filterGroups.map((group) => (
                      <div key={group.id} className="mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-7 font-medium"
                          onClick={() => toggleGroup(group.id)}
                        >
                          {expandedGroups[group.id] ? (
                            <ChevronDown className="mr-1 h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="mr-1 h-3.5 w-3.5" />
                          )}
                          {group.icon}
                          <span className="ml-1">{group.label}</span>
                        </Button>

                        {expandedGroups[group.id] && (
                          <div className="pl-7 space-y-1 mt-1">
                            {group.filters.map((filter) => {
                              // Check if this filter is currently being configured
                              const isConfiguring = configuringFilter?.field === filter.field
                              // Check if this filter is active
                              const activeFilter = activeFilters.find((f) => f.field === filter.field)

                              return (
                                <div key={filter.id} className="mb-2">
                                  <Button
                                    variant={isConfiguring ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`w-full justify-start text-xs h-7 ${activeFilter ? "font-medium" : ""}`}
                                    onClick={() => {
                                      if (isConfiguring) {
                                        setConfiguringFilter(null)
                                      } else {
                                        // Set up initial configuration
                                        setConfiguringFilter({
                                          field: filter.field,
                                          fieldLabel: filter.label,
                                          type: filter.type,
                                          operator: filter.operators[0],
                                          value:
                                            filter.type === "select" || filter.type === "tag"
                                              ? filter.options?.[0]?.value || ""
                                              : "",
                                          category: group.category,
                                        })
                                      }
                                    }}
                                  >
                                    <div className="flex items-center">
                                      {getFilterTypeIcon(filter.type)}
                                      <span className="ml-1.5">{filter.label}</span>
                                    </div>
                                    {activeFilter && (
                                      <Badge variant="outline" className="ml-auto">
                                        Active
                                      </Badge>
                                    )}
                                    {!activeFilter && !isConfiguring && (
                                      <ChevronRight className="ml-auto h-3.5 w-3.5" />
                                    )}
                                    {isConfiguring && <ChevronDown className="ml-auto h-3.5 w-3.5" />}
                                  </Button>

                                  {/* Inline filter configuration */}
                                  {isConfiguring && (
                                    <div className="mt-2 p-3 border rounded-md bg-muted/20">
                                      <div className="space-y-3">
                                        {/* Operator Selection */}
                                        <div>
                                          <Label htmlFor={`${filter.id}-operator`} className="text-xs mb-1 block">
                                            Condition
                                          </Label>
                                          <Select
                                            value={configuringFilter.operator}
                                            onValueChange={(value) => {
                                              setConfiguringFilter((prev) => {
                                                if (!prev) return prev

                                                // Reset value when changing operators
                                                const newOperator = value as FilterOperator
                                                let newValue = prev.value
                                                let newSecondValue = prev.secondValue

                                                // Clear value for is_empty/is_not_empty
                                                if (newOperator === "is_empty" || newOperator === "is_not_empty") {
                                                  newValue = null
                                                  newSecondValue = undefined
                                                }
                                                // Initialize value for select/tag
                                                else if (filter.type === "select" || filter.type === "tag") {
                                                  newValue = filter.options?.[0]?.value || ""
                                                }
                                                // Clear second value if not using 'between'
                                                else if (newOperator !== "between") {
                                                  newSecondValue = undefined
                                                }

                                                return {
                                                  ...prev,
                                                  operator: newOperator,
                                                  value: newValue,
                                                  secondValue: newSecondValue,
                                                }
                                              })
                                            }}
                                          >
                                            <SelectTrigger id={`${filter.id}-operator`} className="w-full h-8 text-xs">
                                              <SelectValue placeholder="Select operator" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {filter.operators.map((op) => (
                                                <SelectItem key={op} value={op} className="text-xs">
                                                  {formatOperator(op)}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Value Input - Dynamically rendered based on filter type */}
                                        {configuringFilter.operator !== "is_empty" &&
                                          configuringFilter.operator !== "is_not_empty" && (
                                            <>
                                              {filter.type === "select" || filter.type === "tag" ? (
                                                <div>
                                                  <Label htmlFor={`${filter.id}-value`} className="text-xs mb-1 block">
                                                    Value
                                                  </Label>
                                                  <Select
                                                    value={configuringFilter.value as string}
                                                    onValueChange={(value) => {
                                                      setConfiguringFilter((prev) => {
                                                        if (!prev) return prev
                                                        return { ...prev, value }
                                                      })
                                                    }}
                                                  >
                                                    <SelectTrigger
                                                      id={`${filter.id}-value`}
                                                      className="w-full h-8 text-xs"
                                                    >
                                                      <SelectValue placeholder="Select value" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {filter.options?.map((option) => (
                                                        <SelectItem
                                                          key={option.value}
                                                          value={option.value}
                                                          className="text-xs"
                                                        >
                                                          {option.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              ) : filter.type === "number" &&
                                                configuringFilter.operator === "between" ? (
                                                <div>
                                                  <Label htmlFor={`${filter.id}-min`} className="text-xs mb-1 block">
                                                    Range
                                                  </Label>
                                                  <div className="flex items-center gap-2">
                                                    <Input
                                                      id={`${filter.id}-min`}
                                                      type="number"
                                                      value={configuringFilter.value as string}
                                                      onChange={(e) => {
                                                        setConfiguringFilter((prev) => {
                                                          if (!prev) return prev
                                                          return { ...prev, value: e.target.value }
                                                        })
                                                      }}
                                                      placeholder="Min"
                                                      className="w-[90px] h-8 text-xs"
                                                    />
                                                    <span>to</span>
                                                    <Input
                                                      id={`${filter.id}-max`}
                                                      type="number"
                                                      value={configuringFilter.secondValue as string}
                                                      onChange={(e) => {
                                                        setConfiguringFilter((prev) => {
                                                          if (!prev) return prev
                                                          return { ...prev, secondValue: e.target.value }
                                                        })
                                                      }}
                                                      placeholder="Max"
                                                      className="w-[90px] h-8 text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              ) : filter.type === "date" && configuringFilter.operator === "between" ? (
                                                <div>
                                                  <Label htmlFor={`${filter.id}-start`} className="text-xs mb-1 block">
                                                    Date Range
                                                  </Label>
                                                  <div className="flex flex-col gap-2">
                                                    <Input
                                                      id={`${filter.id}-start`}
                                                      type="date"
                                                      value={configuringFilter.value as string}
                                                      onChange={(e) => {
                                                        setConfiguringFilter((prev) => {
                                                          if (!prev) return prev
                                                          return { ...prev, value: e.target.value }
                                                        })
                                                      }}
                                                      className="w-full h-8 text-xs"
                                                    />
                                                    <Input
                                                      id={`${filter.id}-end`}
                                                      type="date"
                                                      value={configuringFilter.secondValue as string}
                                                      onChange={(e) => {
                                                        setConfiguringFilter((prev) => {
                                                          if (!prev) return prev
                                                          return { ...prev, secondValue: e.target.value }
                                                        })
                                                      }}
                                                      className="w-full h-8 text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              ) : filter.type === "boolean" ? (
                                                <div>
                                                  <Label htmlFor={`${filter.id}-value`} className="text-xs mb-1 block">
                                                    Value
                                                  </Label>
                                                  <Select
                                                    value={String(configuringFilter.value)}
                                                    onValueChange={(value) => {
                                                      setConfiguringFilter((prev) => {
                                                        if (!prev) return prev
                                                        return { ...prev, value: value === "true" }
                                                      })
                                                    }}
                                                  >
                                                    <SelectTrigger
                                                      id={`${filter.id}-value`}
                                                      className="w-full h-8 text-xs"
                                                    >
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="true" className="text-xs">
                                                        Yes
                                                      </SelectItem>
                                                      <SelectItem value="false" className="text-xs">
                                                        No
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              ) : (
                                                // Default to text input
                                                <div>
                                                  <Label htmlFor={`${filter.id}-value`} className="text-xs mb-1 block">
                                                    Value
                                                  </Label>
                                                  <Input
                                                    id={`${filter.id}-value`}
                                                    value={configuringFilter.value as string}
                                                    onChange={(e) => {
                                                      setConfiguringFilter((prev) => {
                                                        if (!prev) return prev
                                                        return { ...prev, value: e.target.value }
                                                      })
                                                    }}
                                                    placeholder="Enter value"
                                                    className="w-full h-8 text-xs"
                                                  />
                                                </div>
                                              )}
                                            </>
                                          )}

                                        {/* Apply Button */}
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={() => {
                                              setConfiguringFilter(null)
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            className="flex-1 h-8 text-xs"
                                            onClick={() => {
                                              if (!configuringFilter) return

                                              // Add the filter
                                              addFilter({
                                                field: configuringFilter.field,
                                                fieldLabel: configuringFilter.fieldLabel,
                                                type: configuringFilter.type,
                                                operator: configuringFilter.operator,
                                                value: configuringFilter.value,
                                                secondValue: configuringFilter.secondValue,
                                                category: configuringFilter.category,
                                              })

                                              // Close the configuration
                                              setConfiguringFilter(null)

                                              // Switch to active filters tab
                                              setActiveTab("active")
                                            }}
                                          >
                                            Apply Filter
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="active" className="m-0">
                  {activeFilters.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No active filters. Add filters to refine your selection.
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-2">
                        {activeFilters.map((filter) => (
                          <div key={filter.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center text-xs font-medium mb-1">
                                {getFilterTypeIcon(filter.type)}
                                <span className="ml-1.5">{filter.fieldLabel}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {renderOperatorDropdown(filter, (operator) =>
                                  updateFilterOperator(filter.id, operator),
                                )}

                                {renderValueInput(filter, (value, secondValue) =>
                                  updateFilterValue(filter.id, value, secondValue),
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 self-start"
                              onClick={() => removeFilter(filter.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Message Templates */}
          {selectedCategory && showTemplates && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Message Templates</h3>
                </div>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {preWrittenMessages[selectedCategory].map((message, index) => (
                      <div key={index} className="p-2 border rounded-md text-xs">
                        {message}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Saved Lists */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Saved Lists</h3>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  View All
                </Button>
              </div>

              <ScrollArea className="h-[120px]">
                <div className="space-y-1">
                  {savedLists.map((list) => (
                    <Button
                      key={list.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-7"
                      onClick={() => handleSelectSavedList(list.id)}
                    >
                      <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      {list.name}
                      <Badge variant="outline" className="ml-auto">
                        {list.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Results */}
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-10rem)]">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Results</h3>
                  <Badge variant="outline">{filteredCustomers.length} customers</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="show-selected"
                      checked={showSelectedOnly}
                      onCheckedChange={(checked) => setShowSelectedOnly(!!checked)}
                    />
                    <Label htmlFor="show-selected" className="text-xs cursor-pointer">
                      Show selected only
                    </Label>
                  </div>

                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Export
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <DataTable columns={columns} data={filteredCustomers} onRowSelectionChange={handleRowSelectionChange} />
              </div>
            </CardContent>
          </Card>

          {/* Action buttons - Fixed footer */}
          <div className="flex items-center justify-between py-4 bg-background border-t mt-4 sticky bottom-0">
            <div className="text-sm">
              <span className="font-medium">{selectedCount}</span> customers selected
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(true)} disabled={selectedCount === 0}>
                <Save className="mr-2 h-4 w-4" />
                Save as List
              </Button>

              <Button onClick={handleContinueToCompose} disabled={selectedCount === 0}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue to Compose
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save List Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Customer List</DialogTitle>
            <DialogDescription>Give your list a name and description to save it for future use.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                placeholder="Enter list name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-description">Description (Optional)</Label>
              <Input
                id="list-description"
                placeholder="Enter description"
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveList}>Save List ({selectedCount} customers)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
