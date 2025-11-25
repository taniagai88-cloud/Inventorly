import type { JobAssignment } from "../types";
import { getSetting } from "./settings";

/**
 * Checks if a project's staging date is in the past or today (items have been staged)
 */
export const isProjectStaged = (project: JobAssignment): boolean => {
  if (!project.stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stagingDate = new Date(project.stagingDate);
  stagingDate.setHours(0, 0, 0, 0);
  
  return stagingDate <= today;
};

/**
 * Checks if staging date is in the future (upcoming)
 */
export const isProjectUpcoming = (project: JobAssignment): boolean => {
  if (!project.stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const staging = new Date(project.stagingDate);
  staging.setHours(0, 0, 0, 0);
  
  return staging > today;
};

/**
 * Gets the staging status based on staging date
 */
export const getStagingStatus = (project: JobAssignment): "staged" | "upcoming" | undefined => {
  if (!project.stagingDate) return undefined;
  
  if (isProjectStaged(project)) return "staged";
  if (isProjectUpcoming(project)) return "upcoming";
  
  return undefined;
};

/**
 * Gets the item IDs for a project
 * Returns all assigned items for active projects (both staged and upcoming)
 */
export const getProjectItemIds = (project: JobAssignment): string[] => {
  return project.itemIds || [];
};

/**
 * Checks if staging date is in the future (alias for isProjectUpcoming)
 */
export const isStagingUpcoming = (stagingDate?: Date): boolean => {
  if (!stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const staging = new Date(stagingDate);
  staging.setHours(0, 0, 0, 0);
  
  return staging > today;
};

/**
 * Finds which project(s) an item is assigned to
 * Returns an array of projects that contain this item ID
 */
export const getProjectsForItem = (itemId: string, projects: JobAssignment[]): JobAssignment[] => {
  return projects.filter(project => {
    const itemIds = project.itemIds || [];
    return itemIds.includes(itemId);
  });
};

/**
 * Calculates how many times an item is assigned to projects
 * Counts all occurrences of the item ID across all active projects
 */
export const getItemAssignmentCount = (itemId: string, projects: JobAssignment[]): number => {
  return projects.reduce((count, project) => {
    const itemIds = project.itemIds || [];
    return count + itemIds.filter(id => id === itemId).length;
  }, 0);
};

/**
 * Calculates accurate quantities for an item based on project assignments
 * Returns { inUseQuantity, availableQuantity } based on actual assignments
 */
export const getAccurateItemQuantities = (
  item: { id: string; totalQuantity: number },
  projects: JobAssignment[]
): { inUseQuantity: number; availableQuantity: number } => {
  const assignedCount = getItemAssignmentCount(item.id, projects);
  const inUseQuantity = Math.min(assignedCount, item.totalQuantity);
  const availableQuantity = Math.max(0, item.totalQuantity - inUseQuantity);
  
  return { inUseQuantity, availableQuantity };
};

/**
 * Calculate the invoice total for a project (matching invoice calculation)
 * Includes: subtotal + delivery fee + pickup fee + tax
 */
export const calculateInvoiceTotal = (project: JobAssignment): number => {
  if (!project.roomPricing || Object.keys(project.roomPricing).length === 0) {
    return 0;
  }
  
  // Calculate subtotal from room pricing - only include rooms with quantity > 0 and price > 0
  const subtotal = Object.values(project.roomPricing).reduce((sum, room) => {
    if ((room.quantity || 0) > 0 && (room.price || 0) > 0) {
      return sum + (room.price || 0) * (room.quantity || 0);
    }
    return sum;
  }, 0);
  
  // Get delivery and pickup fees from settings
  const deliveryFee = getSetting("deliveryFee");
  const pickupFee = getSetting("pickupFee");
  const feesSubtotal = subtotal + deliveryFee + pickupFee;
  
  // Get tax rate based on location (same logic as invoice)
  const getTaxRateByLocation = (location: string): number => {
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('california') || locationLower.includes('ca') || locationLower.includes('los angeles') || locationLower.includes('san francisco') || locationLower.includes('san diego')) {
      return 0.1025;
    }
    if (locationLower.includes('new york') || locationLower.includes('ny') || locationLower.includes('nyc') || locationLower.includes('manhattan')) {
      return 0.08875;
    }
    if (locationLower.includes('texas') || locationLower.includes('tx') || locationLower.includes('houston') || locationLower.includes('dallas') || locationLower.includes('austin')) {
      return 0.0825;
    }
    if (locationLower.includes('florida') || locationLower.includes('fl') || locationLower.includes('miami') || locationLower.includes('orlando')) {
      return 0.075;
    }
    if (locationLower.includes('illinois') || locationLower.includes('il') || locationLower.includes('chicago')) {
      return 0.1025;
    }
    if (locationLower.includes('washington') || locationLower.includes('wa') || locationLower.includes('seattle')) {
      return 0.101;
    }
    return 0.1; // Default 10%
  };
  
  const taxRate = getTaxRateByLocation(project.fullAddress || project.jobLocation || '');
  const tax = feesSubtotal * taxRate;
  const total = feesSubtotal + tax;
  
  return total;
};

/**
 * Gets the display location for an item
 * If item is assigned to projects, shows project information
 * If all items are on projects, shows "Out on Project: [Location]" or "Multiple" if multiple projects
 * If some items are on projects, shows both warehouse and project locations
 * Otherwise shows the item's warehouse location
 */
export const getItemLocation = (
  itemId: string, 
  itemLocation: string, 
  projects: JobAssignment[],
  inUseQuantity?: number,
  totalQuantity?: number
): string => {
  const assignedProjects = getProjectsForItem(itemId, projects);
  
  if (assignedProjects.length > 0) {
    // If multiple projects, show "Multiple"
    const locationDisplay = assignedProjects.length > 1 
      ? "Multiple" 
      : assignedProjects[0].clientName || assignedProjects[0].shortAddress || assignedProjects[0].jobLocation || "Unknown Project";
    
    // If all items are in use (on projects), show only project location
    if (inUseQuantity !== undefined && totalQuantity !== undefined && inUseQuantity === totalQuantity) {
      return assignedProjects.length > 1 
        ? "Multiple" 
        : `Out on Project: ${locationDisplay}`;
    }
    
    // If some items are on projects, show both locations
    if (inUseQuantity !== undefined && totalQuantity !== undefined && inUseQuantity > 0) {
      return assignedProjects.length > 1
        ? `${itemLocation} (${inUseQuantity} on Multiple Projects)`
        : `${itemLocation} (${inUseQuantity} on Project: ${locationDisplay})`;
    }
    
    // Fallback: just show project if assigned
    return assignedProjects.length > 1 
      ? "Multiple" 
      : `Out on Project: ${locationDisplay}`;
  }
  
  return itemLocation;
};
