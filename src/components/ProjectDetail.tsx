import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Clock, Package, TrendingUp, DollarSign, AlertCircle, CheckCircle, FileText, Mail, Plus, Minus, Edit, Search, X } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "./ui/utils";
import type { AppState, JobAssignment, InventoryItem } from "../types";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming, getAccurateItemQuantities } from "../utils/projectUtils";
import { getRoomPricing, getSetting } from "../utils/settings";

interface ProjectDetailProps {
  project: JobAssignment;
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  onUpdateJob?: (job: JobAssignment) => void;
  jobAssignments?: JobAssignment[];
}

// Default rooms for staging projects - defined outside component to avoid re-creation
// Bedrooms are split into three sizes
const defaultRooms = ["Living Room", "Dining Room", "Bathroom", "Bedroom (S)", "Bedroom (M)", "Bedroom (L)", "Kitchen", "Office", "Other"];

// Base pricing for default rooms - defined outside component to avoid re-creation
const baseRoomPricing: Record<string, number> = {
  "Living Room": 600,
  "Dining Room": 400,
  "Bedroom": 350,
  "Office": 300,
  "Bathroom": 75,
  "Kitchen": 0,
  "Other": 0,
};

// Currency formatter function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Note: calculateTotalContractAmount is now replaced by calculateProjectTotal() 
// which matches the invoice calculation (includes fees and tax)

export function ProjectDetail({ project, items, onNavigate, onUpdateJob, jobAssignments = [] }: ProjectDetailProps) {
  // Real-time date state that updates every minute
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<JobAssignment>(project);
  const [editStagingDateOption, setEditStagingDateOption] = useState<"date" | "tbd">(project.stagingDate ? "date" : "tbd");
  const [isSaving, setIsSaving] = useState(false);
  
  // Multi-select items dialog state
  const [addItemsDialogOpen, setAddItemsDialogOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Update current date every minute for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update editedProject when project prop changes
  useEffect(() => {
    setEditedProject(project);
    setEditStagingDateOption(project.stagingDate ? "date" : "tbd");
  }, [project]);
  
  // Get items assigned to this project (show all assigned items regardless of staging status)
  const projectItemIds = project.itemIds || [];
  const projectItems = items.filter(item => projectItemIds.includes(item.id));
  const isStaged = isProjectStaged(project);
  const isUpcoming = isStagingUpcoming(project.stagingDate);
  
  // Get available items (not already assigned to this project)
  const availableItems = items.filter(item => {
    // Get accurate quantities considering all active projects
    const activeProjects = jobAssignments?.filter(job => job.status === "active") || [];
    const accurateQuantities = getAccurateItemQuantities(item, activeProjects);
    const availableQty = accurateQuantities.availableQuantity;
    
    // Filter out items already assigned to this project and items with no availability
    return !projectItemIds.includes(item.id) && availableQty > 0;
  });
  
  // Filter available items by search and category
  const filteredAvailableItems = availableItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Get categories for filter
  const categories = Array.from(new Set(availableItems.map(item => item.category)));
  
  // Handle item selection toggle
  const handleItemToggle = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  // Handle assign selected items
  const handleAssignSelectedItems = () => {
    if (selectedItemIds.size === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    if (!onUpdateJob) {
      toast.error("Cannot update project");
      return;
    }
    
    // Add selected items to project's itemIds
    const existingItemIds = project.itemIds || [];
    const newItemIds = Array.from(selectedItemIds);
    const updatedItemIds = [...existingItemIds, ...newItemIds];
    
    const updatedProject: JobAssignment = {
      ...project,
      itemIds: updatedItemIds,
    };
    
    onUpdateJob(updatedProject);
    
    toast.success(`${selectedItemIds.size} item${selectedItemIds.size > 1 ? 's' : ''} assigned to project`);
    setSelectedItemIds(new Set());
    setAddItemsDialogOpen(false);
    setSearchQuery("");
    setCategoryFilter("all");
  };
  
  // Reset selection when dialog closes
  useEffect(() => {
    if (!addItemsDialogOpen) {
      setSelectedItemIds(new Set());
      setSearchQuery("");
      setCategoryFilter("all");
    }
  }, [addItemsDialogOpen]);
  
  // Calculate inventory value - sum of purchase cost of all assigned items
  const calculateInventoryValue = (): number => {
    if (projectItemIds.length === 0) {
      return 0;
    }
    
    // Count how many times each item appears in project.itemIds (quantity)
    const itemCounts: Record<string, number> = {};
    projectItemIds.forEach(itemId => {
      itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
    });
    
    // Sum up purchase cost * quantity for each assigned item
    return projectItems.reduce((total, item) => {
      const quantity = itemCounts[item.id] || 0;
      return total + (item.purchaseCost * quantity);
    }, 0);
  };
  
  const inventoryValue = calculateInventoryValue();
  
  // Calculate days remaining (contract duration from settings) using real-time date
  const today = currentDate;
  const contractDuration = getSetting("contractDuration");
  const contractEndDate = project.stagingDate ? new Date(project.stagingDate.getTime() + contractDuration * 24 * 60 * 60 * 1000) : project.endDate;
  const daysRemaining = differenceInDays(contractEndDate, today);
  const totalDays = contractDuration; // Contract duration from settings
  const daysElapsed = totalDays - daysRemaining;
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  // Calculate total value (matching invoice calculation exactly)
  const calculateProjectTotal = (): number => {
    if (!project.roomPricing || Object.keys(project.roomPricing).length === 0) {
      return 0;
    }
    
    // Calculate subtotal from room pricing - only include rooms with quantity > 0 and price > 0 (same as invoice)
    const subtotal = Object.values(project.roomPricing).reduce((sum, room) => {
      // Only include rooms that have quantity > 0 and price > 0 (matching invoice filter)
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
  
  const projectTotal = calculateProjectTotal();

  // Get staging status badge
  const getStagingStatusBadge = () => {
    if (isStaged) {
      return <Badge className="bg-primary text-primary-foreground">Staged</Badge>;
    } else if (project.stagingDate) {
      return <Badge className="bg-secondary text-secondary-foreground">Upcoming</Badge>;
    } else {
      return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  // Calculate insights
  const itemsByCategory = projectItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedCategory = Object.entries(itemsByCategory).sort((a, b) => b[1] - a[1])[0];
  
  // Get selected rooms from project (if any)
  const existingRooms = project.roomAssignments ? Object.keys(project.roomAssignments) : [];
  const [selectedRooms, setSelectedRooms] = useState<string[]>(existingRooms);
  
  // Custom rooms that user adds
  const [customRooms, setCustomRooms] = useState<string[]>(() => {
    // Get custom rooms (rooms that aren't in defaultRooms)
    return existingRooms.filter(room => !defaultRooms.includes(room));
  });
  
  // State for adding new room
  const [newRoomName, setNewRoomName] = useState("");
  const [showAddRoomInput, setShowAddRoomInput] = useState(false);
  
  // All rooms (default + custom)
  const allRooms = [...defaultRooms, ...customRooms];
  
  // Helper function to check if a room is a bedroom variant
  const isBedroomVariant = (room: string): boolean => {
    return room.startsWith("Bedroom (");
  };

  // Helper function to get bedroom size from room name
  const getBedroomSize = useCallback((room: string): "small" | "medium" | "large" | null => {
    if (room === "Bedroom (S)" || room === "Bedroom (Small)") return "small";
    if (room === "Bedroom (M)" || room === "Bedroom (Medium)") return "medium";
    if (room === "Bedroom (L)" || room === "Bedroom (Large)") return "large";
    if (room === "Bedroom") return "medium"; // Legacy support
    return null;
  }, []);
  
  // Room quantities state - track quantity for each room
  // Initialize with saved quantities from project if available
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const allRoomsList = [...defaultRooms, ...existingRooms.filter(r => !defaultRooms.includes(r))];
    
    // First, try to load from saved project pricing
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      allRoomsList.forEach(room => {
        if (project.roomPricing![room]) {
          initial[room] = project.roomPricing![room].quantity;
        } else {
          // Initialize with 1 if room is selected, or 0 if not
          initial[room] = existingRooms.includes(room) ? 1 : 0;
        }
      });
    } else {
      // Otherwise, initialize with 1 if room is selected, or 0 if not
      allRoomsList.forEach(room => {
        initial[room] = existingRooms.includes(room) ? 1 : 0;
      });
    }
    return initial;
  });

  // Room pricing state - track price for each room
  // Initialize with saved pricing from project if available, otherwise use base pricing from settings
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const allRoomsList = [...defaultRooms, ...existingRooms.filter(r => !defaultRooms.includes(r))];
    
    // First, try to load from saved project pricing
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      allRoomsList.forEach(room => {
        if (project.roomPricing![room]) {
          initial[room] = project.roomPricing![room].price;
        } else {
          // Use base pricing from settings if not in saved pricing
          const roomPricingFromSettings = getRoomPricing("medium");
          initial[room] = roomPricingFromSettings[room] || 0;
        }
      });
    } else {
      // Otherwise, use base pricing from settings
      const roomPricingFromSettings = getRoomPricing("medium");
      allRoomsList.forEach(room => {
        initial[room] = roomPricingFromSettings[room] || 0;
      });
    }
    return initial;
  });

  // Auto-save functionality - save changes automatically after user stops editing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track saved state to detect changes
  const getSavedRoomsState = useCallback(() => {
    const savedRooms = project.roomAssignments ? Object.keys(project.roomAssignments) : [];
    const savedQuantities: Record<string, number> = {};
    const savedPrices: Record<string, number> = {};
    
    if (project.roomPricing) {
      Object.entries(project.roomPricing).forEach(([room, data]) => {
        savedQuantities[room] = data.quantity;
        savedPrices[room] = data.price;
      });
    }
    
    return {
      rooms: savedRooms,
      quantities: savedQuantities,
      prices: savedPrices,
      customRooms: savedRooms.filter(room => !defaultRooms.includes(room))
    };
  }, [project.roomAssignments, project.roomPricing]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const savedState = getSavedRoomsState();
    
    // Get current rooms with quantity > 0
    const currentRooms = selectedRooms.filter(room => (roomQuantities[room] || 0) > 0);
    const savedRooms = savedState.rooms.filter(room => (savedState.quantities[room] || 0) > 0);
    
    // If no rooms are saved yet, enable button if any rooms are selected
    if (savedRooms.length === 0) {
      return currentRooms.length > 0; // Enable if rooms are selected, disable if none selected
    }
    
    // Check if rooms changed (added or removed)
    if (currentRooms.length !== savedRooms.length) return true;
    
    // Check if room sets match
    const currentRoomsSet = new Set(currentRooms);
    const savedRoomsSet = new Set(savedRooms);
    
    if (currentRoomsSet.size !== savedRoomsSet.size) return true;
    for (const room of currentRooms) {
      if (!savedRoomsSet.has(room)) return true;
    }
    for (const room of savedRooms) {
      if (!currentRoomsSet.has(room)) return true;
    }
    
    // Check if quantities changed
    for (const room of currentRooms) {
      const currentQty = roomQuantities[room] || 0;
      const savedQty = savedState.quantities[room] || 0;
      if (currentQty !== savedQty) return true;
    }
    
    // Check if prices changed
    for (const room of currentRooms) {
      const currentPrice = roomPrices[room] || 0;
      const savedPrice = savedState.prices[room] || 0;
      if (Math.abs(currentPrice - savedPrice) > 0.01) return true; // Allow for floating point precision
    }
    
    // Check if custom rooms changed
    const currentCustomRooms = [...customRooms].sort();
    const savedCustomRooms = [...savedState.customRooms].sort();
    if (currentCustomRooms.length !== savedCustomRooms.length) return true;
    if (currentCustomRooms.length > 0 && !currentCustomRooms.every(room => savedCustomRooms.includes(room))) return true;
    if (savedCustomRooms.length > 0 && !savedCustomRooms.every(room => currentCustomRooms.includes(room))) return true;
    
    return false;
  }, [selectedRooms, roomQuantities, roomPrices, customRooms, getSavedRoomsState]);
  
  const saveProjectChanges = useCallback(() => {
    if (!onUpdateJob) return;
    
    // Create room assignments object - only include selected rooms with quantity > 0
    const roomAssignments: Record<string, string[]> = {};
    selectedRooms.forEach(room => {
      const qty = roomQuantities[room] || 0;
      if (qty > 0) {
        // Preserve existing item assignments for this room, or initialize empty array
        roomAssignments[room] = project.roomAssignments?.[room] || [];
      }
    });

    // Store pricing data for invoice use (including size) - only for selected rooms with quantity > 0
    const pricingData: Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }> = {};
    selectedRooms.forEach(room => {
      const qty = roomQuantities[room] || 0;
      if (qty > 0) {
        const bedroomSize = getBedroomSize(room);
        pricingData[room] = {
          price: roomPrices[room] || 0,
          quantity: qty,
          size: bedroomSize || undefined,
        };
      }
    });
    
    // Update the roomPricing state used for invoices
    setRoomPricing(pricingData);

    // Update project with all changes: room assignments, pricing data, and preserve other project data
    // Mark project as staged when rooms are saved (if rooms with quantity > 0 exist)
    const hasRooms = Object.keys(pricingData).length > 0;
    const updatedProject: JobAssignment = {
      ...project,
      roomAssignments: Object.keys(roomAssignments).length > 0 ? roomAssignments : undefined,
      roomPricing: hasRooms ? pricingData : undefined,
      stagingStatus: hasRooms ? "staged" : project.stagingStatus,
      // Set staging date to today if not already set and rooms are being saved
      stagingDate: hasRooms && !project.stagingDate ? currentDate : project.stagingDate,
    };
    
    onUpdateJob(updatedProject);
  }, [onUpdateJob, project, selectedRooms, roomQuantities, roomPrices, allRooms, getBedroomSize, currentDate]);

  
  // Auto-save when room selections, quantities, or prices change (debounced)
  useEffect(() => {
    if (!onUpdateJob) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveProjectChanges();
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedRooms, roomQuantities, roomPrices, saveProjectChanges, onUpdateJob]);

  // Save on unmount to ensure no changes are lost
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save immediately on unmount if there are changes
      if (onUpdateJob && (selectedRooms.length > 0 || Object.keys(roomQuantities).length > 0 || Object.keys(roomPrices).length > 0)) {
        saveProjectChanges();
      }
    };
  }, [onUpdateJob, saveProjectChanges, selectedRooms, roomQuantities, roomPrices]);
  
  // Function to add a new custom room
  const handleAddCustomRoom = () => {
    const trimmedName = newRoomName.trim();
    if (!trimmedName) {
      toast.error("Please enter a room name");
      return;
    }
    
    if (allRooms.includes(trimmedName)) {
      toast.error("This room already exists");
      return;
    }
    
    // Check if it's "Entryway" or contains "Entryway" to set default price
    const defaultPrice = trimmedName.toLowerCase().includes("entryway") ? 75 : 0;
    
    setCustomRooms([...customRooms, trimmedName]);
    setRoomQuantities(prev => ({ ...prev, [trimmedName]: 0 }));
    setRoomPrices(prev => ({ ...prev, [trimmedName]: defaultPrice }));
    setNewRoomName("");
    setShowAddRoomInput(false);
    toast.success(`Added "${trimmedName}" room`);
  };
  
  // Function to remove a custom room
  const handleRemoveCustomRoom = (room: string) => {
    setCustomRooms(customRooms.filter(r => r !== room));
    setRoomQuantities(prev => {
      const updated = { ...prev };
      delete updated[room];
      return updated;
    });
    setRoomPrices(prev => {
      const updated = { ...prev };
      delete updated[room];
      return updated;
    });
    setSelectedRooms(selectedRooms.filter(r => r !== room));
    toast.success(`Removed "${room}" room`);
  };
  
  // Sync selected rooms and pricing when project ID changes (initial load or project switch)
  // Use a ref to track the last synced project ID to avoid overwriting user selections
  const lastSyncedProjectIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only sync if this is a different project (project ID changed)
    if (lastSyncedProjectIdRef.current !== project.id) {
      lastSyncedProjectIdRef.current = project.id;
      
    const rooms = project.roomAssignments ? Object.keys(project.roomAssignments) : [];
    setSelectedRooms(rooms);
    
    // Update custom rooms from project
    const projectCustomRooms = rooms.filter(room => !defaultRooms.includes(room));
    setCustomRooms(projectCustomRooms);
    
    // Load saved pricing from project if available
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      setRoomPricing({ ...project.roomPricing });
      
      // Update roomPrices and roomQuantities from saved pricing
      setRoomPrices(prev => {
        const updated = { ...prev };
        Object.entries(project.roomPricing!).forEach(([room, data]) => {
          updated[room] = data.price;
        });
        return updated;
      });
      
      setRoomQuantities(prev => {
        const updated = { ...prev };
        Object.entries(project.roomPricing!).forEach(([room, data]) => {
          updated[room] = data.quantity;
        });
        return updated;
      });
    }
    }
  }, [project.id, project.roomAssignments, project.roomPricing]);

  // Update quantities when rooms change
  useEffect(() => {
    const rooms = selectedRooms;
    setRoomQuantities(prev => {
      const updated = { ...prev };
      const allRoomsList = [...defaultRooms, ...customRooms];
      allRoomsList.forEach(room => {
        if (rooms.includes(room) && updated[room] === 0) {
          updated[room] = 1;
        } else if (!rooms.includes(room) && defaultRooms.includes(room)) {
          updated[room] = 0;
        }
      });
      return updated;
    });
  }, [selectedRooms, customRooms]);
  
  // Calculate base price per room (sum of all items in that room)
  const getRoomBasePrice = (room: string) => {
    if (!project.roomAssignments || !project.roomAssignments[room]) {
      // If no room assignments, calculate based on items
      // For now, we'll use a default calculation or let user set price
      return 0;
    }
    
    const itemIds = project.roomAssignments[room];
    return itemIds.reduce((sum, itemId) => {
      const item = projectItems.find(i => i.id === itemId);
      if (item) {
        const quantity = project.itemIds?.filter(id => id === item.id).length || 1;
        return sum + (item.purchaseCost * quantity);
      }
      return sum;
    }, 0);
  };

  // Room pricing state: { roomName: { price: number, quantity: number, size?: "small" | "medium" | "large" } }
  // Initialize from saved project pricing if available, otherwise use base pricing
  const [roomPricing, setRoomPricing] = useState<Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }>>(() => {
    // First, try to load from saved project data
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      return { ...project.roomPricing };
    }
    
    // Otherwise, initialize with base pricing for selected rooms
    const initial: Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }> = {};
    const selectedRoomsList = existingRooms.length > 0 ? existingRooms : [];
    
    selectedRoomsList.forEach(room => {
      // Get pricing from settings
      const roomPricingFromSettings = getRoomPricing("medium");
      const basePrice = roomPricingFromSettings[room] || 0;
      // Calculate base price from items if no room assignments
      const itemsInRoom = projectItems.filter(item => {
        // Simple heuristic for room assignment
        if (item.category === "Furniture") {
          if (item.name.toLowerCase().includes("bed") || item.name.toLowerCase().includes("bedroom")) {
            return room === "Bedroom";
          } else if (item.name.toLowerCase().includes("dining") || item.name.toLowerCase().includes("table")) {
            return room === "Dining Room";
          } else {
            return room === "Living Room";
          }
        } else if (item.category === "Decor") {
          return room === "Living Room";
        }
        return false;
      });
      const calculatedPrice = itemsInRoom.reduce((sum, item) => {
        const quantity = project.itemIds?.filter(id => id === item.id).length || 1;
        return sum + (item.purchaseCost * quantity);
      }, 0);
      
      // Use calculated price if available, otherwise use base pricing from settings, otherwise 0
      const price = calculatedPrice > 0 ? calculatedPrice : (roomPricingFromSettings[room] || basePrice || 0);
      if (price > 0) {
        // Extract size from bedroom variant names
        const bedroomSize = getBedroomSize(room);
        initial[room] = { 
          price, 
          quantity: 1, 
          size: bedroomSize || undefined 
        };
      }
    });
    return initial;
  });

  // Sync prices from settings - ensure prices always reflect current settings
  // This runs when rooms are selected
  useEffect(() => {
    setRoomPrices(prev => {
      const updated = { ...prev };
      const allRoomsList = [...defaultRooms, ...customRooms];
      const roomPricingFromSettings = getRoomPricing("medium");
      
      allRoomsList.forEach(room => {
        // Only update prices for selected rooms that don't have manually edited prices
        // OR for rooms that are being initialized
        if (selectedRooms.includes(room) || !prev[room] || prev[room] === 0) {
          const priceFromSettings = roomPricingFromSettings[room] || 0;
          // Only update if we don't have a saved price from project, or if price is 0
          if (!project.roomPricing?.[room]?.price || prev[room] === 0) {
            updated[room] = priceFromSettings;
          }
        }
      });
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRooms, customRooms]);


  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const invoiceContentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  // Hook to calculate and apply scale for desktop view
  useEffect(() => {
    if (!invoiceDialogOpen) {
      setScale(1);
      setIsDesktop(false);
      return;
    }

    // Safety check for window object
    if (typeof window === 'undefined') {
      return;
    }

    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      return desktop;
    };

    const updateScale = () => {
      const desktop = checkDesktop();
      if (!desktop) {
        setScale(1);
        return;
      }

      // Wait for next frame to ensure content is rendered
      requestAnimationFrame(() => {
        if (!invoiceContentRef.current) return;

        const content = invoiceContentRef.current;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Account for dialog padding and margins (5vw on each side)
        const availableWidth = viewportWidth * 0.9;
        const availableHeight = viewportHeight * 0.85;

        // Get the natural content dimensions
        const contentWidth = content.scrollWidth || content.offsetWidth;
        const contentHeight = content.scrollHeight || content.offsetHeight;

        if (contentWidth === 0 || contentHeight === 0) {
          // Content not ready yet, try again
          setTimeout(updateScale, 50);
          return;
        }

        // Calculate scale factors
        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        
        // Use the smaller scale to ensure it fits both dimensions, but never scale up (min 1)
        const newScale = Math.min(1, scaleX, scaleY);
        setScale(newScale);
      });
    };

    // Initial check
    checkDesktop();
    
    // Initial calculation with delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      updateScale();
    }, 150);

    // Use ResizeObserver to watch for content size changes
    let resizeObserver: ResizeObserver | null = null;
    
    const setupObserver = () => {
      if (invoiceContentRef.current && !resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          updateScale();
        });
        resizeObserver.observe(invoiceContentRef.current);
      }
    };

    // Setup observer after a short delay
    const observerTimeoutId = setTimeout(setupObserver, 200);

    // Also watch window resize
    window.addEventListener('resize', updateScale);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(observerTimeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateScale);
    };
  }, [invoiceDialogOpen, roomPricing]);

  // Calculate invoice details based on room pricing
  // Only include rooms that are actually selected for staging
  const getInvoiceRooms = () => {
    return Object.entries(roomPricing)
      .filter(([room, data]) => {
        // Only include rooms that are selected AND have quantity > 0 and price > 0
        const isSelected = selectedRooms.includes(room);
        return isSelected && data.quantity > 0 && data.price > 0;
      })
      .map(([room, data]) => ({
        room,
        price: data.price,
        quantity: data.quantity,
        total: data.price * data.quantity,
      }));
  };

  const invoiceRooms = getInvoiceRooms();
  const subtotal = invoiceRooms.reduce((sum, room) => sum + room.total, 0);
  
  // Delivery and pickup fees from settings
  const deliveryFee = getSetting("deliveryFee");
  const pickupFee = getSetting("pickupFee");
  const feesSubtotal = subtotal + deliveryFee + pickupFee;
  
  // Get tax rate based on location (default to 10% if not found)
  const getTaxRateByLocation = (location: string): number => {
    // Common tax rates by state/location
    const locationLower = location.toLowerCase();
    
    // California
    if (locationLower.includes('california') || locationLower.includes('ca') || locationLower.includes('los angeles') || locationLower.includes('san francisco') || locationLower.includes('san diego')) {
      return 0.1025; // 10.25%
    }
    // New York
    if (locationLower.includes('new york') || locationLower.includes('ny') || locationLower.includes('nyc') || locationLower.includes('manhattan')) {
      return 0.08875; // 8.875%
    }
    // Texas
    if (locationLower.includes('texas') || locationLower.includes('tx') || locationLower.includes('houston') || locationLower.includes('dallas') || locationLower.includes('austin')) {
      return 0.0825; // 8.25%
    }
    // Florida
    if (locationLower.includes('florida') || locationLower.includes('fl') || locationLower.includes('miami') || locationLower.includes('orlando')) {
      return 0.075; // 7.5%
    }
    // Illinois/Chicago
    if (locationLower.includes('illinois') || locationLower.includes('il') || locationLower.includes('chicago')) {
      return 0.1025; // 10.25%
    }
    // Washington
    if (locationLower.includes('washington') || locationLower.includes('wa') || locationLower.includes('seattle')) {
      return 0.101; // 10.1%
    }
    // Default tax rate
    return 0.1; // 10%
  };
  
  const taxRate = getTaxRateByLocation(project.fullAddress || project.jobLocation || '');
  const tax = feesSubtotal * taxRate;
  const total = feesSubtotal + tax;

  const updateRoomQuantity = (room: string, delta: number) => {
    setRoomPricing(prev => {
      const current = prev[room] || { price: 0, quantity: 0 };
      const newQuantity = Math.max(0, current.quantity + delta);
      return {
        ...prev,
        [room]: {
          ...current,
          quantity: newQuantity,
        },
      };
    });
  };

  const updateRoomPrice = (room: string, price: number) => {
    setRoomPricing(prev => ({
      ...prev,
      [room]: {
        ...(prev[room] || { quantity: 1 }),
        price: Math.max(0, price),
      },
    }));
  };

  // Reset room pricing when dialog opens - use saved prices from project if available
  // Only initialize rooms that are actually selected for staging
  React.useEffect(() => {
    if (invoiceDialogOpen) {
      // First, try to use saved pricing from project
      if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
        // Only include rooms that are selected
        const initial: Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }> = {};
        Object.entries(project.roomPricing).forEach(([room, data]) => {
          if (selectedRooms.includes(room) && data.quantity > 0 && data.price > 0) {
            initial[room] = { ...data };
          }
        });
        setRoomPricing(initial);
        return;
      }
      
      // Otherwise, use current roomPrices and roomQuantities
      const initial: Record<string, { price: number; quantity: number; size?: "small" | "medium" | "large" }> = {};
      allRooms.forEach(room => {
        const isSelected = selectedRooms.includes(room);
        const savedPrice = roomPrices[room] || 0;
        const savedQuantity = roomQuantities[room] || 0;
        const bedroomSize = getBedroomSize(room);
        
        // Only include rooms that are selected OR have saved quantities > 0
        if (isSelected || savedQuantity > 0) {
          if (savedPrice > 0 || savedQuantity > 0) {
            // Use saved pricing and quantity
            initial[room] = { 
              price: savedPrice, 
              quantity: savedQuantity > 0 ? savedQuantity : 1,
              size: bedroomSize || undefined
            };
          } else if (isSelected) {
            // If selected but no saved price, use base pricing from settings for default rooms
            if (defaultRooms.includes(room)) {
              const roomPricingFromSettings = getRoomPricing("medium");
              if (roomPricingFromSettings[room]) {
                initial[room] = { 
                  price: roomPricingFromSettings[room], 
                  quantity: 1,
                  size: bedroomSize || undefined
                };
              } else {
                // Fallback to calculated base price if no base pricing from settings
                const basePrice = getRoomBasePrice(room);
                if (basePrice > 0) {
                  initial[room] = { price: basePrice, quantity: 1, size: bedroomSize || undefined };
                }
              }
            }
          }
        }
      });
      if (Object.keys(initial).length === 0) {
        // If no room assignments, calculate from items
        projectItems.forEach(item => {
          const quantity = project.itemIds?.filter(id => id === item.id).length || 1;
          let assignedRoom = "Living Room"; // Default
          if (item.category === "Furniture") {
            if (item.name.toLowerCase().includes("bed") || item.name.toLowerCase().includes("bedroom")) {
              assignedRoom = "Bedroom";
            } else if (item.name.toLowerCase().includes("dining") || item.name.toLowerCase().includes("table")) {
              assignedRoom = "Dining Room";
            }
          }
          if (!initial[assignedRoom]) {
            initial[assignedRoom] = { price: 0, quantity: 1 };
          }
          initial[assignedRoom].price += item.purchaseCost * quantity;
        });
      }
      setRoomPricing(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceDialogOpen, roomPrices, roomQuantities, selectedRooms, project.roomPricing]);

  const handleDownloadInvoice = () => {
    if (invoiceRooms.length === 0) {
      toast.error("Please add at least one room to invoice");
      return;
    }

    // Generate invoice as PDF or text file
    const invoiceText = `
INVOICE
    Invoice #: INV-${project.id.slice(0, 8).toUpperCase()}-${format(currentDate, "yyyyMMdd")}
Date: ${format(currentDate, "MMMM d, yyyy")}
Total Amount: ${formatCurrency(total)}

BILL TO:
${project.clientName || "Client"}
${project.fullAddress || project.jobLocation}

PROJECT:
${project.clientName || project.shortAddress || project.jobLocation}

ITEMS:

${invoiceRooms.map(room => 
  `${room.quantity} ${room.room}${room.quantity > 1 ? 's' : ''} @ ${formatCurrency(room.price)} = ${formatCurrency(room.total)}`
).join('\n')}

Subtotal: ${formatCurrency(subtotal)}
Delivery Fee: ${formatCurrency(deliveryFee)}
Pickup Fee: ${formatCurrency(pickupFee)}
Tax (${(taxRate * 100).toFixed(2)}%): ${formatCurrency(tax)}
Total: ${formatCurrency(total)}
`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const projectName = project.clientName || project.shortAddress || project.jobLocation || "Project";
    link.download = `Invoice-${projectName.replace(/\s+/g, '-')}-${format(currentDate, "yyyy-MM-dd")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Invoice downloaded successfully!");
  };

  const handleEmailInvoice = () => {
    if (!project.clientEmail) {
      toast.error("No email address available. Please add a client email to send invoices.");
      return;
    }
    // In production, this would integrate with an email service
    toast.success(`Invoice email sent successfully to ${project.clientEmail}!`, {
      duration: 3000,
    });
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 leading-snug truncate">{project.clientName}</h2>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {getStagingStatusBadge()}
                {(() => {
                  // Calculate days until staging if not yet staged
                  const daysUntilStaging = project.stagingDate 
                    ? differenceInDays(project.stagingDate, currentDate)
                    : null;
                  
                  if (!isStaged && daysUntilStaging !== null && daysUntilStaging > 0) {
                    // Show days until staging starts
                    return (
                      <Badge variant="outline" className="gap-1.5">
                        <Clock className="w-3 h-3" />
                        {daysUntilStaging} {daysUntilStaging === 1 ? 'day' : 'days'} until staging
                      </Badge>
                    );
                  } else if (isStaged && daysRemaining > 0) {
                    // Show days remaining in contract
                    return (
                      <Badge variant="outline" className="gap-1.5">
                        <Clock className="w-3 h-3" />
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                      </Badge>
                    );
                  } else if (isStaged && daysRemaining <= 0) {
                    // Contract ended
                    return (
                      <Badge variant="destructive" className="gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Contract ended
                      </Badge>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Send Invoice</span>
                    <span className="sm:hidden">Invoice</span>
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="invoice-modal"
                >
                  <div className="modal-content">
                    <DialogHeader>
                      <DialogTitle>Invoice</DialogTitle>
                    </DialogHeader>
                    
                    {/* Invoice Header */}
                    <div className="invoice-header">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug">Invoice #{`INV-${project.id.slice(0, 8).toUpperCase()}-${format(currentDate, "yyyyMMdd")}`}</h3>
                        <p className="text-sm font-normal text-muted-foreground leading-relaxed">Date: {format(currentDate, "MMMM d, yyyy")}</p>
                        <div className="mt-4">
                          <h4 className="text-base font-medium text-foreground mb-2 leading-normal">Bill To:</h4>
                          <p className="text-sm font-normal text-muted-foreground leading-relaxed">{project.clientName || "Client"}</p>
                          <p className="text-sm font-normal text-muted-foreground leading-relaxed">{project.fullAddress || project.jobLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Summary Table */}
                    <div className="overflow-x-auto mt-6">
                      <table className="invoice-table w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">QTY</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">DESCRIPTION</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">UNIT PRICE</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allRooms.filter(room => selectedRooms.includes(room)).map((room) => {
                            const roomData = roomPricing[room] || { price: 0, quantity: 0, size: undefined };
                            const lineTotal = (roomData.price || 0) * (roomData.quantity || 0);
                            // Room name already includes size for bedroom variants, so no need for additional label

                            return (
                              <tr key={room} className="border-b border-border/50">
                                <td data-label="QTY" className="px-6 py-3 text-center text-sm text-foreground font-normal">{roomData.quantity || 0}</td>
                                <td data-label="DESCRIPTION" className="px-6 py-3 text-left text-sm text-foreground font-normal">{room}</td>
                                <td data-label="UNIT PRICE" className="px-6 py-3 text-right text-sm text-foreground font-normal tabular-nums">{formatCurrency(roomData.price || 0)}</td>
                                <td data-label="AMOUNT" className="px-6 py-3 text-right text-sm text-foreground font-normal tabular-nums">{formatCurrency(lineTotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="pt-6 border-t border-border">
                      <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                          <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Delivery Fee:</span>
                            <span>{formatCurrency(deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Pickup Fee:</span>
                            <span>{formatCurrency(pickupFee)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                            <span>{formatCurrency(tax)}</span>
                          </div>
                          <div className="flex justify-between text-foreground font-semibold text-lg border-t border-border pt-2 mt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={handleDownloadInvoice}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        onClick={() => {
                          handleEmailInvoice();
                          setInvoiceDialogOpen(false);
                        }}
                        disabled={!project.clientEmail}
                        className="gap-2"
                        title={!project.clientEmail ? "No email address available" : ""}
                      >
                        <Mail className="w-4 h-4" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
                onClick={() => setAddItemsDialogOpen(true)}
              >
                <span className="hidden sm:inline">{isUpcoming ? "Add Inventory" : "Add Items"}</span>
                <span className="sm:hidden">{isUpcoming ? "Add" : "Add"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Progress */}
        <Card className="bg-card border-border elevation-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-foreground leading-normal">Contract Timeline</h4>
              <span className="text-sm font-normal text-muted-foreground leading-relaxed">
                {Math.max(0, daysElapsed)} of {totalDays} days elapsed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Start Date</label>
                <p className="text-sm font-normal text-foreground leading-relaxed">{format(project.startDate, "MMM d, yyyy")}</p>
              </div>
              <div className="text-right">
                <label className="text-xs font-medium text-muted-foreground leading-normal">End Date</label>
                <p className="text-sm font-normal text-foreground leading-relaxed">{format(project.endDate, "MMM d, yyyy")}</p>
              </div>
            </div>
            {project.roomPricing && Object.keys(project.roomPricing).length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Total Contract Amount</label>
                  <p className="text-lg font-semibold text-foreground leading-relaxed">
                    {formatCurrency(projectTotal)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Client Information */}
          <Card className="bg-card border-border elevation-sm p-4 sm:p-6">
            <h4 className="text-base font-medium text-foreground mb-4 leading-normal">Client Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Client Name</label>
                <p className="text-sm font-normal text-foreground leading-relaxed">{project.clientName || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Job Location</label>
                <p className="text-sm font-normal text-foreground leading-relaxed">{project.jobLocation}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Full Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-normal text-foreground leading-relaxed">{project.fullAddress || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Staging Information */}
          <Card className="bg-card border-border elevation-sm p-6">
            <h4 className="text-base font-medium text-foreground mb-4 leading-normal">Staging Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Staging Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-normal text-foreground leading-relaxed">
                    {project.stagingDate ? format(project.stagingDate, "MMMM d, yyyy") : "Not set"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Staging Status</label>
                <div className="mt-1">
                  {getStagingStatusBadge()}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground leading-normal">Assigned By</label>
                <p className="text-sm font-normal text-foreground leading-relaxed">{project.assignedBy}</p>
              </div>
              {project.notes && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Notes</label>
                  <p className="text-sm font-normal text-foreground leading-relaxed">{project.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Rooms to Stage and Project Insights Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Rooms to Stage */}
          <div>
            <Card className="bg-card border-border elevation-sm p-4 sm:p-6 h-full flex flex-col">
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1 leading-snug">Rooms to Stage</h3>
                  <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                    Select rooms and set quantities for staging. Changes are saved automatically.
                  </p>
                </div>
              </div>

              {/* Room List */}
              <div className="flex-1 space-y-2 mb-4">
                {allRooms.map((room) => {
                  const isCustom = customRooms.includes(room);
                  const isSelected = selectedRooms.includes(room);
                  const quantity = roomQuantities[room] || 0;
                  const price = roomPrices[room] || 0;
                  const subtotal = price * quantity;
                  
                  return (
                    <motion.div
                      key={room}
                      initial={false}
                      animate={{ 
                        backgroundColor: isSelected ? "var(--color-muted)" : "transparent",
                        opacity: 1
                      }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation",
                        "hover:bg-muted/60 border-transparent",
                        isSelected && "bg-muted/40 shadow-sm"
                      )}
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedRooms([...selectedRooms, room]);
                          setRoomQuantities(prev => ({ ...prev, [room]: prev[room] || 1 }));
                          // Initialize price from settings when room is selected
                          const roomPricingFromSettings = getRoomPricing("medium");
                          const basePrice = roomPricingFromSettings[room] || 0;
                          setRoomPrices(prev => ({ ...prev, [room]: basePrice }));
                        } else {
                          setSelectedRooms(selectedRooms.filter((r) => r !== room));
                          setRoomQuantities(prev => ({ ...prev, [room]: 0 }));
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                        <Checkbox
                          id={`room-${room}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRooms([...selectedRooms, room]);
                              setRoomQuantities(prev => ({ ...prev, [room]: prev[room] || 1 }));
                              // Initialize price from settings when room is selected
                              const roomPricingFromSettings = getRoomPricing("medium");
                              const basePrice = roomPricingFromSettings[room] || 0;
                              setRoomPrices(prev => ({ ...prev, [room]: basePrice }));
                            } else {
                              setSelectedRooms(selectedRooms.filter((r) => r !== room));
                              setRoomQuantities(prev => ({ ...prev, [room]: 0 }));
                            }
                          }}
                        />
                      </div>
                      
                      {/* Room Name */}
                      <div className="flex items-center gap-2 flex-1 min-w-[120px] sm:min-w-[140px] overflow-hidden">
                        <Label
                          htmlFor={`room-${room}`}
                          className={cn(
                            "text-sm font-medium cursor-pointer truncate transition-colors flex-1 min-w-0",
                            isSelected ? "text-foreground font-semibold" : "text-foreground"
                          )}
                          title={room}
                        >
                          {room}
                        </Label>
                        {isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomRoom(room);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors ml-1"
                            aria-label={`Remove ${room}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newQty = Math.max(0, quantity - 1);
                            setRoomQuantities(prev => ({ ...prev, [room]: newQty }));
                            if (newQty === 0 && isSelected) {
                              setSelectedRooms(selectedRooms.filter((r) => r !== room));
                            }
                          }}
                          disabled={quantity <= 0}
                          className="h-[36px] sm:h-[30px] w-[36px] sm:w-[30px] p-0 shrink-0 rounded-md border-border hover:bg-muted hover:border-foreground/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 flex items-center justify-center touch-manipulation"
                          aria-label={`Decrease ${room} quantity`}
                        >
                          <Minus className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 0;
                            setRoomQuantities(prev => ({ ...prev, [room]: Math.max(0, qty) }));
                            if (qty > 0 && !isSelected) {
                              setSelectedRooms([...selectedRooms, room]);
                            } else if (qty === 0 && isSelected) {
                              setSelectedRooms(selectedRooms.filter((r) => r !== room));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 sm:w-24 h-[36px] sm:h-[30px] text-center text-base sm:text-sm border-border bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 flex-shrink-0 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`${room} quantity`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomQuantities(prev => ({ ...prev, [room]: (prev[room] || 0) + 1 }));
                            if (!isSelected) {
                              setSelectedRooms([...selectedRooms, room]);
                            }
                          }}
                          className="h-[36px] sm:h-[30px] w-[36px] sm:w-[30px] p-0 shrink-0 rounded-md border-border hover:bg-muted hover:border-foreground/20 transition-all flex-shrink-0 flex items-center justify-center touch-manipulation"
                          aria-label={`Increase ${room} quantity`}
                        >
                          <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                        </Button>
                      </div>

                      {/* Price Input - Right Aligned */}
                      <div className="flex items-center gap-1.5 shrink-0 min-w-[90px] justify-end ml-2 sm:ml-4">
                        <span className="text-sm text-muted-foreground font-medium">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={roomPrices[room] || ""}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0;
                            setRoomPrices(prev => ({ ...prev, [room]: Math.max(0, price) }));
                          }}
                          placeholder="0.00"
                          className="w-20 sm:w-24 h-[36px] sm:h-8 text-right text-base sm:text-sm border-border bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`${room} price`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Add Custom Room */}
                {showAddRoomInput ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/30"
                  >
                    <Input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomRoom();
                        } else if (e.key === "Escape") {
                          setShowAddRoomInput(false);
                          setNewRoomName("");
                        }
                      }}
                      placeholder="Enter room name..."
                      className="flex-1 h-9 text-sm border-border bg-background"
                      autoFocus
                    />
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddCustomRoom}
                      className="h-9 px-4 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddRoomInput(false);
                        setNewRoomName("");
                      }}
                      className="h-9 w-9 p-0 shrink-0 hover:bg-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddRoomInput(true)}
                    className="w-full h-10 text-sm border-dashed border-border hover:bg-muted/50 hover:border-foreground/30 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Room
                  </Button>
                )}
              </div>

              {/* Empty State */}
              {selectedRooms.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-normal text-muted-foreground leading-relaxed">No rooms selected for staging</p>
                    <p className="text-xs font-normal text-muted-foreground mt-1 leading-relaxed">Select rooms above to get started</p>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              {(() => {
                const selectedRoomsWithData = allRooms.filter(room => {
                  const qty = roomQuantities[room] || 0;
                  return qty > 0;
                });
                
                if (selectedRoomsWithData.length === 0) return null;
                
                const totalRooms = selectedRoomsWithData.reduce((sum, room) => {
                  return sum + (roomQuantities[room] || 0);
                }, 0);
                
                const totalPrice = selectedRoomsWithData.reduce((sum, room) => {
                  const qty = roomQuantities[room] || 0;
                  const price = roomPrices[room] || 0;
                  return sum + (price * qty);
                }, 0);
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-border bg-muted/20 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Total Rooms</span>
                      <span className="text-sm font-semibold text-foreground">{totalRooms}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-semibold text-foreground">Total Price</span>
                      <span className="text-lg font-bold text-foreground">
                        ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      Before taxes and without delivery fees
                    </p>
                  </motion.div>
                );
              })()}
            </Card>
          </div>

          {/* Insights & Analytics */}
          <Card className="bg-card border-border elevation-sm p-6 h-full">
            <h4 className="text-foreground mb-6">Project Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Total Items</label>
                </div>
                <p className="text-sm font-normal text-foreground leading-relaxed">{projectItems.length}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Inventory Value</label>
                </div>
                <p className="text-sm font-normal text-foreground leading-relaxed">{formatCurrency(inventoryValue)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Most Used Category</label>
                </div>
                <p className="text-sm font-normal text-foreground leading-relaxed">{mostUsedCategory?.[0] || "N/A"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <label className="text-xs font-medium text-muted-foreground leading-normal">Status</label>
                </div>
                <p className="text-sm font-normal text-foreground capitalize leading-relaxed">{project.status}</p>
              </div>
            </div>
          </Card>
        </div>



        {/* Items List */}
        <Card className="bg-card border-border elevation-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h4 className="text-foreground text-base sm:text-lg">
              {isStaged ? "Staged Items" : "Assigned Items"} ({projectItems.length})
            </h4>
            <Button
              onClick={() => setAddItemsDialogOpen(true)}
              className="gap-2 min-h-[44px] touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Items</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {projectItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => onNavigate("itemDetail", { item })}
              >
                <Card className="bg-muted border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground mb-1 truncate">{item.name}</h4>
                      <Badge variant="outline" className="mb-2">{item.category}</Badge>
                      <p className="text-muted-foreground">${item.purchaseCost.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {projectItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              {!isStaged ? (
                <>
                  <h4 className="text-foreground mb-2">Staging Upcoming</h4>
                  <p className="text-muted-foreground mb-4">
                    Items will be staged on {project.stagingDate ? format(project.stagingDate, "MMMM d, yyyy") : "TBD"}
                  </p>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] touch-manipulation"
                    onClick={() => setAddItemsDialogOpen(true)}
                  >
                    {isUpcoming ? "Add Inventory" : "Add Items to Project"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No items assigned yet</p>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] touch-manipulation"
                    onClick={() => setAddItemsDialogOpen(true)}
                  >
                    {isUpcoming ? "Add Inventory" : "Add Items to Project"}
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Items Multi-Select Dialog */}
      <Dialog open={addItemsDialogOpen} onOpenChange={setAddItemsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-foreground leading-snug">
              Add Items to Project
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground leading-relaxed">
              Select multiple items to assign to this project
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px] text-base"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Items Count */}
          {selectedItemIds.size > 0 && (
            <div className="mb-4 flex items-center justify-between flex-shrink-0 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium text-foreground">
                {selectedItemIds.size} item{selectedItemIds.size > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItemIds(new Set())}
                className="h-8 text-xs"
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
            {filteredAvailableItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {availableItems.length === 0 
                    ? "No available items to assign" 
                    : "No items match your search"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredAvailableItems.map((item) => {
                  const activeProjects = jobAssignments.filter(job => job.status === "active");
                  const accurateQuantities = getAccurateItemQuantities(item, activeProjects);
                  const isSelected = selectedItemIds.has(item.id);
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "relative border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all touch-manipulation",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleItemToggle(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <ImageWithFallback
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground mb-1 truncate">{item.name}</h4>
                              <Badge variant="outline" className="text-xs mb-1">{item.category}</Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Available: {accurateQuantities.availableQuantity} of {item.totalQuantity}</p>
                            <p>Cost: ${item.purchaseCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setAddItemsDialogOpen(false)}
              className="flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSelectedItems}
              disabled={selectedItemIds.size === 0}
              className="flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
            >
              Assign {selectedItemIds.size > 0 && `(${selectedItemIds.size})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground leading-snug">
              Edit Project
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground leading-relaxed">
              Update the project details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client-name">
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-client-name"
                  value={editedProject.clientName || ""}
                  onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-job-location">
                  Job Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-job-location"
                  value={editedProject.jobLocation}
                  onChange={(e) => {
                    const location = e.target.value;
                    setEditedProject({
                      ...editedProject,
                      jobLocation: location,
                      shortAddress: location.split(",")[0],
                      fullAddress: location,
                    });
                  }}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-client-email">
                  Client Email
                </Label>
                <Input
                  id="edit-client-email"
                  type="email"
                  value={editedProject.clientEmail || ""}
                  onChange={(e) => setEditedProject({ ...editedProject, clientEmail: e.target.value })}
                  placeholder="client@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  If you don't add an email, you won't be able to send an invoice.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">
                  Status
                </Label>
                <Select
                  value={editedProject.status}
                  onValueChange={(value: "active" | "archived") => {
                    setEditedProject({ ...editedProject, status: value });
                  }}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>
                Requested Staging Date
              </Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="edit-stagingDate-select"
                    name="editStagingDateOption"
                    checked={editStagingDateOption === "date"}
                    onChange={() => {
                      setEditStagingDateOption("date");
                    }}
                    className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                  />
                  <Label htmlFor="edit-stagingDate-select" className="cursor-pointer font-normal">
                    Select a date
                  </Label>
                </div>
                {editStagingDateOption === "date" && (
                  <div className="ml-6">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          type="button"
                        >
                          {editedProject.stagingDate ? format(editedProject.stagingDate, "PP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={editedProject.stagingDate}
                          onSelect={(date) => {
                            if (date) {
                              // Update staging status based on date
                              const isUpcoming = date > currentDate;
                              setEditedProject({
                                ...editedProject,
                                stagingDate: date,
                                stagingStatus: isUpcoming ? "upcoming" : "staged",
                              });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="edit-stagingDate-tbd"
                    name="editStagingDateOption"
                    checked={editStagingDateOption === "tbd"}
                    onChange={() => {
                      setEditStagingDateOption("tbd");
                      setEditedProject({
                        ...editedProject,
                        stagingDate: undefined,
                        stagingStatus: undefined,
                      });
                    }}
                    className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                  />
                  <Label htmlFor="edit-stagingDate-tbd" className="cursor-pointer font-normal">
                    To be determined
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={editedProject.notes || ""}
                onChange={(e) => setEditedProject({ ...editedProject, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditedProject(project);
                  setEditStagingDateOption(project.stagingDate ? "date" : "tbd");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!editedProject.clientName || !editedProject.jobLocation) {
                    toast.error("Please fill in all required fields");
                    return;
                  }

                  setIsSaving(true);

                  // Simulate API call
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  // Calculate end date based on staging date and contract duration
                  const contractDuration = getSetting("contractDuration");
                  let updatedEndDate = editedProject.endDate;
                  
                  if (editedProject.stagingDate) {
                    updatedEndDate = new Date(editedProject.stagingDate.getTime() + contractDuration * 24 * 60 * 60 * 1000);
                  }

                  const updatedProject: JobAssignment = {
                    ...editedProject,
                    endDate: updatedEndDate,
                  };

                  if (onUpdateJob) {
                    onUpdateJob(updatedProject);
                  }

                  toast.success("Project updated successfully");
                  setIsSaving(false);
                  setEditDialogOpen(false);
                }}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
