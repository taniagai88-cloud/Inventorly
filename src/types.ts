// Type definitions for Inventorly

export type AppState =
  | "auth"
  | "verify"
  | "loading"
  | "dashboard"
  | "addItem"
  | "bulkUpload"
  | "library"
  | "inUse"
  | "itemDetail"
  | "assignToJob"
  | "reports"
  | "projectDetail";

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
  jobName: string;
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
  shortAddress?: string;
  fullAddress?: string;
  itemIds?: string[];
}

export interface UsageHistoryEntry {
  id: string;
  itemId: string;
  date: Date;
  action: "assigned" | "returned" | "added" | "edited" | "deleted";
  jobName?: string;
  user: string;
  quantity?: number;
}
