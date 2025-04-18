// Customer data types
export type CustomerTag = string
export type ServiceRecurrence = "Weekly" | "Bi-Weekly" | "Monthly" | "Quarterly" | "Annually" | "Daily" | "On-Demand"
export type BusinessLine = "Residential" | "Commercial" | "Industrial" | "Municipal" | "Institutional"
export type ServiceMethod = "Curbside" | "Driveway" | "Alley" | "Container" | "Dropoff" | "Pickup"
export type MaterialType =
  | "Trash"
  | "Recycling"
  | "Yard Waste"
  | "Bulk"
  | "Hazardous"
  | "Plastic"
  | "Paper"
  | "Glass"
  | "Metal"
  | "Compost"
  | "E-Waste"
export type AccountGroup = "VIP" | "Standard" | "New" | "Delinquent" | "Seasonal" | string
export type BillGroup = "Monthly" | "Quarterly" | "Annual" | "Pre-paid" | "Custom" | string
export type PricingZone = "Zone A" | "Zone B" | "Zone C" | "Zone D" | string

export interface CustomerService {
  id: string
  name: string
  recurrence: ServiceRecurrence
  businessLine: BusinessLine
  method: ServiceMethod
  material: MaterialType
  price: number
  configuredPrice?: number
  fees: {
    name: string
    amount: number
  }[]
}

export interface CustomerRoute {
  id: string
  name: string
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  services: string[] // IDs of services
}

export interface CustomerInvoice {
  id: string
  amount: number
  dueDate: string
  status: "Paid" | "Unpaid" | "Overdue"
  daysLate: number
}

export interface CustomerLocation {
  address: string
  city: string
  state: string
  zip: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  type: "residential" | "commercial"
  status: "active" | "inactive"
  lastOrder: string

  // New fields
  tags: CustomerTag[]
  accountGroup: AccountGroup
  arBalance: number
  billGroup: BillGroup
  pricingZone: PricingZone
  location: CustomerLocation
  services: CustomerService[]
  routes: CustomerRoute[]
  invoices: CustomerInvoice[]
  notes: string
}

// Filter categories
export type FilterCategory = "Invoice Reminders" | "Route Changes" | "Price/Rate Changes" | "General Office Notes"

// Filter types
export type FilterType = "text" | "number" | "select" | "multiSelect" | "boolean" | "date" | "range"

// Filter definition
export interface FilterDefinition {
  id: string
  label: string
  category: FilterCategory
  type: FilterType
  field: string
  options?: string[]
  placeholder?: string
  compareOperators?: ("equals" | "contains" | "greaterThan" | "lessThan" | "between")[]
}

// Active filter
export interface ActiveFilter {
  id: string
  value: any
  operator?: string
  displayValue?: string
}
