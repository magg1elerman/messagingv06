"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Mail, MessageSquare, CreditCard, TruckIcon, DollarSign, Copy } from "lucide-react"
import type { FilterCategory } from "./customer-types"
import { preWrittenMessages } from "./mock-data"

interface MessageSidebarProps {
  messageType: "email" | "text"
  onSelectMessageType: (type: "email" | "text") => void
  onSelectTemplate: (template: string) => void
}

export function MessageSidebar({ messageType, onSelectMessageType, onSelectTemplate }: MessageSidebarProps) {
  const [expandedTemplates, setExpandedTemplates] = useState(true)
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<FilterCategory>("Invoice Reminders")

  return (
    <div className="border-r w-80">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Message Type</h3>
          <div className="flex space-x-2">
            <Button
              variant={messageType === "email" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs flex items-center"
              onClick={() => onSelectMessageType("email")}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Email
            </Button>
            <Button
              variant={messageType === "text" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs flex items-center"
              onClick={() => onSelectMessageType("text")}
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Text
            </Button>
          </div>
        </div>

        <Collapsible
          open={expandedTemplates}
          onOpenChange={setExpandedTemplates}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium bg-muted/50 hover:bg-muted">
            <span>Message Templates</span>
            <span className="text-muted-foreground">{expandedTemplates ? "Hide" : "Show"}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2">
              <Tabs
                defaultValue="Invoice Reminders"
                onValueChange={(value) => setActiveTemplateCategory(value as FilterCategory)}
              >
                <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0 mb-3">
                  <TabsTrigger
                    value="Invoice Reminders"
                    className="flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      <span>Invoices</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Route Changes"
                    className="flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <TruckIcon className="h-3.5 w-3.5 mr-1" />
                      <span>Routes</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Price/Rate Changes"
                    className="flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      <span>Pricing</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="General Office Notes"
                    className="flex-1 h-8 text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      <span>General</span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {preWrittenMessages[activeTemplateCategory].map((template, index) => (
                      <div key={index} className="relative group">
                        <div className="p-3 border rounded-md text-sm bg-muted/20 hover:bg-muted/40 transition-colors">
                          {template}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onSelectTemplate(template)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="sr-only">Use template</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Message Tips</h3>
          <div className="p-2 border rounded-md bg-muted/20 text-xs">
            <p className="font-medium mb-1">Personalization</p>
            <p className="text-muted-foreground">Use [Name] to insert the customer's name.</p>
          </div>
          {messageType === "text" && (
            <div className="p-2 border rounded-md bg-muted/20 text-xs">
              <p className="font-medium mb-1">SMS Guidelines</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                <li>Keep under 160 characters</li>
                <li>Include opt-out instructions</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
