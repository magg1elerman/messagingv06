"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart2, CreditCard, MessageSquare, Route, Settings, Truck, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Customers",
      href: "/customers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      name: "Routes",
      href: "/routes",
      icon: <Route className="mr-2 h-4 w-4" />,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      name: "Reporting",
      href: "/reporting",
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
    },
    {
      name: "Messaging",
      href: "/bulk-messaging",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Truck className="h-6 w-6" />
          <span className="font-bold uppercase">Hauler Hero</span>
        </Link>
        <nav className="ml-6 flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Settings" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="" alt="User" />
            <AvatarFallback>ML</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
