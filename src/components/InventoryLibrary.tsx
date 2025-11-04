import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Package, MapPin, Activity, Clock, ShoppingCart, Plus, Truck, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { formatDistanceToNow } from "date-fns";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming } from "../utils/projectUtils";

interface InventoryLibraryProps {
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  initialFilter?: string;
  jobAssignments: JobAssignment[];
  selectedProjectId?: string;
  onUpdateJob?: (job: JobAssignment) => void;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export function InventoryLibrary({ items, onNavigate, initialFilter = "all", jobAssignments, selectedProjectId, onUpdateJob }: InventoryLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState("name");
  const [selectedProject, setSelectedProject] = useState<string | null>(selectedProjectId || null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showAddMoreMode, setShowAddMoreMode] = useState(false);

  const categories = Array.from(new Set(items.map((item) => item.category)));

  // Get active projects (including upcoming ones)
  const activeProjects = jobAssignments.filter(job => job.status === "active");

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableQuantity === 0) {
      return { label: "All in Use", variant: "destructive" as const, filter: "inUse" };
    }
    if (item.availableQuantity <= 3) {
      return { label: "Low Stock", variant: "secondary" as const, filter: "lowStock" };
    }
    return { label: "Available", variant: "default" as const, filter: "available" };
  };

  // Check if we're viewing a staged project
  const selectedProjectData = activeProjects.find(p => p.id === selectedProject);
  const projectIsStaged = selectedProjectData ? isProjectStaged(selectedProjectData) : false;
  const isViewingStagedProject = projectIsStaged && !showAddMoreMode;
  const stagedItemIds = selectedProjectData ? getProjectItemIds(selectedProjectData) : [];

  const filteredItems = items
    .filter((item) => {
      // If viewing staged project items, only show items assigned to this project
      if (isViewingStagedProject) {
        if (!stagedItemIds.includes(item.id)) {
          return false;
        }
      }

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const status = getStockStatus(item);
      const matchesStatus =
        statusFilter === "all" || status.filter === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "dateAdded":
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case "usageCount":
          return b.usageCount - a.usageCount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const handleQuickAdd = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    if (item.availableQuantity === 0) {
      toast.error("No items available");
      return;
    }

    // Check if item is already in cart
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      // Increase quantity if not exceeding available
      if (existingItem.quantity < item.availableQuantity) {
        setCart(cart.map(cartItem => 
          cartItem.item.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
        toast.success(`Added 1 more ${item.name}`);
      } else {
        toast.error(`Maximum ${item.availableQuantity} available`);
      }
    } else {
      setCart([...cart, { item, quantity: 1 }]);
      toast.success(`Added ${item.name} to cart`);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const cartItem = cart.find(ci => ci.item.id === itemId);
    if (cartItem && quantity <= cartItem.item.availableQuantity && quantity > 0) {
      setCart(cart.map(ci => 
        ci.item.id === itemId 
          ? { ...ci, quantity }
          : ci
      ));
    }
  };

  const handleAssignToProject = () => {
    if (!selectedProject || cart.length === 0) return;

    const project = activeProjects.find(p => p.id === selectedProject);
    if (!project || !onUpdateJob) return;
    
    // Add cart items to the project's itemIds
    const newItemIds = cart.map(cartItem => cartItem.item.id);
    const existingItemIds = project.itemIds || [];
    const updatedItemIds = [...new Set([...existingItemIds, ...newItemIds])];
    
    // Update the project with new items
    const updatedProject = {
      ...project,
      itemIds: updatedItemIds,
    };
    
    onUpdateJob(updatedProject);
    
    toast.success(`Assigned ${cart.length} item(s) to ${project.jobName}`);
    setCart([]);
    setCartOpen(false);
    
    // Show the updated inventory by ensuring we're viewing the project
    setShowAddMoreMode(false);
  };

  const totalCartItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with Project Selector and Cart */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground">Inventory Library</h2>
          
          <div className="flex items-center gap-3">
            {/* Project Selector Dropdown */}
            {selectedProject && selectedProjectData && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                    <Truck className="w-4 h-4 text-foreground" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground">
                          Staged Date: {selectedProjectData.stagingDate ? format(selectedProjectData.stagingDate, "MMM d") : "TBD"}
                        </p>
                      </div>
                      <p className="text-muted-foreground">{selectedProjectData.shortAddress}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-3">
                    <div>
                      <label className="text-muted-foreground">Project</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-foreground">{selectedProjectData.jobName}</p>
                        {(() => {
                          if (projectIsStaged) {
                            return <Badge className="bg-primary text-primary-foreground">Staged</Badge>;
                          } else if (isStagingUpcoming(selectedProjectData.stagingDate)) {
                            return <Badge className="bg-secondary text-secondary-foreground">Upcoming</Badge>;
                          }
                          return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Delivery Address</label>
                      <p className="text-foreground">{selectedProjectData.fullAddress}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Staging Date</label>
                      <p className="text-foreground">
                        {selectedProjectData.stagingDate 
                          ? format(selectedProjectData.stagingDate, "PPP")
                          : "Not set"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onNavigate("projectDetail", { project: selectedProjectData })}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedProject(null)}
                      >
                        Change Project
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Cart Button */}
            <Popover open={cartOpen} onOpenChange={setCartOpen}>
              <PopoverTrigger asChild>
                <Button 
                  className="relative gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!selectedProject}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{totalCartItems}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <h4 className="text-foreground">Cart</h4>
                  {selectedProjectData && (
                    <p className="text-muted-foreground">
                      {selectedProjectData.jobName}
                    </p>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No items in cart</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {cart.map(cartItem => (
                        <div key={cartItem.item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="w-12 h-12 bg-background rounded flex items-center justify-center flex-shrink-0">
                            {cartItem.item.imageUrl ? (
                              <ImageWithFallback
                                src={cartItem.item.imageUrl}
                                alt={cartItem.item.name}
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground truncate">{cartItem.item.name}</p>
                            <p className="text-muted-foreground">
                              {cartItem.item.availableQuantity} available
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-background rounded hover:bg-card transition-colors"
                            >
                              -
                            </button>
                            <span className="text-foreground w-6 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-background rounded hover:bg-card transition-colors"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(cartItem.item.id)}
                              className="ml-2 text-destructive hover:text-destructive/80"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleAssignToProject}
                    >
                      Assign to Project
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Project Selector (when no project selected) */}
        {!selectedProject && activeProjects.length > 0 && (
          <Card className="bg-accent border-border elevation-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-foreground mb-2">Select a Project</h3>
                <p className="text-accent-foreground mb-4">
                  Choose a project to quickly assign inventory items
                </p>
                <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProjects.map(project => {
                      const projectStaged = isProjectStaged(project);
                      const projectUpcoming = isStagingUpcoming(project.stagingDate);
                      
                      return (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <span>{project.jobName}</span>
                            <span className="text-muted-foreground">
                              - {project.shortAddress}
                            </span>
                            {project.stagingDate && (
                              <span className="text-muted-foreground">
                                ({format(project.stagingDate, "MMM d")})
                              </span>
                            )}
                            {(() => {
                              if (projectStaged) {
                                return <Badge className="bg-primary text-primary-foreground ml-2">Staged</Badge>;
                              } else if (projectUpcoming) {
                                return <Badge className="bg-secondary text-secondary-foreground ml-2">Upcoming</Badge>;
                              }
                              return <Badge className="bg-muted text-muted-foreground ml-2">Pending</Badge>;
                            })()}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Staged Project Mode Toggle */}
        {selectedProjectData && projectIsStaged && (
          <Card className="bg-card border-border elevation-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-foreground mb-1">
                  {isViewingStagedProject ? "Currently Staged Items" : "Add More Inventory"}
                </h4>
                <p className="text-muted-foreground">
                  {isViewingStagedProject 
                    ? `Viewing ${stagedItemIds.length} items staged for ${selectedProjectData.jobName}`
                    : `Select items to add to ${selectedProjectData.jobName}`
                  }
                </p>
              </div>
              <Button
                variant={showAddMoreMode ? "outline" : "default"}
                className={showAddMoreMode ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                onClick={() => setShowAddMoreMode(!showAddMoreMode)}
              >
                {showAddMoreMode ? "View Staged Items" : "Add More Inventory"}
              </Button>
            </div>
          </Card>
        )}

        {/* Upcoming Project Notice */}
        {selectedProjectData && !projectIsStaged && (
          <Card className="bg-accent border-border elevation-sm p-4 mb-6">
            <div className="flex items-start gap-4">
              <CalendarIcon className="w-5 h-5 text-accent-foreground mt-0.5" />
              <div>
                <h4 className="text-foreground mb-1">Staging Upcoming</h4>
                <p className="text-accent-foreground">
                  This project will be staged on {selectedProjectData.stagingDate ? format(selectedProjectData.stagingDate, "MMMM d, yyyy") : "TBD"}.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Sort */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="usageCount">Usage Count</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const status = getStockStatus(item);
              const inCart = cart.find(ci => ci.item.id === item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="bg-card border-border elevation-sm p-4 hover:elevation-md transition-shadow relative"
                  >
                    {/* Quick Add Button - only show when not viewing staged items or in add more mode */}
                    {selectedProject && !isViewingStagedProject && (
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={(e) => handleQuickAdd(item, e)}
                          disabled={item.availableQuantity === 0}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    )}

                    <div 
                      className="cursor-pointer"
                      onClick={() => onNavigate("itemDetail", { item })}
                    >
                      {/* Image */}
                      <div className="w-full h-40 bg-white rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {item.imageUrl ? (
                          <ImageWithFallback
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-foreground mb-1">{item.name}</h4>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge variant={status.variant}>{status.label}</Badge>
                            {inCart && (
                              <Badge className="bg-chart-3 text-white">
                                {inCart.quantity} in cart
                              </Badge>
                            )}
                            {showAddMoreMode && stagedItemIds.includes(item.id) && (
                              <Badge className="bg-secondary text-secondary-foreground">
                                Already Staged
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="w-4 h-4" />
                            <span>
                              {item.inUseQuantity} of {item.totalQuantity} in use
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            <span>{item.usageCount} uses</span>
                          </div>

                          {item.lastUsed && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>
                                Last used {formatDistanceToNow(item.lastUsed, { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border elevation-sm p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            {isViewingStagedProject ? (
              <>
                <h3 className="text-foreground mb-2">No items staged yet</h3>
                <p className="text-muted-foreground mb-6">
                  Click "Add More Inventory" to add items to this project
                </p>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowAddMoreMode(true)}
                >
                  Add More Inventory
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={() => onNavigate("addItem")}>Add New Item</Button>
              </>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  );
}
