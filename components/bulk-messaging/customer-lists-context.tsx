"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the CustomerList type
export interface CustomerList {
  id: number
  name: string
  count: number
  type: "System" | "Custom"
  lastUpdated: string
  description?: string
}

// Initial customer lists data
const initialCustomerLists: CustomerList[] = [
  {
    id: 1,
    name: "All Customers",
    count: 1248,
    type: "System",
    lastUpdated: "Auto-updated",
  },
  {
    id: 2,
    name: "Active Customers",
    count: 876,
    type: "System",
    lastUpdated: "Auto-updated",
  },
  {
    id: 3,
    name: "Commercial Clients",
    count: 98,
    type: "Custom",
    lastUpdated: "2 days ago",
  },
  {
    id: 4,
    name: "Residential Clients",
    count: 782,
    type: "Custom",
    lastUpdated: "2 days ago",
  },
  {
    id: 5,
    name: "New Customers",
    count: 124,
    type: "System",
    lastUpdated: "Auto-updated",
  },
  {
    id: 6,
    name: "Premium Subscribers",
    count: 67,
    type: "Custom",
    lastUpdated: "1 week ago",
  },
  {
    id: 7,
    name: "Quarterly Pickup",
    count: 215,
    type: "Custom",
    lastUpdated: "3 days ago",
  },
]

interface CustomerListsContextType {
  customerLists: CustomerList[]
  addCustomerList: (list: Omit<CustomerList, "id" | "lastUpdated">) => void
  deleteCustomerList: (id: number) => void
}

const CustomerListsContext = createContext<CustomerListsContextType | undefined>(undefined)

export function CustomerListsProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage to persist the lists if available
  const [customerLists, setCustomerLists] = useState<CustomerList[]>(() => {
    // Check if we're in the browser and if there are saved lists
    if (typeof window !== "undefined") {
      const savedLists = localStorage.getItem("customerLists")
      return savedLists ? JSON.parse(savedLists) : initialCustomerLists
    }
    return initialCustomerLists
  })

  // Save to localStorage whenever lists change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customerLists", JSON.stringify(customerLists))
    }
  }, [customerLists])

  const addCustomerList = (list: Omit<CustomerList, "id" | "lastUpdated">) => {
    const newList: CustomerList = {
      ...list,
      id: Math.max(0, ...customerLists.map((l) => l.id)) + 1, // Generate a new ID
      lastUpdated: "Just now",
    }
    setCustomerLists((prevLists) => [...prevLists, newList])
  }

  const deleteCustomerList = (id: number) => {
    setCustomerLists((prevLists) => prevLists.filter((list) => list.id !== id))
  }

  return (
    <CustomerListsContext.Provider value={{ customerLists, addCustomerList, deleteCustomerList }}>
      {children}
    </CustomerListsContext.Provider>
  )
}

export function useCustomerLists() {
  const context = useContext(CustomerListsContext)
  if (context === undefined) {
    throw new Error("useCustomerLists must be used within a CustomerListsProvider")
  }
  return context
}
