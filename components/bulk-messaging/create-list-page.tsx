"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, ArrowRight } from "lucide-react"
import { useCustomerLists } from "@/components/bulk-messaging/customer-lists-context"
import { useToast } from "@/components/ui/use-toast"
import { ListCreatedToast } from "@/components/bulk-messaging/list-created-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

import type { Customer } from "./customer-types"
import { mockCustomers } from "./mock-data"
import { EnhancedFilterSystem } from "./enhanced-filter-system"

interface CreateListPageProps {
  onBack?: () => void
  onListCreated?: (listName: string, customerCount: number, description?: string) => void
}

export function CreateListPage({ onBack, onListCreated }: CreateListPageProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers)

  const { addCustomerList } = useCustomerLists()
  const { toast } = useToast()

  // Handle row selection from the data table
  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    // Extract the selected IDs from the rowSelection object
    const selectedIds = Object.entries(rowSelection)
      .filter(([_, selected]) => selected)
      .map(([id]) => id)

    // Only update state if the selection has actually changed
    if (JSON.stringify(selectedIds.sort()) !== JSON.stringify(selectedCustomers.sort())) {
      setSelectedCustomers(selectedIds)
    }
  }

  const handleUseSelection = () => {
    // Generate a temporary list name
    const tempListName = `Temporary List (${new Date().toLocaleTimeString()})`

    // Call the onListCreated callback with the temporary list
    if (onListCreated) {
      onListCreated(tempListName, selectedCustomers.length)
    }

    // Reset state
    setSelectedCustomers([])

    // Navigate back if onBack is provided
    if (onBack) {
      onBack()
    }
  }

  const handleSaveList = () => {
    // Use provided name or generate a default one
    const finalName = listName.trim() || `Customer List (${new Date().toLocaleTimeString()})`

    // Add the new list to the context
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

    // Call the onListCreated callback
    if (onListCreated) {
      onListCreated(finalName, selectedCustomers.length, listDescription)
    }

    // Reset state
    setSelectedCustomers([])
    setListName("")
    setListDescription("")
    setShowSaveDialog(false)

    // Navigate back if onBack is provided
    if (onBack) {
      onBack()
    }
  }

  // Handle applying filters
  const handleApplyFilters = (filters: any[]) => {
    // In a real application, you would apply these filters to your data
    // For this example, we'll just log them and use a subset of the mock data
    console.log("Applied filters:", filters)

    // Simulate filtering by taking a subset of the data
    setFilteredCustomers(mockCustomers.slice(0, filters.length ? 5 : mockCustomers.length))
  }

  // Handle saving a list from the filter system
  const handleSaveFilteredList = (name: string, description: string, filters: any[]) => {
    // In a real application, you would save these filters with the list
    console.log("Saved list with filters:", { name, description, filters })

    // Add the new list to the context
    addCustomerList({
      name,
      count: filteredCustomers.length,
      type: "Custom",
      description,
    })

    // Show success toast
    toast({
      description: <ListCreatedToast listName={name} customerCount={filteredCustomers.length} />,
      duration: 5000,
    })

    // Call the onListCreated callback
    if (onListCreated) {
      onListCreated(name, filteredCustomers.length, description)
    }

    // Navigate back if onBack is provided
    if (onBack) {
      onBack()
    }
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium text-xs">{row.getValue("name")}</div>,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <div className="text-xs">{row.getValue("email")}</div>,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant={row.getValue("type") === "commercial" ? "default" : "secondary"} className="text-xs">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "active" ? "outline" : "secondary"} className="text-xs">
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "accountGroup",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Account Group" />,
      cell: ({ row }) => <div className="text-xs">{row.getValue("accountGroup")}</div>,
    },
    {
      accessorKey: "billGroup",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bill Group" />,
      cell: ({ row }) => <div className="text-xs">{row.getValue("billGroup")}</div>,
    },
    {
      accessorKey: "pricingZone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pricing Zone" />,
      cell: ({ row }) => <div className="text-xs">{row.getValue("pricingZone")}</div>,
    },
  ]

  // Available fields for the filter system
  const availableFields = [
    {
      name: "Name",
      key: "name",
      type: "text" as const,
    },
    {
      name: "Email",
      key: "email",
      type: "text" as const,
    },
    {
      name: "Type",
      key: "type",
      type: "select" as const,
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
      ],
    },
    {
      name: "Status",
      key: "status",
      type: "select" as const,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      name: "Account Group",
      key: "accountGroup",
      type: "select" as const,
      options: [
        { label: "VIP", value: "VIP" },
        { label: "Standard", value: "Standard" },
        { label: "New", value: "New" },
        { label: "Delinquent", value: "Delinquent" },
        { label: "Seasonal", value: "Seasonal" },
      ],
    },
    {
      name: "Bill Group",
      key: "billGroup",
      type: "select" as const,
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Quarterly", value: "Quarterly" },
        { label: "Annual", value: "Annual" },
        { label: "Pre-paid", value: "Pre-paid" },
        { label: "Custom", value: "Custom" },
      ],
    },
    {
      name: "Pricing Zone",
      key: "pricingZone",
      type: "select" as const,
      options: [
        { label: "Zone A", value: "Zone A" },
        { label: "Zone B", value: "Zone B" },
        { label: "Zone C", value: "Zone C" },
        { label: "Zone D", value: "Zone D" },
      ],
    },
    {
      name: "AR Balance",
      key: "arBalance",
      type: "number" as const,
    },
    {
      name: "City",
      key: "location.city",
      type: "text" as const,
    },
    {
      name: "State",
      key: "location.state",
      type: "text" as const,
    },
    {
      name: "ZIP",
      key: "location.zip",
      type: "text" as const,
    },
  ]

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="px-0 py-2">
        <div className="space-y-4">
          {/* Back button */}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}

          <h2 className="text-xl font-bold">Create Customer List</h2>
          <p className="text-muted-foreground">
            Use filters to create a targeted list of customers for your messaging campaign.
          </p>

          {/* Enhanced Filter System */}
          <EnhancedFilterSystem
            onApplyFilters={handleApplyFilters}
            onSaveList={handleSaveFilteredList}
            availableFields={availableFields}
          />

          {/* Data Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Results</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredCustomers.length} customers match your criteria
            </p>

            <DataTable
              columns={columns}
              data={filteredCustomers}
              searchKey="name"
              onRowSelectionChange={handleRowSelectionChange}
            />
          </div>

          <div className="flex justify-between mt-4">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUseSelection}
                disabled={selectedCustomers.length === 0}
                variant="outline"
              >
                Use Selection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <Button type="button" disabled={selectedCustomers.length === 0} onClick={() => setShowSaveDialog(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as List
                </Button>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Save Customer List</DialogTitle>
                    <DialogDescription>
                      Give your list a name and description to save it for future use.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 py-3">
                    <div className="grid gap-1">
                      <Label htmlFor="list-name">List Name</Label>
                      <Input
                        id="list-name"
                        placeholder="Marketing Campaign List"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="list-description">Description (Optional)</Label>
                      <Textarea
                        id="list-description"
                        placeholder="A list of customers for our marketing campaign."
                        value={listDescription}
                        onChange={(e) => setListDescription(e.target.value)}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveList}>Save List ({selectedCustomers.length} customers)</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
