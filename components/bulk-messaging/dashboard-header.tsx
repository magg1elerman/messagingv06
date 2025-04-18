import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardHeader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging</CardTitle>
        <CardDescription>Send messages to multiple customers at once via email or text</CardDescription>
      </CardHeader>
    </Card>
  )
}
