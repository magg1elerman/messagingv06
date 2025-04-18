import { Check } from "lucide-react"

interface ListCreatedToastProps {
  listName: string
  customerCount: number
}

export function ListCreatedToast({ listName, customerCount }: ListCreatedToastProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-green-500/20 p-2">
        <Check className="h-4 w-4 text-green-600" />
      </div>
      <div className="grid gap-1">
        <h3 className="font-medium">List Created</h3>
        <p className="text-sm text-muted-foreground">
          "{listName}" with {customerCount} customers has been created successfully.
        </p>
      </div>
    </div>
  )
}
