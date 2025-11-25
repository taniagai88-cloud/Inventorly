// Settings utility functions

export interface SettingsData {
  // Staging dates
  defaultStagingPeriod: number; // days
  contractDuration: number; // days
  
  // Pricing - Single price for most rooms
  livingRoomPrice: number;
  diningRoomPrice: number;
  officePrice: number;
  bathroomPrice: number;
  kitchenPrice: number;
  otherRoomPrice: number;
  
  // Pricing - Bedroom with sizes
  bedroomPriceSmall: number;
  bedroomPriceMedium: number;
  bedroomPriceLarge: number;
  
  // Warehouse location
  warehouseName: string;
  warehouseAddress: string;
  warehouseCity: string;
  warehouseState: string;
  warehouseZip: string;
  warehousePhone: string;
  
  // Delivery/Pickup
  deliveryFee: number;
  pickupFee: number;
}

// Default settings
const defaultSettings: SettingsData = {
  defaultStagingPeriod: 45,
  contractDuration: 45,
  // Single prices for most rooms
  livingRoomPrice: 600,
  diningRoomPrice: 400,
  officePrice: 300,
  bathroomPrice: 75,
  kitchenPrice: 0,
  otherRoomPrice: 0,
  // Bedroom with sizes
  bedroomPriceSmall: 250,
  bedroomPriceMedium: 350,
  bedroomPriceLarge: 450,
  warehouseName: "",
  warehouseAddress: "",
  warehouseCity: "",
  warehouseState: "",
  warehouseZip: "",
  warehousePhone: "",
  deliveryFee: 400,
  pickupFee: 400,
};

// Load settings from localStorage
export function loadSettings(): SettingsData {
  const saved = localStorage.getItem("inventorly-settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all properties exist
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  }
  return defaultSettings;
}

// Get room pricing mapping by size (only bedrooms have sizes)
export function getRoomPricing(size: "small" | "medium" | "large" = "medium"): Record<string, number> {
  const settings = loadSettings();
  const sizeSuffix = size.charAt(0).toUpperCase() + size.slice(1);
  return {
    "Living Room": settings.livingRoomPrice,
    "Dining Room": settings.diningRoomPrice,
    "Bedroom": settings[`bedroomPrice${sizeSuffix}` as keyof SettingsData] as number,
    "Bedroom (S)": settings.bedroomPriceSmall,
    "Bedroom (M)": settings.bedroomPriceMedium,
    "Bedroom (L)": settings.bedroomPriceLarge,
    // Legacy support for old room names
    "Bedroom (Small)": settings.bedroomPriceSmall,
    "Bedroom (Medium)": settings.bedroomPriceMedium,
    "Bedroom (Large)": settings.bedroomPriceLarge,
    "Office": settings.officePrice,
    "Bathroom": settings.bathroomPrice,
    "Kitchen": settings.kitchenPrice,
    "Other": settings.otherRoomPrice,
  };
}

// Get specific setting
export function getSetting<K extends keyof SettingsData>(key: K): SettingsData[K] {
  const settings = loadSettings();
  return settings[key];
}

