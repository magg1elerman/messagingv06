"use client"

import { useState, useEffect } from "react"
import { CustomerLists } from "@/components/bulk-messaging/customer-lists"
import { MessageComposer } from "@/components/bulk-messaging/message-composer"
import { MessageHistory } from "@/components/bulk-messaging/message-history"
import { MessagingSidebar } from "@/components/bulk-messaging/messaging-sidebar"
import { MessageSidebar } from "@/components/bulk-messaging/message-sidebar"
import { Analytics } from "@/components/bulk-messaging/analytics"
import { Drafts } from "@/components/bulk-messaging/drafts"
import { CustomerListsProvider } from "@/components/bulk-messaging/customer-lists-context"
import { RecipientSelection } from "@/components/bulk-messaging/recipient-selection"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Customer } from "./customer-types"
import { initializeMockData } from "./mock-data"

export default function BulkMessagingDashboard() {
  const [activeSection, setActiveSection] = useState("compose")
  const [selectedRecipients, setSelectedRecipients] = useState<Customer[]>([])
  const [isSelectingRecipients, setIsSelectingRecipients] = useState(false)
  const [messageType, setMessageType] = useState<"email" | "text">("email")
  const { toast } = useToast()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messageText, setMessageText] = useState("")

  // Add useEffect to initialize data
  useEffect(() => {
    // Initialize mock data when the dashboard loads
    initializeMockData()
  }, [])

  // Handle recipient selection
  const handleSelectRecipients = (recipients: Customer[]) => {
    // Only update if the recipients have actually changed
    if (
      JSON.stringify(selectedRecipients.map((r) => r.id).sort()) !== JSON.stringify(recipients.map((r) => r.id).sort())
    ) {
      setSelectedRecipients(recipients)
    }
    setIsSelectingRecipients(false)

    toast({
      title: "Recipients Selected",
      description: `${recipients.length} recipients have been selected for your message.`,
      duration: 3000,
    })
  }

  // Handle saving a list
  const handleSaveList = (name: string, description: string, recipients: Customer[]) => {
    // Only update if the recipients have actually changed
    if (
      JSON.stringify(selectedRecipients.map((r) => r.id).sort()) !== JSON.stringify(recipients.map((r) => r.id).sort())
    ) {
      setSelectedRecipients(recipients)
    }
    setIsSelectingRecipients(false)

    toast({
      title: "List Saved",
      description: `"${name}" with ${recipients.length} customers has been saved and selected.`,
      duration: 3000,
    })
  }

  // Start recipient selection
  const handleStartRecipientSelection = () => {
    setIsSelectingRecipients(true)
  }

  // Handle template selection
  const handleSelectTemplate = (template: string) => {
    // In a real app, you would update the message text in the composer
    setMessageText(template)
    toast({
      title: "Template Applied",
      description: "The template has been applied to your message.",
      duration: 2000,
    })
  }

  const renderContent = () => {
    // If we're in recipient selection mode, show that regardless of active section
    if (isSelectingRecipients) {
      return (
        <RecipientSelection
          onSelectRecipients={handleSelectRecipients}
          onSaveList={handleSaveList}
          onCancel={() => setIsSelectingRecipients(false)}
        />
      )
    }

    // Otherwise show the regular content based on active section
    switch (activeSection) {
      case "compose":
        return (
          <MessageComposer
            onCreateList={handleStartRecipientSelection}
            selectedRecipients={selectedRecipients}
            messageType={messageType}
            messageText={messageText}
            onMessageTextChange={setMessageText}
          />
        )
      case "drafts":
        return <Drafts />
      case "lists":
        return <CustomerLists onCreateList={handleStartRecipientSelection} />
      case "history":
        return <MessageHistory />
      case "analytics":
        return <Analytics />
      case "automations":
        return (
          <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Automations feature coming soon</p>
          </div>
        )
      case "settings":
        return (
          <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Settings feature coming soon</p>
          </div>
        )
      default:
        return (
          <MessageComposer
            onCreateList={handleStartRecipientSelection}
            selectedRecipients={selectedRecipients}
            messageType={messageType}
            messageText={messageText}
            onMessageTextChange={setMessageText}
          />
        )
    }
  }

  return (
    <CustomerListsProvider>
      <div className="w-full">
        <div className="flex w-full">
          {/* Main sidebar */}
          <div
            className={`${sidebarCollapsed ? "w-16" : "w-64"} shrink-0 border-r transition-all duration-300 ease-in-out relative`}
          >
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-4 bg-background border rounded-full p-1 shadow-sm z-10 hover:bg-accent"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div className="p-4">
              <MessagingSidebar
                selectedItem={activeSection}
                onSelect={setActiveSection}
                disabled={isSelectingRecipients}
                collapsed={sidebarCollapsed}
              />
            </div>
          </div>

          {/* Message sidebar - only show for compose section */}
          {activeSection === "compose" && !isSelectingRecipients && (
            <MessageSidebar
              messageType={messageType}
              onSelectMessageType={setMessageType}
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {/* Main content area */}
          <div className="flex-1 p-6 max-w-full overflow-x-auto">{renderContent()}</div>
        </div>
      </div>
    </CustomerListsProvider>
  )
}
