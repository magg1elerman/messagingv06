import type { Customer, FilterDefinition, FilterCategory } from "./customer-types"

// This will be populated with data from the CSV
export let mockCustomers: Customer[] = []

// Function to initialize the mock data from CSV
export async function initializeMockData() {
  try {
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dummy_customer_data-gs9dcat45SY8NAYURqRh41jmZg7SNu.csv"
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((header) => header.trim().replace(/^"|"$/g, ""))

    const records = lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""))
        const record: Record<string, string> = {}

        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })

        return record
      })

    // Map CSV records to Customer objects
    mockCustomers = records.map((record, index) => {
      const tags = record["Tags"] ? record["Tags"].split(";").filter((tag) => tag.trim() !== "") : []

      // Create a customer object from the CSV record
      return {
        id: `csv-${index + 1}`,
        name: record["Name"] || `Customer ${index + 1}`,
        email: record["Email"] || `customer${index + 1}@example.com`,
        phone: record["Phone"] || `(555) 000-${index.toString().padStart(4, "0")}`,
        type: (record["Type"]?.toLowerCase() === "commercial" ? "commercial" : "residential") as
          | "commercial"
          | "residential",
        status: "active" as "active" | "inactive",
        lastOrder: "2 days ago",
        tags: tags.length > 0 ? tags : ["New Customer"],
        accountGroup: record["Account Group"] || "Standard",
        arBalance: Number.parseFloat(record["AR Balance"]) || 0,
        billGroup: record["Bill Group"] || "Monthly",
        pricingZone: record["Pricing Zone"] || "Zone A",
        location: {
          address: "123 Main St",
          city: record["Account City"] || "Springfield",
          state: record["Account State"] || record["Location State"] || "IL",
          zip: record["Location Zip"] || "62701",
        },
        services: [
          {
            id: `s-${index}-1`,
            name: record["Service Name"] || record["Priced Services"] || "Weekly Trash Pickup",
            recurrence: (record["Service Recurrence"] || "Weekly") as any,
            businessLine: (record["Business Line"] || "Residential") as any,
            method: (record["Method"] || "Curbside") as any,
            material: (record["Material"] || "Trash") as any,
            price: Number.parseFloat(record["Configured Service Price"]) || 25.99,
            configuredPrice: Number.parseFloat(record["Configured Service Price"]) || undefined,
            fees: record["Fees"] ? [{ name: "Environmental Fee", amount: Number.parseFloat(record["Fees"]) }] : [],
          },
        ],
        routes: [
          {
            id: `r-${index}-1`,
            name: record["Route Name"] || "Springfield North",
            dayOfWeek: (record["Route Day of Week"] || "Monday") as any,
            services: [`s-${index}-1`],
          },
        ],
        invoices: [
          {
            id: `i-${index}-1`,
            amount: Number.parseFloat(record["AR Balance"]) || 41.98,
            dueDate: "2025-04-15",
            status: Number.parseFloat(record["Number of Days Late"]) > 0 ? "Overdue" : "Unpaid",
            daysLate: Number.parseInt(record["Number of Days Late"]) || 0,
          },
        ],
        notes: `Customer notes for ${record["Name"] || `Customer ${index + 1}`}`,
      }
    })

    console.log(`Loaded ${mockCustomers.length} customers from CSV`)
  } catch (error) {
    console.error("Error loading mock data:", error)
    // Fallback to empty array if loading fails
    mockCustomers = []
  }
}

// Define all available filters
export const filterDefinitions: FilterDefinition[] = [
  // Invoice Reminders filters
  {
    id: "invoice-account-groups",
    label: "Account Groups",
    category: "Invoice Reminders",
    type: "multiSelect",
    field: "accountGroup",
    options: ["VIP", "Standard", "New", "Delinquent", "Seasonal"],
  },
  {
    id: "invoice-days-late",
    label: "# of Days Late",
    category: "Invoice Reminders",
    type: "number",
    field: "invoices.daysLate",
    compareOperators: ["greaterThan", "lessThan", "between"],
  },
  {
    id: "invoice-ar-balance",
    label: "AR Balance",
    category: "Invoice Reminders",
    type: "number",
    field: "arBalance",
    compareOperators: ["greaterThan", "lessThan", "between"],
  },
  {
    id: "invoice-bill-group",
    label: "Bill Group",
    category: "Invoice Reminders",
    type: "multiSelect",
    field: "billGroup",
    options: ["Monthly", "Quarterly", "Annual", "Pre-paid", "Custom"],
  },
  {
    id: "invoice-tags",
    label: "Tags",
    category: "Invoice Reminders",
    type: "multiSelect",
    field: "tags",
    options: [
      "New Customer",
      "Recycling",
      "Paperless",
      "Large Account",
      "Multi-Location",
      "Former Customer",
      "Hazardous Waste",
      "Yard Waste",
      "E-Waste",
      "Municipal",
      "Seasonal",
    ],
  },

  // Route Changes filters
  {
    id: "route-name",
    label: "Route Name",
    category: "Route Changes",
    type: "text",
    field: "routes.name",
    compareOperators: ["contains", "equals"],
  },
  {
    id: "route-day-of-week",
    label: "Route Day of Week",
    category: "Route Changes",
    type: "multiSelect",
    field: "routes.dayOfWeek",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "route-service-name",
    label: "Service Name",
    category: "Route Changes",
    type: "text",
    field: "services.name",
    compareOperators: ["contains", "equals"],
  },
  {
    id: "route-service-recurrence",
    label: "Service Recurrence",
    category: "Route Changes",
    type: "multiSelect",
    field: "services.recurrence",
    options: ["Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Annually"],
  },
  {
    id: "route-business-line",
    label: "Business Line",
    category: "Route Changes",
    type: "multiSelect",
    field: "services.businessLine",
    options: ["Residential", "Commercial", "Industrial", "Municipal"],
  },
  {
    id: "route-method",
    label: "Method",
    category: "Route Changes",
    type: "multiSelect",
    field: "services.method",
    options: ["Curbside", "Driveway", "Alley", "Container"],
  },
  {
    id: "route-material",
    label: "Material",
    category: "Route Changes",
    type: "multiSelect",
    field: "services.material",
    options: ["Trash", "Recycling", "Yard Waste", "Bulk", "Hazardous"],
  },
  {
    id: "route-bill-group",
    label: "Bill Group",
    category: "Route Changes",
    type: "multiSelect",
    field: "billGroup",
    options: ["Monthly", "Quarterly", "Annual", "Pre-paid", "Custom"],
  },
  {
    id: "route-tags",
    label: "Tags",
    category: "Route Changes",
    type: "multiSelect",
    field: "tags",
    options: [
      "New Customer",
      "Recycling",
      "Paperless",
      "Large Account",
      "Multi-Location",
      "Former Customer",
      "Hazardous Waste",
      "Yard Waste",
      "E-Waste",
      "Municipal",
      "Seasonal",
    ],
  },
  {
    id: "route-location-state",
    label: "Location State",
    category: "Route Changes",
    type: "text",
    field: "location.state",
    compareOperators: ["equals"],
  },
  {
    id: "route-location-zip",
    label: "Location ZIP",
    category: "Route Changes",
    type: "text",
    field: "location.zip",
    compareOperators: ["equals", "contains"],
  },

  // Price/Rate Changes filters
  {
    id: "price-bill-group",
    label: "Bill Group",
    category: "Price/Rate Changes",
    type: "multiSelect",
    field: "billGroup",
    options: ["Monthly", "Quarterly", "Annual", "Pre-paid", "Custom"],
  },
  {
    id: "price-priced-services",
    label: "Priced Services",
    category: "Price/Rate Changes",
    type: "text",
    field: "services.name",
    compareOperators: ["contains", "equals"],
  },
  {
    id: "price-configured-service-price",
    label: "Configured Service Price",
    category: "Price/Rate Changes",
    type: "boolean",
    field: "services.configuredPrice",
  },
  {
    id: "price-fees",
    label: "Fees",
    category: "Price/Rate Changes",
    type: "text",
    field: "services.fees.name",
    compareOperators: ["contains", "equals"],
  },
  {
    id: "price-pricing-zone",
    label: "Pricing Zone",
    category: "Price/Rate Changes",
    type: "multiSelect",
    field: "pricingZone",
    options: ["Zone A", "Zone B", "Zone C", "Zone D"],
  },
  {
    id: "price-tags",
    label: "Tags",
    category: "Price/Rate Changes",
    type: "multiSelect",
    field: "tags",
    options: [
      "New Customer",
      "Recycling",
      "Paperless",
      "Large Account",
      "Multi-Location",
      "Former Customer",
      "Hazardous Waste",
      "Yard Waste",
      "E-Waste",
      "Municipal",
      "Seasonal",
    ],
  },
  {
    id: "price-location-state",
    label: "Location State",
    category: "Price/Rate Changes",
    type: "text",
    field: "location.state",
    compareOperators: ["equals"],
  },
  {
    id: "price-location-zip",
    label: "Location ZIP",
    category: "Price/Rate Changes",
    type: "text",
    field: "location.zip",
    compareOperators: ["equals", "contains"],
  },

  // General Office Notes filters
  {
    id: "notes-account-groups",
    label: "Account Groups",
    category: "General Office Notes",
    type: "multiSelect",
    field: "accountGroup",
    options: ["VIP", "Standard", "New", "Delinquent", "Seasonal"],
  },
  {
    id: "notes-bill-group",
    label: "Bill Group",
    category: "General Office Notes",
    type: "multiSelect",
    field: "billGroup",
    options: ["Monthly", "Quarterly", "Annual", "Pre-paid", "Custom"],
  },
  {
    id: "notes-tags",
    label: "Tags",
    category: "General Office Notes",
    type: "multiSelect",
    field: "tags",
    options: [
      "New Customer",
      "Recycling",
      "Paperless",
      "Large Account",
      "Multi-Location",
      "Former Customer",
      "Hazardous Waste",
      "Yard Waste",
      "E-Waste",
      "Municipal",
      "Seasonal",
    ],
  },
  {
    id: "notes-account-city",
    label: "Account City",
    category: "General Office Notes",
    type: "text",
    field: "location.city",
    compareOperators: ["equals", "contains"],
  },
  {
    id: "notes-account-state",
    label: "Account State",
    category: "General Office Notes",
    type: "text",
    field: "location.state",
    compareOperators: ["equals"],
  },
  {
    id: "notes-pricing-zone",
    label: "Pricing Zone",
    category: "General Office Notes",
    type: "multiSelect",
    field: "pricingZone",
    options: ["Zone A", "Zone B", "Zone C", "Zone D"],
  },
]

// Pre-written messages for each category
export const preWrittenMessages: Record<FilterCategory, string[]> = {
  "Invoice Reminders": [
    "Your invoice #[Invoice Number] is now [Days] days past due. Please remit payment of $[Amount] by [Date] to avoid service interruption.",
    "This is a friendly reminder that your account has an outstanding balance of $[Amount]. Please contact us to arrange payment.",
    "Your account is currently past due. Please log in to your customer portal to make a payment or contact our billing department.",
  ],
  "Route Changes": [
    "Starting [Date], your service day will change from [Old Day] to [New Day]. Your first pickup on the new schedule will be [Date].",
    "Due to route optimization, we're adjusting your pickup schedule. Beginning [Date], your new service day will be [Day].",
    "We're updating our routes to serve you better. Starting [Date], please place your containers out on [Day] instead of [Old Day].",
  ],
  "Price/Rate Changes": [
    "Effective [Date], there will be a rate adjustment on your [Service Name]. Your new monthly rate will be $[New Amount].",
    "Due to increased operational costs, we will be implementing a [Percentage]% price adjustment effective [Date].",
    "Your [Service Name] rate will change from $[Old Amount] to $[New Amount] beginning with your next billing cycle on [Date].",
  ],
  "General Office Notes": [
    "We value your business and want to ensure you're getting the best service possible. Please contact us with any questions or concerns.",
    "Thank you for being a valued customer. We appreciate your business and look forward to continuing to serve you.",
    "We're committed to providing excellent service. If you have any feedback or suggestions, please let us know.",
  ],
}

// Initialize the mock data when this module is imported
initializeMockData()
