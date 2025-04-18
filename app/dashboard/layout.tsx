import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Hauler Hero",
  description: "Manage your waste hauling business with Hauler Hero",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-auto px-8 pb-8 md:px-12 md:pb-12 lg:px-16 lg:pb-16 pt-0">{children}</main>
    </div>
  )
}
