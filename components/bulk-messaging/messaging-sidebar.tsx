"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { BarChart2, Clock, FileText, PenSquare, Settings, Users, Zap } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  onSelect?: (item: string) => void
  selectedItem: string
  disabled?: boolean
  collapsed?: boolean
}

export function MessagingSidebar({
  className,
  onSelect,
  selectedItem,
  disabled = false,
  collapsed = false,
  ...props
}: SidebarNavProps) {
  const items = [
    {
      id: "compose",
      title: "Compose Message",
      icon: <PenSquare className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "lists",
      title: "Customer Lists",
      icon: <Users className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "drafts",
      title: "Drafts",
      icon: <FileText className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "history",
      title: "Message History",
      icon: <Clock className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: <BarChart2 className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "automations",
      title: "Automations",
      icon: <Zap className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className={collapsed ? "h-4 w-4" : "mr-3 h-4 w-4"} />,
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1", className, disabled && "opacity-50 pointer-events-none")} {...props}>
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex items-center py-2 px-3 text-sm font-medium rounded-md w-full",
            collapsed ? "justify-center" : "justify-start",
            selectedItem === item.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => onSelect && onSelect(item.id)}
          disabled={disabled}
          title={collapsed ? item.title : undefined}
        >
          <div className={collapsed ? "mx-auto" : ""}>{item.icon}</div>
          {!collapsed && <span className="ml-2">{item.title}</span>}
        </button>
      ))}
    </nav>
  )
}
