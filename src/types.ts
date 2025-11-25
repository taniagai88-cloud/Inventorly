// Type definitions for Inventorly

export type AppState =
  | "auth"
  | "verify"
  | "loading"
  | "dashboard"
  | "addItem"
  | "bulkUpload"
  | "multiItemUpload"
  | "imageGallery"
  | "library"
  | "inUse"
  | "itemDetail"
  | "assignToJob"
  | "reports"
  | "projectDetail"
  | "allProjects"
  | "settings";

export type AuthMode = "signup" | "signin";

export interface UserData {
  fullName: string;
  phoneNumber: string;
  businessName: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  purchaseCost: number;
  totalQuantity: number;
  inUseQuantity: number;
  availableQuantity: number;
  tags: string[];
  imageUrl?: string;
  usageCount: number;
  dateAdded: Date;
  lastUsed?: Date;
  aiGenerated?: boolean;
}

export interface JobAssignment {
  id: string;
  itemId: string;
  jobLocation: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  notes?: string;
  assignedBy: string;
  status: "active" | "archived";
  stagingDate?: Date;
  stagingStatus?: "staged" | "upcoming";
  clientName?: string;
  clientEmail?: string;
  shortAddress?: string;
  fullAddress?: string;
  itemIds?: string[];
  roomAssignments?: Record<string, string[]>; // Maps room names to item IDs
  roomPricing?: Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }>; // Stores room pricing for invoices with size
}

export interface UsageHistoryEntry {
  id: string;
  itemId: string;
  date: Date;
  action: "assigned" | "returned" | "added" | "edited" | "deleted";
  jobLocation?: string;
  user: string;
  quantity?: number;
}
