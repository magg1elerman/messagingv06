import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, MessageSquare, Eye, BarChart2, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const messageHistory = [
  {
    id: 1,
    subject: "Service Schedule Update",
    type: "email",
    recipients: 876,
    sentDate: "Apr 10, 2025",
    openRate: "68%",
    status: "Delivered",
  },
  {
    id: 2,
    subject: "Holiday Schedule",
    type: "email",
    recipients: 1248,
    sentDate: "Apr 5, 2025",
    openRate: "72%",
    status: "Delivered",
  },
  {
    id: 3,
    subject: "Service reminder",
    type: "text",
    recipients: 215,
    sentDate: "Apr 2, 2025",
    openRate: "94%",
    status: "Delivered",
  },
  {
    id: 4,
    subject: "New Service Offering",
    type: "email",
    recipients: 782,
    sentDate: "Mar 28, 2025",
    openRate: "65%",
    status: "Delivered",
  },
  {
    id: 5,
    subject: "Pickup confirmation",
    type: "text",
    recipients: 124,
    sentDate: "Mar 25, 2025",
    openRate: "91%",
    status: "Delivered",
  },
]

export function MessageHistory() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Message History</CardTitle>
        <CardDescription>View and analyze your sent messages</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messageHistory.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.subject}</TableCell>
                  <TableCell>
                    {message.type === "email" ? (
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
                  <TableCell>{message.recipients}</TableCell>
                  <TableCell>{message.sentDate}</TableCell>
                  <TableCell>{message.openRate}</TableCell>
                  <TableCell>
                    <Badge variant="success" className="bg-green-100 text-green-800">
                      {message.status}
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart2 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
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
