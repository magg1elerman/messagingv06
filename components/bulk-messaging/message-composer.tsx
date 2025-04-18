"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus, Save, X, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "./customer-types"

interface MessageComposerProps {
  onCreateList?: () => void
  selectedRecipients?: Customer[]
  messageType?: "email" | "text"
  messageText?: string
  onMessageTextChange?: (text: string) => void
}

export function MessageComposer({
  onCreateList,
  selectedRecipients = [],
  messageType = "email",
  messageText = "",
  onMessageTextChange,
}: MessageComposerProps) {
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subject, setSubject] = useState("")
  const [senderName, setSenderName] = useState("Hauler Hero")
  const { toast } = useToast()

  // Add this after the state declarations
  useEffect(() => {
    // This is just to ensure we're properly handling the selectedRecipients prop
    // We don't need to do anything here, just ensuring the dependency is properly tracked
  }, [selectedRecipients.length]) // Only depend on the length, not the entire array

  const handleSend = () => {
    setSending(true)
    // Simulate API call
    setTimeout(() => {
      setSending(false)
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${selectedRecipients.length} recipients.`,
        duration: 3000,
      })
    }, 2000)
  }

  const handleSaveDraft = () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Draft Saved",
        description: "Your message has been saved to drafts.",
        duration: 3000,
      })
    }, 1000)
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Compose Message</CardTitle>
        <CardDescription>Create and send a message to your customers</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div>
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex flex-wrap gap-2">
              {selectedRecipients.length > 0 ? (
                <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 text-sm">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {selectedRecipients.length} recipients selected
                </Badge>
              ) : (
                <div className="text-muted-foreground text-sm">No recipients selected</div>
              )}

              <Button variant="outline" size="sm" onClick={onCreateList}>
                {selectedRecipients.length > 0 ? (
                  <>
                    <X className="mr-1 h-3.5 w-3.5" />
                    Change recipients
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Select recipients
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {messageType === "email" && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Enter subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message Content</Label>
          <Textarea
            id="message"
            placeholder={
              messageType === "email"
                ? "Compose your email message..."
                : "Compose your text message (160 characters max for SMS)"
            }
            rows={messageType === "email" ? 8 : 4}
            value={messageText}
            onChange={(e) => onMessageTextChange && onMessageTextChange(e.target.value)}
          />
          {messageType === "text" && (
            <p className="text-xs text-muted-foreground">
              Characters: {messageText.length}/160
              {messageText.length > 160 && <span className="text-destructive"> (exceeds limit)</span>}
            </p>
          )}
        </div>

        {messageType === "email" && (
          <div className="space-y-2">
            <Label htmlFor="sender-name">Sender Name</Label>
            <Input
              id="sender-name"
              placeholder="Hauler Hero"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-0 flex justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={saving || selectedRecipients.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          onClick={handleSend}
          disabled={
            sending ||
            selectedRecipients.length === 0 ||
            !messageText ||
            (messageType === "email" && !subject) ||
            (messageType === "text" && messageText.length > 160)
          }
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </CardFooter>
    </Card>
  )
}
