"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Edit, Trash2, Download, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ListCreatedToast } from "@/components/bulk-messaging/list-created-toast"
import { useCustomerLists } from "@/components/bulk-messaging/customer-lists-context"

export function CustomerLists({ onCreateList }: { onCreateList?: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const { customerLists, addCustomerList, deleteCustomerList } = useCustomerLists()
  const { toast } = useToast()

  const handleListCreated = (listName: string, customerCount: number, description?: string) => {
    // Add the new list to the context
    addCustomerList({
      name: listName,
      count: customerCount,
      type: "Custom",
      description,
    })

    // Show success toast
    toast({
      description: <ListCreatedToast listName={listName} customerCount={customerCount} />,
      duration: 5000,
    })
  }

  const handleDeleteList = (id: number, name: string) => {
    deleteCustomerList(id)
    toast({
      title: "List Deleted",
      description: `"${name}" has been deleted.`,
      duration: 3000,
    })
  }

  const filteredLists = customerLists.filter((list) => list.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Customer Lists</CardTitle>
        <CardDescription>Manage your customer lists for bulk messaging</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button size="sm" onClick={onCreateList}>
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Name</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>{list.count}</TableCell>
                  <TableCell>
                    <Badge variant={list.type === "System" ? "secondary" : "default"}>{list.type}</Badge>
                  </TableCell>
                  <TableCell>{list.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit List
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        {list.type !== "System" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteList(list.id, list.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
