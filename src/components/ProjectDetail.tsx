import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Clock, Package, TrendingUp, DollarSign, AlertCircle, CheckCircle, FileText, Mail, Plus, Minus } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import type { AppState, JobAssignment, InventoryItem } from "../types";
import { getProjectItemIds, isProjectStaged } from "../utils/projectUtils";

interface ProjectDetailProps {
  project: JobAssignment;
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  onUpdateJob?: (job: JobAssignment) => void;
}

// Default rooms for staging projects - defined outside component to avoid re-creation
const defaultRooms = ["Living Room", "Dining Room", "Bathroom", "Bedroom", "Kitchen", "Office", "Other"];

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

export function ProjectDetail({ project, items, onNavigate, onUpdateJob }: ProjectDetailProps) {
  // Get items assigned to this project (only if staging date has passed)
  const projectItemIds = getProjectItemIds(project);
  const projectItems = items.filter(item => projectItemIds.includes(item.id));
  const isStaged = isProjectStaged(project);
  
  // Calculate days remaining (45-day contract from staging date)
  const today = new Date();
  const contractEndDate = project.stagingDate ? new Date(project.stagingDate.getTime() + 45 * 24 * 60 * 60 * 1000) : project.endDate;
  const daysRemaining = differenceInDays(contractEndDate, today);
  const totalDays = 45; // All staging contracts are 45 days
  const daysElapsed = totalDays - daysRemaining;
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  // Calculate total value
  const totalValue = projectItems.reduce((sum, item) => {
    const quantity = project.itemIds?.filter(id => id === item.id).length || 1;
    return sum + (item.purchaseCost * quantity);
  }, 0);

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
  // Initialize with saved pricing from project if available, otherwise use base pricing
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const allRoomsList = [...defaultRooms, ...existingRooms.filter(r => !defaultRooms.includes(r))];
    
    // First, try to load from saved project pricing
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      allRoomsList.forEach(room => {
        if (project.roomPricing![room]) {
          initial[room] = project.roomPricing![room].price;
        } else {
          // Use base pricing if not in saved pricing
          initial[room] = baseRoomPricing[room] || 0;
        }
      });
    } else {
      // Otherwise, use base pricing
      allRoomsList.forEach(room => {
        initial[room] = baseRoomPricing[room] || 0;
      });
    }
    return initial;
  });
  
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
  
  // Sync selected rooms and pricing when project changes
  useEffect(() => {
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
  }, [project.roomAssignments, project.roomPricing]);

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

  // Room pricing state: { roomName: { price: number, quantity: number } }
  // Initialize from saved project pricing if available, otherwise use base pricing
  const [roomPricing, setRoomPricing] = useState<Record<string, { price: number; quantity: number }>>(() => {
    // First, try to load from saved project data
    if (project.roomPricing && Object.keys(project.roomPricing).length > 0) {
      return { ...project.roomPricing };
    }
    
    // Otherwise, initialize with base pricing for selected rooms
    const initial: Record<string, { price: number; quantity: number }> = {};
    const selectedRoomsList = existingRooms.length > 0 ? existingRooms : [];
    
    selectedRoomsList.forEach(room => {
      const basePrice = getRoomBasePrice(room);
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
      
      // Use calculated price if available, otherwise use base pricing, otherwise 0
      const price = calculatedPrice > 0 ? calculatedPrice : (baseRoomPricing[room] || basePrice || 0);
      if (price > 0) {
        initial[room] = { price, quantity: 1 };
      }
    });
    return initial;
  });

  // Sync prices from roomPricing state or use base pricing
  useEffect(() => {
    setRoomPrices(prev => {
      const updated = { ...prev };
      const allRoomsList = [...defaultRooms, ...customRooms];
      allRoomsList.forEach(room => {
        // First check if there's saved pricing from roomPricing
        if (Object.keys(roomPricing).length > 0 && roomPricing[room]?.price) {
          const existingPrice = roomPricing[room].price;
          if (existingPrice > 0) {
            updated[room] = existingPrice;
          }
        } else if (!updated[room] || updated[room] === 0) {
          // If no saved price, use base pricing for default rooms
          if (defaultRooms.includes(room) && baseRoomPricing[room]) {
            updated[room] = baseRoomPricing[room];
          }
        }
      });
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomPricing, customRooms]);

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
  
  // Delivery and pickup fees (always included)
  const deliveryFee = 400;
  const pickupFee = 400;
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
        const initial: Record<string, { price: number; quantity: number }> = {};
        Object.entries(project.roomPricing).forEach(([room, data]) => {
          if (selectedRooms.includes(room) && data.quantity > 0 && data.price > 0) {
            initial[room] = { ...data };
          }
        });
        setRoomPricing(initial);
        return;
      }
      
      // Otherwise, use current roomPrices and roomQuantities
      const initial: Record<string, { price: number; quantity: number }> = {};
      allRooms.forEach(room => {
        const isSelected = selectedRooms.includes(room);
        const savedPrice = roomPrices[room] || 0;
        const savedQuantity = roomQuantities[room] || 0;
        
        // Only include rooms that are selected OR have saved quantities > 0
        if (isSelected || savedQuantity > 0) {
          if (savedPrice > 0 || savedQuantity > 0) {
            // Use saved pricing and quantity
            initial[room] = { 
              price: savedPrice, 
              quantity: savedQuantity > 0 ? savedQuantity : 1 
            };
          } else if (isSelected) {
            // If selected but no saved price, use base pricing for default rooms
            if (defaultRooms.includes(room) && baseRoomPricing[room]) {
              initial[room] = { 
                price: baseRoomPricing[room], 
                quantity: 1 
              };
            } else if (defaultRooms.includes(room)) {
              // Fallback to calculated base price if no base pricing
              const basePrice = getRoomBasePrice(room);
              if (basePrice > 0) {
                initial[room] = { price: basePrice, quantity: 1 };
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
Invoice #: INV-${project.id.slice(0, 8).toUpperCase()}-${format(new Date(), "yyyyMMdd")}
Date: ${format(new Date(), "MMMM d, yyyy")}
Total Amount: $${total.toFixed(2)}

BILL TO:
${project.clientName || "Client"}
${project.fullAddress || project.jobLocation}

PROJECT:
${project.jobName}

ITEMS:

${invoiceRooms.map(room => 
  `${room.quantity} ${room.room}${room.quantity > 1 ? 's' : ''} @ $${room.price.toFixed(2)} = $${room.total.toFixed(2)}`
).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
Delivery Fee: $${deliveryFee.toFixed(2)}
Pickup Fee: $${pickupFee.toFixed(2)}
Tax (${(taxRate * 100).toFixed(2)}%): $${tax.toFixed(2)}
Total: $${total.toFixed(2)}
`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${project.jobName.replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Invoice downloaded successfully!");
  };

  const handleEmailInvoice = () => {
    // In production, this would integrate with an email service
    toast.success("Invoice email sent successfully!", {
      duration: 3000,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("allProjects")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-foreground mb-2">{project.clientName}</h2>
              <div className="flex items-center gap-3">
                {getStagingStatusBadge()}
                {(() => {
                  // Calculate days until staging if not yet staged
                  const daysUntilStaging = project.stagingDate 
                    ? differenceInDays(project.stagingDate, today)
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
            <div className="flex items-center gap-3">
              <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Send Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className={`max-w-[95vw] w-[95vw] max-h-[90vh] p-0 ${isDesktop ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                  <div className={`w-full ${isDesktop ? 'h-full flex items-start justify-center' : ''}`} style={isDesktop ? { minHeight: '90vh' } : {}}>
                    <div 
                      ref={invoiceContentRef}
                      className="w-full"
                      style={{
                        transform: isDesktop ? `scale(${scale})` : 'none',
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease-out',
                        willChange: isDesktop ? 'transform' : 'auto',
                      }}
                    >
                      <div className="p-6 space-y-6">
                        <DialogHeader>
                          <DialogTitle>Invoice</DialogTitle>
                        </DialogHeader>
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-foreground font-semibold mb-2">Invoice #{`INV-${project.id.slice(0, 8).toUpperCase()}-${format(new Date(), "yyyyMMdd")}`}</h3>
                        <p className="text-muted-foreground">Date: {format(new Date(), "MMMM d, yyyy")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-semibold">{project.jobName}</p>
                        <p className="text-foreground text-2xl font-bold mt-2">${total.toFixed(2)}</p>
                        <p className="text-muted-foreground text-sm">Total Amount</p>
                      </div>
                    </div>

                    {/* Bill To */}
                    <div>
                      <h4 className="text-foreground font-medium mb-2">Bill To:</h4>
                      <p className="text-muted-foreground">{project.clientName || "Client"}</p>
                      <p className="text-muted-foreground">{project.fullAddress || project.jobLocation}</p>
                    </div>

                    {/* Room Pricing */}
                    <div>
                      <h4 className="text-foreground font-medium mb-3">Rooms:</h4>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col className="w-[20%]" />
                            <col className="w-[30%]" />
                            <col className="w-[30%]" />
                            <col className="w-[20%]" />
                          </colgroup>
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-4 text-sm font-medium text-foreground">Room</th>
                              <th className="text-center p-4 text-sm font-medium text-foreground">Quantity</th>
                              <th className="text-left p-4 text-sm font-medium text-foreground">Price</th>
                              <th className="text-right p-4 text-sm font-medium text-foreground">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allRooms.map((room, index) => {
                              const roomData = roomPricing[room] || { price: 0, quantity: 0 };
                              const total = (roomData.price || 0) * (roomData.quantity || 0);

                              return (
                                <tr key={room} className={index < allRooms.length - 1 ? "border-b border-border" : ""}>
                                  <td className="p-4 align-middle">
                                    <span className="text-foreground font-medium text-sm">{room}</span>
                                  </td>
                                  <td className="p-4 align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateRoomQuantity(room, -1)}
                                        disabled={roomData.quantity <= 0}
                                        className="h-9 w-9 p-0 shrink-0"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={roomData.quantity || ""}
                                        onChange={(e) => {
                                          const qty = parseInt(e.target.value) || 0;
                                          setRoomPricing(prev => ({
                                            ...prev,
                                            [room]: { ...(prev[room] || { price: 0 }), quantity: Math.max(0, qty) },
                                          }));
                                        }}
                                        className="w-16 text-center h-9"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateRoomQuantity(room, 1)}
                                        className="h-9 w-9 p-0 shrink-0"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                  <td className="p-4 align-middle">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-muted-foreground text-sm flex items-center h-9">$</span>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={roomData.price || ""}
                                        onChange={(e) => {
                                          const price = parseFloat(e.target.value) || 0;
                                          updateRoomPrice(room, price);
                                        }}
                                        placeholder="0.00"
                                        className="w-full max-w-32 h-9"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-4 text-right align-middle">
                                    <span className="text-foreground font-medium">
                                      ${total.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Delivery Fee:</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Pickup Fee:</span>
                          <span>${pickupFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground font-semibold text-lg border-t border-border pt-2">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
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
                            className="gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => onNavigate("library", { selectedProjectId: project.id })}
              >
                Manage Inventory
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Progress */}
        <Card className="bg-card border-border elevation-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground">Contract Timeline</h4>
              <span className="text-muted-foreground">
                {Math.max(0, daysElapsed)} of {totalDays} days elapsed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between">
              <div>
                <label className="text-muted-foreground">Start Date</label>
                <p className="text-foreground">{format(project.startDate, "MMM d, yyyy")}</p>
              </div>
              <div className="text-right">
                <label className="text-muted-foreground">End Date</label>
                <p className="text-foreground">{format(project.endDate, "MMM d, yyyy")}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Client Information */}
          <Card className="bg-card border-border elevation-sm p-6">
            <h4 className="text-foreground mb-4">Client Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground">Client Name</label>
                <p className="text-foreground">{project.clientName || "N/A"}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Job Location</label>
                <p className="text-foreground">{project.jobLocation}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Full Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{project.fullAddress || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Staging Information */}
          <Card className="bg-card border-border elevation-sm p-6">
            <h4 className="text-foreground mb-4">Staging Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground">Staging Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {project.stagingDate ? format(project.stagingDate, "MMMM d, yyyy") : "Not set"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground">Staging Status</label>
                <div className="mt-1">
                  {getStagingStatusBadge()}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground">Assigned By</label>
                <p className="text-foreground">{project.assignedBy}</p>
              </div>
              {project.notes && (
                <div>
                  <label className="text-muted-foreground">Notes</label>
                  <p className="text-foreground">{project.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Rooms to Stage and Project Insights Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rooms to Stage */}
          <div>
            <div className="bg-[#f9fafb] dark:bg-card border border-[#e5e7eb] dark:border-border rounded-xl shadow-sm p-6 space-y-6 h-full">
              <fieldset className="space-y-6">
                <div className="flex items-center justify-between">
                  <legend className="text-base font-semibold text-foreground">
                    Rooms to Stage
                  </legend>
                  {onUpdateJob && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // Create room assignments object - initialize selected rooms with empty arrays or keep existing item assignments
                        const roomAssignments: Record<string, string[]> = {};
                        // Only include rooms that have quantity > 0
                        Object.entries(roomQuantities).forEach(([room, qty]) => {
                          if (qty > 0) {
                            // Keep existing item assignments if they exist, otherwise initialize with empty array
                            roomAssignments[room] = project.roomAssignments?.[room] || [];
                          }
                        });

                        // Include custom rooms in room assignments
                        allRooms.forEach(room => {
                          const qty = roomQuantities[room] || 0;
                          if (qty > 0 && !roomAssignments[room]) {
                            roomAssignments[room] = [];
                          }
                        });

                        // Store pricing data for invoice use
                        const pricingData: Record<string, { price: number; quantity: number }> = {};
                        Object.entries(roomQuantities).forEach(([room, qty]) => {
                          if (qty > 0) {
                            pricingData[room] = {
                              price: roomPrices[room] || 0,
                              quantity: qty,
                            };
                          }
                        });
                        
                        // Update the roomPricing state used for invoices
                        setRoomPricing(pricingData);

                        // Update project with all rooms (including custom) and pricing data
                        const updatedProject: JobAssignment = {
                          ...project,
                          roomAssignments: Object.keys(roomAssignments).length > 0 ? roomAssignments : undefined,
                          roomPricing: Object.keys(pricingData).length > 0 ? pricingData : undefined,
                        };
                        
                        onUpdateJob(updatedProject);
                        
                        toast.success("Rooms and pricing updated successfully");
                      }}
                      className="font-medium px-4 h-9 rounded-lg"
                    >
                      Save Rooms
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {allRooms.map((room) => {
                    const isCustom = customRooms.includes(room);
                    const isSelected = selectedRooms.includes(room);
                    const quantity = roomQuantities[room] || 0;
                    
                    return (
                      <div
                        key={room}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white dark:hover:bg-muted/50 transition-colors group"
                      >
                        {/* Checkbox */}
                        <Checkbox
                          id={`room-${room}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRooms([...selectedRooms, room]);
                              setRoomQuantities(prev => ({ ...prev, [room]: prev[room] || 1 }));
                            } else {
                              setSelectedRooms(selectedRooms.filter((r) => r !== room));
                              setRoomQuantities(prev => ({ ...prev, [room]: 0 }));
                            }
                          }}
                          className="h-4 w-4 shrink-0"
                        />
                        
                        {/* Room Label */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Label
                            htmlFor={`room-${room}`}
                            className="text-sm font-normal text-foreground cursor-pointer flex-1 min-w-0"
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
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              aria-label={`Remove ${room}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newQty = Math.max(0, quantity - 1);
                              setRoomQuantities(prev => ({ ...prev, [room]: newQty }));
                              if (newQty === 0 && isSelected) {
                                setSelectedRooms(selectedRooms.filter((r) => r !== room));
                              }
                            }}
                            disabled={quantity <= 0}
                            className="h-9 w-9 p-0 shrink-0 border-[#e5e7eb] dark:border-border hover:bg-white dark:hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Decrease ${room} quantity`}
                          >
                            <Minus className="w-4 h-4" />
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
                            className="w-14 h-9 text-center text-sm border-[#e5e7eb] dark:border-border bg-white dark:bg-background focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`${room} quantity`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRoomQuantities(prev => ({ ...prev, [room]: (prev[room] || 0) + 1 }));
                              if (!isSelected) {
                                setSelectedRooms([...selectedRooms, room]);
                              }
                            }}
                            className="h-9 w-9 p-0 shrink-0 border-[#e5e7eb] dark:border-border hover:bg-white dark:hover:bg-muted"
                            aria-label={`Increase ${room} quantity`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price Input */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-sm text-muted-foreground">$</span>
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
                            className="w-20 h-9 text-sm border-[#e5e7eb] dark:border-border bg-white dark:bg-background focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`${room} price`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add Custom Room */}
                  {showAddRoomInput ? (
                    <div className="flex items-center gap-2 px-3 py-3 rounded-lg border border-[#e5e7eb] dark:border-border bg-white dark:bg-background">
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
                        className="flex-1 h-9 text-sm"
                        autoFocus
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomRoom}
                        className="h-9 px-3 shrink-0"
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
                        className="h-9 w-9 p-0 shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddRoomInput(true)}
                      className="w-full h-9 text-sm border-dashed border-[#e5e7eb] dark:border-border hover:bg-muted/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom Room
                    </Button>
                  )}
                </div>

                {selectedRooms.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No rooms selected for staging
                  </p>
                )}
              </fieldset>
            </div>
          </div>

          {/* Insights & Analytics */}
          <Card className="bg-card border-border elevation-sm p-6 h-full">
            <h4 className="text-foreground mb-6">Project Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <label className="text-muted-foreground">Total Items</label>
                </div>
                <p className="text-foreground">{projectItems.length}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <label className="text-muted-foreground">Total Value</label>
                </div>
                <p className="text-foreground">${totalValue.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <label className="text-muted-foreground">Most Used Category</label>
                </div>
                <p className="text-foreground">{mostUsedCategory?.[0] || "N/A"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <label className="text-muted-foreground">Status</label>
                </div>
                <p className="text-foreground capitalize">{project.status}</p>
              </div>
            </div>
          </Card>
        </div>



        {/* Items List */}
        <Card className="bg-card border-border elevation-sm p-6">
          <h4 className="text-foreground mb-6">Staged Items ({projectItems.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No items staged yet</p>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onNavigate("library", { selectedProjectId: project.id })}
                  >
                    Add Items to Project
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
