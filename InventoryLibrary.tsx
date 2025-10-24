import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Grid3x3,
  List,
  Filter,
  Package,
  MapPin,
  DollarSign,
  Tag as TagIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Input } from "./ui-custom/input";
import { Badge } from "./ui-custom/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AppHeader } from "./AppHeader";
import screenImage from "figma:asset/0d139f55c7ec7b449bb659812e83bc0fd6846324.png";
import deskImage from "figma:asset/d1da7464c1ebcc24a1502c17d6987fa88a4fb5f3.png";
import chairImage from "figma:asset/af97294c1da1ac8535a59452f21be667a162fcff.png";
import floorLampImage from "figma:asset/690d82d765bc87a642e654c45ff62e78d98609e6.png";
import roundTableImage from "figma:asset/f3605307254b8a3a82abb076d58585719cbd4246.png";
import oliveTreeImage from "figma:asset/c47166bb3e07ff395671cb27cc14e05ec42d5841.png";
import beigeChairImage from "figma:asset/bf3e3b2adbbf51a3685ccb430cd7f99f62425330.png";
import juteRugImage from "figma:asset/f5a2d9644fffe5e34bfd23da01cfaaa2b7ee4a7a.png";
import oliveGreenPillowImage from "figma:asset/76b3695f8fd53782b957f65619ca621ff4a6454e.png";
import woodenBedImage from "figma:asset/a76222775f9255aefbcfeeda97001c3a2820fb74.png";
import goldBarCartImage from "figma:asset/7c88476d06e9bfb8e21678c9b9ce829a2c9129da.png";
import diamondJuteRugImage from "figma:asset/2c489e62b99b8b4f0d5e5eca8520aa88995ac72b.png";
import canopyBedImage from "figma:asset/1c9a524adaf9b26f3aa98a6f97f0fdfa9b9f19d5.png";

// Mock inventory data
const mockInventory = [
  {
    id: 2,
    name: "Modern Lounge Chair",
    category: "Furniture",
    image: chairImage,
    tags: ["Seating", "Lounge", "Office", "Premium"],
    status: "in-use" as const,
    location: "Warehouse B - Section 3",
    purchaseCost: 320.0,
    roi: 1950.0,
    utilizationRate: 72,
    roomType: "Lounge Area",
  },
  {
    id: 3,
    name: "Professional Display Screen",
    category: "Electronics",
    image: screenImage,
    tags: ["Display", "AV", "Rental", "Premium"],
    status: "available" as const,
    location: "Warehouse A - Zone 5",
    purchaseCost: 180.0,
    roi: 1200.0,
    utilizationRate: 68,
    roomType: "Conference Room",
  },
  {
    id: 4,
    name: "Adjustable Workstation",
    category: "Furniture",
    image: deskImage,
    tags: ["Office Furniture", "Workstation", "Professional", "Rental"],
    status: "in-use" as const,
    location: "Equipment Room 2",
    purchaseCost: 890.0,
    roi: 4200.0,
    utilizationRate: 91,
    roomType: "Office Space",
  },
  {
    id: 5,
    name: "Curved Accent Chair",
    category: "Furniture",
    image: beigeChairImage,
    tags: ["Seating", "Accent Chair", "Modern", "Premium"],
    status: "available" as const,
    location: "Warehouse C - Section 4",
    purchaseCost: 380.0,
    roi: 2100.0,
    utilizationRate: 78,
    roomType: "Living Room",
  },
  {
    id: 6,
    name: "Natural Jute Area Rug",
    category: "Decor",
    image: juteRugImage,
    tags: ["Decor", "Rug", "Natural", "Textured"],
    status: "available" as const,
    location: "Warehouse B - Zone 2",
    purchaseCost: 220.0,
    roi: 1350.0,
    utilizationRate: 73,
    roomType: "Living Room",
  },
  {
    id: 7,
    name: "Olive Velvet Throw Pillow",
    category: "Decor",
    image: oliveGreenPillowImage,
    tags: ["Decor", "Pillow", "Velvet", "Accent"],
    status: "available" as const,
    location: "Warehouse A - Shelf 8",
    purchaseCost: 45.0,
    roi: 280.0,
    utilizationRate: 62,
    roomType: "Bedroom",
  },
  {
    id: 8,
    name: "Natural Oak Platform Bed",
    category: "Furniture",
    image: woodenBedImage,
    tags: ["Furniture", "Bed", "Wood", "Platform"],
    status: "in-use" as const,
    location: "Warehouse A - Zone 1",
    purchaseCost: 680.0,
    roi: 3200.0,
    utilizationRate: 81,
    roomType: "Bedroom",
  },
  {
    id: 9,
    name: "Brass Bar Cart",
    category: "Furniture",
    image: goldBarCartImage,
    tags: ["Furniture", "Bar Cart", "Brass", "Entertaining"],
    status: "available" as const,
    location: "Warehouse C - Section 1",
    purchaseCost: 280.0,
    roi: 1400.0,
    utilizationRate: 64,
    roomType: "Dining Room",
  },
  {
    id: 10,
    name: "Contemporary Round Table",
    category: "Furniture",
    image: roundTableImage,
    tags: ["Dining room", "Round table", "Modern", "Chic"],
    status: "available" as const,
    location: "Warehouse B - Zone 7",
    purchaseCost: 540.0,
    roi: 2600.0,
    utilizationRate: 71,
    roomType: "Dining Room",
  },
  {
    id: 11,
    name: "Diamond Weave Jute Rug",
    category: "Decor",
    image: diamondJuteRugImage,
    tags: ["Decor", "Rug", "Natural", "Diamond Pattern"],
    status: "available" as const,
    location: "Warehouse A - Shelf 3",
    purchaseCost: 195.0,
    roi: 890.0,
    utilizationRate: 76,
    roomType: "Living Room",
  },
  {
    id: 12,
    name: "Modern Gold Floor Lamp",
    category: "Lighting",
    image: floorLampImage,
    tags: ["Lighting", "Modern", "Gold", "Floor Lamp"],
    status: "available" as const,
    location: "Warehouse C - Section 5",
    purchaseCost: 280.0,
    roi: 1400.0,
    utilizationRate: 64,
    roomType: "Living Room",
  },
  {
    id: 13,
    name: "Decorative Olive Tree",
    category: "Decor",
    image: oliveTreeImage,
    tags: ["Decor", "Plant", "Natural", "Greenery"],
    status: "available" as const,
    location: "Warehouse A - Shelf 15",
    purchaseCost: 195.0,
    roi: 890.0,
    utilizationRate: 58,
    roomType: "Reception Area",
  },
  {
    id: 14,
    name: "Four-Poster Canopy Bed",
    category: "Furniture",
    image: canopyBedImage,
    tags: ["Furniture", "Bed", "Canopy", "Luxury", "Premium"],
    status: "available" as const,
    location: "Warehouse A - Zone 2",
    purchaseCost: 1250.0,
    roi: 5800.0,
    utilizationRate: 85,
    roomType: "Bedroom",
  },
];

type ViewMode = "grid" | "list";
type FilterType = "all" | "available" | "in-use" | "maintenance";
type RoomType = "all" | string;
type ROIRange = "all" | "low" | "medium" | "high";

interface InventoryLibraryProps {
  userName: string;
  businessName: string;
  onBack: () => void;
  onViewDetails: (itemId: number) => void;
  onNavigate?: (page: "dashboard" | "library" | "reports") => void;
}

export function InventoryLibrary({ userName, businessName, onBack, onViewDetails, onNavigate }: InventoryLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomType>("all");
  const [roiFilter, setROIFilter] = useState<ROIRange>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Get unique room types
  const roomTypes = useMemo(() => {
    const types = new Set(mockInventory.map((item) => item.roomType));
    return ["all", ...Array.from(types)];
  }, []);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    return mockInventory.filter((item) => {
      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Status filter
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Room type filter
      const matchesRoomType =
        roomTypeFilter === "all" || item.roomType === roomTypeFilter;

      // ROI filter
      let matchesROI = true;
      if (roiFilter === "low") matchesROI = item.roi < 2000;
      else if (roiFilter === "medium")
        matchesROI = item.roi >= 2000 && item.roi < 5000;
      else if (roiFilter === "high") matchesROI = item.roi >= 5000;

      return matchesSearch && matchesStatus && matchesRoomType && matchesROI;
    });
  }, [searchQuery, statusFilter, roomTypeFilter, roiFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-primary/10 text-primary";
      case "in-use":
        return "bg-chart-3/20 text-chart-5";
      case "maintenance":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return CheckCircle2;
      case "in-use":
        return Package;
      case "maintenance":
        return AlertCircle;
      default:
        return Package;
    }
  };

  const handleNavigate = (page: "dashboard" | "library" | "reports") => {
    if (onNavigate) {
      onNavigate(page);
    } else if (page === "dashboard") {
      onBack();
    }
  };

  return (
    <div className="size-full bg-background overflow-auto">
      {/* Header */}
      <AppHeader
        userName={userName}
        businessName={businessName}
        currentPage="library"
        onNavigate={handleNavigate}
      />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Title and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h2 className="mb-1">Inventory Library</h2>
            <p className="text-muted-foreground">
              Browse and manage your inventory items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items by name or tag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <Card className="p-4">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filters</span>
              </div>
              {isFiltersOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            <AnimatePresence>
              {isFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 mt-4">
                    {/* Availability Filter */}
                    <div>
                      <p className="text-muted-foreground mb-2">Availability</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={statusFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatusFilter("all")}
                        >
                          All Items
                        </Button>
                        <Button
                          variant={statusFilter === "available" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatusFilter("available")}
                        >
                          Available
                        </Button>
                        <Button
                          variant={statusFilter === "in-use" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatusFilter("in-use")}
                        >
                          In Use
                        </Button>
                        <Button
                          variant={statusFilter === "maintenance" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatusFilter("maintenance")}
                        >
                          Maintenance
                        </Button>
                      </div>
                    </div>

                    {/* Room Type Filter */}
                    <div>
                      <p className="text-muted-foreground mb-2">Room Type</p>
                      <div className="flex flex-wrap gap-2">
                        {roomTypes.map((type) => (
                          <Button
                            key={type}
                            variant={roomTypeFilter === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRoomTypeFilter(type)}
                          >
                            {type === "all" ? "All Types" : type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* ROI Range Filter */}
                    <div>
                      <p className="text-muted-foreground mb-2">ROI Range</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={roiFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setROIFilter("all")}
                        >
                          All ROI
                        </Button>
                        <Button
                          variant={roiFilter === "low" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setROIFilter("low")}
                        >
                          &lt; $2,000
                        </Button>
                        <Button
                          variant={roiFilter === "medium" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setROIFilter("medium")}
                        >
                          $2,000 - $5,000
                        </Button>
                        <Button
                          variant={roiFilter === "high" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setROIFilter("high")}
                        >
                          &gt; $5,000
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <p className="text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
          </p>
        </motion.div>

        {/* Inventory Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredItems.map((item, index) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="relative aspect-video bg-muted">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(item.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-3 flex-1 flex flex-col">
                        <div className="min-h-[3rem]">
                          <h4 className="mb-1 line-clamp-1">{item.name}</h4>
                          <p className="text-muted-foreground">{item.category}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 min-h-[2rem]">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-accent text-accent-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="bg-muted">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4 shrink-0" />
                            <span>ROI: ${item.roi.toLocaleString()}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full gap-2 mt-auto"
                          onClick={() => onViewDetails(item.id)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {filteredItems.map((item, index) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-[180px]">
                      <div className="flex gap-4 p-4 h-full">
                        <div className="relative w-40 h-full flex-shrink-0 rounded-[var(--radius)] overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="mb-1 truncate">{item.name}</h4>
                              <p className="text-muted-foreground">{item.category}</p>
                            </div>
                            <Badge className={`${getStatusColor(item.status)} shrink-0`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {item.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 4).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-accent text-accent-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 4 && (
                              <Badge variant="outline" className="bg-muted">
                                +{item.tags.length - 4}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="w-4 h-4 shrink-0" />
                              <span>ROI: ${item.roi.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TagIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.roomType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Package className="w-4 h-4 shrink-0" />
                              <span>{item.utilizationRate}% utilized</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <Button onClick={() => onViewDetails(item.id)} className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setRoomTypeFilter("all");
                    setROIFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
