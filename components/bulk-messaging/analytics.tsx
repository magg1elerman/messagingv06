import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Analytics() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Track and analyze your messaging performance</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Total Customers</p>
            <p className="text-2xl font-bold">1,248</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Messages Sent (30d)</p>
            <p className="text-2xl font-bold">3,427</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Open Rate</p>
            <p className="text-2xl font-bold">68%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Customer Lists</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Detailed analytics coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}
