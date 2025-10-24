import { useState, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Package, 
  CheckCircle2, 
  DollarSign, 
  Activity,
  Plus,
  FolderPlus,
  TrendingUp,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Ban
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Badge } from "./ui-custom/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui-custom/dialog";
import { Label } from "./ui-custom/label";
import { Input } from "./ui-custom/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui-custom/popover";
import { Calendar as CalendarComponent } from "./ui-custom/calendar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AppHeader } from "./AppHeader";
import { toast } from "sonner@2.0.3";
import screenImage from "figma:asset/0d139f55c7ec7b449bb659812e83bc0fd6846324.png";
import deskImage from "figma:asset/d1da7464c1ebcc24a1502c17d6987fa88a4fb5f3.png";
import chairImage from "figma:asset/af97294c1da1ac8535a59452f21be667a162fcff.png";
import roundTableImage from "figma:asset/f3605307254b8a3a82abb076d58585719cbd4246.png";
import beigeChairImage from "figma:asset/bf3e3b2adbbf51a3685ccb430cd7f99f62425330.png";
import juteRugImage from "figma:asset/f5a2d9644fffe5e34bfd23da01cfaaa2b7ee4a7a.png";
import oliveGreenPillowImage from "figma:asset/76b3695f8fd53782b957f65619ca621ff4a6454e.png";
import woodenBedImage from "figma:asset/a76222775f9255aefbcfeeda97001c3a2820fb74.png";
import goldBarCartImage from "figma:asset/7c88476d06e9bfb8e21678c9b9ce829a2c9129da.png";
import diamondJuteRugImage from "figma:asset/2c489e62b99b8b4f0d5e5eca8520aa88995ac72b.png";

// All inventory items with quantity tracking
const allInventoryItems = [
  {
    id: 2,
    name: "Modern Lounge Chair",
    image: chairImage,
    usageCount: 38,
    category: "Furniture",
    totalQuantity: 8,
    inUseQuantity: 8,
    availableQuantity: 0, // All in use - disabled
  },
  {
    id: 3,
    name: "Professional Display Screen",
    image: screenImage,
    usageCount: 32,
    category: "Electronics",
    totalQuantity: 12,
    inUseQuantity: 7,
    availableQuantity: 5,
  },
  {
    id: 4,
    name: "Adjustable Workstation",
    image: deskImage,
    usageCount: 28,
    category: "Furniture",
    totalQuantity: 6,
    inUseQuantity: 5,
    availableQuantity: 1, // Low stock
  },
  {
    id: 5,
    name: "Curved Accent Chair",
    image: beigeChairImage,
    usageCount: 42,
    category: "Furniture",
    totalQuantity: 15,
    inUseQuantity: 12,
    availableQuantity: 3, // Low stock
  },
  {
    id: 6,
    name: "Natural Jute Area Rug",
    image: juteRugImage,
    usageCount: 35,
    category: "Decor",
    totalQuantity: 10,
    inUseQuantity: 10,
    availableQuantity: 0, // All in use - disabled
  },
  {
    id: 7,
    name: "Olive Velvet Throw Pillow",
    image: oliveGreenPillowImage,
    usageCount: 28,
    category: "Decor",
    totalQuantity: 25,
    inUseQuantity: 8,
    availableQuantity: 17,
  },
  {
    id: 8,
    name: "Natural Oak Platform Bed",
    image: woodenBedImage,
    usageCount: 31,
    category: "Furniture",
    totalQuantity: 9,
    inUseQuantity: 6,
    availableQuantity: 3, // Low stock
  },
  {
    id: 9,
    name: "Brass Bar Cart",
    image: goldBarCartImage,
    usageCount: 26,
    category: "Furniture",
    totalQuantity: 14,
    inUseQuantity: 3,
    availableQuantity: 11,
  },
  {
    id: 10,
    name: "Contemporary Round Table",
    image: roundTableImage,
    usageCount: 35,
    category: "Furniture",
    totalQuantity: 7,
    inUseQuantity: 7,
    availableQuantity: 0, // All in use - disabled
  },
  {
    id: 11,
    name: "Diamond Weave Jute Rug",
    image: diamondJuteRugImage,
    usageCount: 33,
    category: "Decor",
    totalQuantity: 18,
    inUseQuantity: 10,
    availableQuantity: 8,
  },
];

// Mock data for top items
const topItems = allInventoryItems
  .sort((a, b) => b.usageCount - a.usageCount)
  .slice(0, 5);

// Initial projects data
const initialProjects = [
  {
    id: 1,
    clientName: "Lauren Ann",
    propertyName: "Pine crest",
    address: "1004 Pine Crest Ave, Issaquah",
    status: "staged" as const,
    stagedDate: new Date("2025-10-15"),
    contractEndDate: new Date("2025-11-15"),
    inventoryItems: [5, 6, 7, 8, 10, 11], // Using item IDs
  },
  {
    id: 2,
    clientName: "Madison Donaldson",
    propertyName: "Old Creek rd",
    address: "3315 Old Creek Rd, Gilroy",
    status: "staged" as const,
    stagedDate: new Date("2025-10-05"),
    contractEndDate: new Date("2025-11-05"),
    inventoryItems: [2, 3, 6, 7, 9, 11],
  },
  {
    id: 3,
    clientName: "Julian Lee",
    propertyName: "Pine Lake rd",
    address: "1515 Pine Lake Rd, Sammamish, WA",
    status: "staged" as const,
    stagedDate: new Date("2025-10-10"),
    contractEndDate: new Date("2025-11-10"),
    inventoryItems: [2, 5, 8, 9, 10, 7],
  },
];

// Calculate days remaining or days until staging
const calculateDays = (project: typeof initialProjects[0]) => {
  const today = new Date("2025-10-23"); // Current date
  
  if (project.status === "staged") {
    // Calculate days remaining in contract
    const timeDiff = project.contractEndDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return {
      days: Math.abs(daysRemaining),
      label: daysRemaining > 0 ? "days left" : "days overdue",
      isOverdue: daysRemaining < 0,
    };
  } else {
    // Calculate days until staging
    const timeDiff = project.stagedDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return {
      days: Math.abs(daysUntil),
      label: daysUntil > 0 ? "days until staging" : "days late",
      isOverdue: daysUntil < 0,
    };
  }
};

const getKpiCards = (onViewLibrary?: () => void, onViewReports?: () => void) => [
  {
    title: "Total Items",
    value: "348",
    icon: Package,
    color: "text-primary",
    bgColor: "bg-accent",
    onClick: onViewLibrary,
  },
  {
    title: "Items in Use",
    value: "127",
    icon: CheckCircle2,
    color: "text-primary",
    bgColor: "bg-accent",
    onClick: onViewLibrary,
  },
  {
    title: "ROI Summary",
    value: "$12,450",
    icon: DollarSign,
    color: "text-primary",
    bgColor: "bg-accent",
    onClick: onViewReports,
  },
  {
    title: "Avg. Utilization",
    value: "68%",
    icon: Activity,
    color: "text-primary",
    bgColor: "bg-accent",
    onClick: onViewReports,
  },
];

interface DashboardProps {
  userName: string;
  businessName: string;
  onAddItem: () => void;
  onViewLibrary?: () => void;
  onAssignToJob?: () => void;
  onViewReports?: (itemId?: number) => void;
  onNavigate?: (page: "dashboard" | "library" | "reports") => void;
}

export function Dashboard({ userName, businessName, onAddItem, onViewLibrary, onAssignToJob, onViewReports, onNavigate }: DashboardProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");
  const [stagingDate, setStagingDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCreateProject = () => {
    if (!newProjectName || !newProjectLocation || !stagingDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Create new project
    const newProject = {
      id: projects.length + 1,
      clientName: newProjectName,
      propertyName: newProjectLocation,
      address: newProjectLocation,
      status: "upcoming" as const,
      stagedDate: stagingDate,
      contractEndDate: new Date(stagingDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      inventoryItems: [],
    };

    setProjects([...projects, newProject]);
    toast.success(`Project "${newProjectName}" created successfully!`);
    
    // Reset form
    setNewProjectName("");
    setNewProjectLocation("");
    setStagingDate(undefined);
    setIsCreateProjectOpen(false);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 280; // Card width + gap
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Sort projects: upcoming first, then by date
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      // First, sort by status - upcoming projects come first
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      
      // Then sort by staging date based on sort order
      const dateA = a.stagedDate.getTime();
      const dateB = b.stagedDate.getTime();
      
      if (sortOrder === 'asc') {
        return dateA - dateB; // Earliest first
      } else {
        return dateB - dateA; // Latest first
      }
    });
  }, [projects, sortOrder]);

  // Count projects by status
  const upcomingCount = projects.filter(p => p.status === 'upcoming').length;
  const stagedCount = projects.filter(p => p.status === 'staged').length;

  const kpiCards = getKpiCards(onViewLibrary, onViewReports);

  const handleNavigate = (page: "dashboard" | "library" | "reports") => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Fallback to individual handlers
      if (page === "library" && onViewLibrary) onViewLibrary();
      if (page === "reports" && onViewReports) onViewReports();
    }
  };

  return (
    <div className="size-full bg-background overflow-auto">
      {/* Header */}
      <AppHeader
        userName={userName}
        businessName={businessName}
        currentPage="dashboard"
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2">Welcome back, {userName.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your inventory today.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              onClick={kpi.onClick}
              className="cursor-pointer"
            >
              <Card className="p-6 hover:elevation-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-[var(--radius)]`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-1">{kpi.title}</p>
                <h2>{kpi.value}</h2>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <h3 className="mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onAddItem}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsCreateProjectOpen(true)}
              className="gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Project
            </Button>
            {onViewLibrary && (
              <Button
                size="lg"
                variant="outline"
                onClick={onViewLibrary}
                className="gap-2"
              >
                <Package className="w-4 h-4" />
                View Library
              </Button>
            )}
            {onAssignToJob && (
              <Button
                size="lg"
                variant="outline"
                onClick={onAssignToJob}
                className="gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Assign to Job
              </Button>
            )}
          </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3>Active Projects</h3>
                <div className="flex items-center gap-2">
                  {upcomingCount > 0 && (
                    <div className="px-2 py-1 rounded-[var(--radius-sm)] bg-chart-3/10 text-chart-3">
                      <span>{upcomingCount} upcoming</span>
                    </div>
                  )}
                  {stagedCount > 0 && (
                    <div className="px-2 py-1 rounded-[var(--radius-sm)] bg-primary/10 text-primary">
                      <span>{stagedCount} staged</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                Current staging projects and timelines
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="gap-2"
            >
              {sortOrder === 'asc' ? (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Earliest First
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4" />
                  Latest First
                </>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProjects.map((project, index) => {
              const dayInfo = calculateDays(project);
              const projectInventory = allInventoryItems.filter(item => 
                project.inventoryItems.includes(item.id)
              );
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <Card className="p-6 hover:elevation-sm transition-shadow cursor-pointer">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="mb-1">{project.clientName}</h4>
                          <p className="text-muted-foreground">
                            {project.propertyName}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-[var(--radius)] ${
                          project.status === "staged" 
                            ? "bg-primary/10 text-primary" 
                            : project.status === "upcoming"
                            ? "bg-chart-3/10 text-chart-3"
                            : "bg-accent text-foreground"
                        }`}>
                          <p className="capitalize">{project.status}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">
                          {project.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Staged: {project.stagedDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-[var(--radius)] mb-4 ${
                        dayInfo.isOverdue 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-accent text-foreground"
                      }`}>
                        <Clock className="w-4 h-4" />
                        <p>
                          <span className="mr-1">{dayInfo.days}</span>
                          {dayInfo.label}
                        </p>
                      </div>

                      {/* Inventory Items */}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-muted-foreground">
                            Inventory ({projectInventory.length} items)
                          </p>
                        </div>
                        {projectInventory.length === 0 ? (
                          <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-[var(--radius)]">
                            <p className="text-muted-foreground">
                              No items assigned yet
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {projectInventory.slice(0, 4).map((item) => (
                              <div 
                                key={item.id}
                                className="w-14 h-14 rounded-[var(--radius)] overflow-hidden bg-muted border border-border"
                              >
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {projectInventory.length > 4 && (
                              <div className="w-14 h-14 rounded-[var(--radius)] bg-accent border border-border flex items-center justify-center">
                                <p className="text-muted-foreground">
                                  +{projectInventory.length - 4}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Top 5 Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="mb-1">Most Used Items</h3>
              <p className="text-muted-foreground">
                Your top performing inventory items
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCarousel('left')}
                className="h-10 w-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCarousel('right')}
                className="h-10 w-10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topItems.map((item, index) => {
              const isLowStock = item.availableQuantity > 0 && item.availableQuantity <= 3;
              const isOutOfStock = item.availableQuantity === 0;
              
              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 h-[320px]"
              >
                <Card 
                  className={`w-64 h-full overflow-hidden hover:elevation-sm transition-shadow cursor-pointer flex flex-col ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                  onClick={() => onViewReports?.(item.id)}
                >
                  <div className="relative h-48 bg-muted flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-[var(--radius)] flex items-center gap-2">
                          <Ban className="w-4 h-4 text-destructive" />
                          <p className="text-destructive">All In Use</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-[var(--radius)]">
                      <p className="text-muted-foreground">
                        {item.usageCount} uses
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="line-clamp-2 mb-3">{item.name}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Available:</p>
                        <p className={isOutOfStock ? 'text-destructive' : isLowStock ? 'text-accent-foreground' : ''}>
                          {item.availableQuantity} / {item.totalQuantity}
                        </p>
                      </div>
                      
                      {isOutOfStock ? (
                        <Badge className="w-full bg-destructive/10 text-destructive border-destructive/20 justify-center">
                          <Ban className="w-3 h-3 mr-1" />
                          All In Use
                        </Badge>
                      ) : isLowStock ? (
                        <Badge className="w-full bg-accent text-accent-foreground border-accent-foreground/20 justify-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Card className="p-6 bg-accent border-border">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-[var(--radius)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Inventory Insights</h3>
                <p className="text-muted-foreground mb-4">
                  You used <span className="text-foreground">35% more décor items</span> this month 
                  compared to last month. Your event furniture is seeing high demand - consider 
                  expanding your inventory.
                </p>
                <Button variant="outline" size="sm" onClick={() => onViewReports?.()}>
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new staging project with client and property details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter client or property name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter property address"
                value={newProjectLocation}
                onChange={(e) => setNewProjectLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Staging Request Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {stagingDate ? (
                      stagingDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })
                    ) : (
                      <span className="text-muted-foreground">Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={stagingDate}
                    onSelect={(date) => {
                      setStagingDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateProjectOpen(false);
                setNewProjectName("");
                setNewProjectLocation("");
                setStagingDate(undefined);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
