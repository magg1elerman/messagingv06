import type { Metadata } from "next"
import BulkMessagingDashboard from "@/components/bulk-messaging/dashboard"

export const metadata: Metadata = {
  title: "Bulk Messaging | Hauler Hero",
  description: "Send bulk messages to your customers via email or text",
}

export default function BulkMessagingPage() {
  return <BulkMessagingDashboard />
}
