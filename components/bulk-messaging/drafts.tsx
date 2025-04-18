import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, MessageSquare, Edit, Trash2, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock draft messages data
const draftMessages = [
  {
    id: 1,
    subject: "Monthly Service Update",
    type: "email",
    recipients: "All Customers",
    lastEdited: "Today, 2:30 PM",
    status: "Draft",
  },
  {
    id: 2,
    subject: "New Recycling Program",
    type: "email",
    recipients: "Residential Clients",
    lastEdited: "Yesterday, 11:15 AM",
    status: "Draft",
  },
  {
    id: 3,
    subject: "Pickup reminder",
    type: "text",
    recipients: "Commercial Clients",
    lastEdited: "Apr 8, 2025",
    status: "Draft",
  },
  {
    id: 4,
    subject: "Holiday Schedule Changes",
    type: "email",
    recipients: "All Customers",
    lastEdited: "Apr 5, 2025",
    status: "Draft",
  },
]

export function Drafts() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Drafts</CardTitle>
        <CardDescription>Continue working on your saved message drafts</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Last Edited</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draftMessages.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell className="font-medium">{draft.subject}</TableCell>
                  <TableCell>
                    {draft.type === "email" ? (
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Text
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{draft.recipients}</TableCell>
                  <TableCell>{draft.lastEdited}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {draft.status}
                    </Badge>
                  </TableCell>
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
                          Edit Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send Now
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Draft
                        </DropdownMenuItem>
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
