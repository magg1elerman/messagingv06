"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart2,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Truck,
  Users,
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: string
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const getIcon = (icon: string) => {
    switch (icon) {
      case "layout-dashboard":
        return <LayoutDashboard className="mr-2 h-4 w-4" />
      case "users":
        return <Users className="mr-2 h-4 w-4" />
      case "map":
        return <Map className="mr-2 h-4 w-4" />
      case "calendar":
        return <Calendar className="mr-2 h-4 w-4" />
      case "message-square":
        return <MessageSquare className="mr-2 h-4 w-4" />
      case "credit-card":
        return <CreditCard className="mr-2 h-4 w-4" />
      case "bar-chart-2":
        return <BarChart2 className="mr-2 h-4 w-4" />
      case "settings":
        return <Settings className="mr-2 h-4 w-4" />
      default:
        return <Truck className="mr-2 h-4 w-4" />
    }
  }

  return (
    <ScrollArea className="h-full py-2">
      <nav className={cn("grid items-start gap-2 px-2", className)} {...props}>
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href ? "bg-accent" : "")}
            >
              {getIcon(item.icon)}
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </ScrollArea>
  )
}
