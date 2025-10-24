import { motion } from "motion/react";
import {
  ArrowLeft,
  Package,
  MapPin,
  DollarSign,
  Tag as TagIcon,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Briefcase,
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Badge } from "./ui-custom/badge";
import { Progress } from "./ui-custom/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";
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

interface ItemDetailProps {
  itemId: number;
  onBack: () => void;
  onEdit?: (itemId: number) => void;
  onDelete?: (itemId: number) => void;
  onAssignToJob?: (itemId: number) => void;
}

// This would normally fetch from a database/API
const getItemById = (id: number) => {
  const items = [
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
      description: "Modern lounge chair with premium upholstery and ergonomic design. Ideal for waiting areas, lounges, and professional office spaces.",
      dateAdded: "2024-02-10",
      totalRentals: 38,
      monthlyRevenue: 280.0,
      nextAvailableDate: "November 15, 2025",
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
      description: "High-quality professional display screen perfect for presentations, video conferencing, and digital signage.",
      dateAdded: "2024-03-05",
      totalRentals: 32,
      monthlyRevenue: 220.0,
      nextAvailableDate: "Available Now",
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
      description: "Versatile adjustable workstation with premium build quality. Perfect for flexible office environments and co-working spaces.",
      dateAdded: "2024-03-20",
      totalRentals: 28,
      monthlyRevenue: 390.0,
      nextAvailableDate: "November 20, 2025",
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
      description: "Elegant curved accent chair with neutral upholstery. Perfect for living rooms, bedrooms, and sophisticated staging projects.",
      dateAdded: "2024-04-05",
      totalRentals: 42,
      monthlyRevenue: 295.0,
      nextAvailableDate: "Available Now",
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
      description: "Natural woven jute area rug with textured finish. Adds warmth and organic texture to any space.",
      dateAdded: "2024-04-15",
      totalRentals: 35,
      monthlyRevenue: 165.0,
      nextAvailableDate: "Available Now",
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
      description: "Luxurious velvet throw pillow in rich olive green. Perfect for adding color and texture to sofas, beds, and accent chairs.",
      dateAdded: "2024-05-01",
      totalRentals: 28,
      monthlyRevenue: 42.0,
      nextAvailableDate: "Available Now",
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
      description: "Beautiful natural oak platform bed with clean lines and modern design. Perfect for staging bedrooms in residential properties.",
      dateAdded: "2024-05-10",
      totalRentals: 31,
      monthlyRevenue: 385.0,
      nextAvailableDate: "November 25, 2025",
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
      description: "Elegant brass bar cart with glass shelves. Perfect for entertaining spaces, dining rooms, and sophisticated staging projects.",
      dateAdded: "2024-05-20",
      totalRentals: 26,
      monthlyRevenue: 185.0,
      nextAvailableDate: "Available Now",
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
      description: "Modern round table with sleek black finish and dual-tier design. Perfect for dining rooms, meeting spaces, and contemporary interiors.",
      dateAdded: "2024-05-08",
      totalRentals: 35,
      monthlyRevenue: 310.0,
      nextAvailableDate: "Available Now",
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
      description: "Natural jute rug with diamond weave pattern. Adds texture and visual interest to living rooms, bedrooms, and entryways.",
      dateAdded: "2024-06-01",
      totalRentals: 33,
      monthlyRevenue: 148.0,
      nextAvailableDate: "Available Now",
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
      description: "Sleek modern floor lamp with adjustable brass finish. Perfect for contemporary living spaces, lounges, and design-forward environments.",
      dateAdded: "2024-04-12",
      totalRentals: 28,
      monthlyRevenue: 185.0,
      nextAvailableDate: "Available Now",
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
      description: "Realistic decorative olive tree in black pot. Adds natural elegance to reception areas, offices, and event spaces without maintenance.",
      dateAdded: "2024-06-20",
      totalRentals: 22,
      monthlyRevenue: 125.0,
      nextAvailableDate: "Available Now",
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
      description: "Stunning four-poster canopy bed with rich wood finish and elegant turned posts. Creates a luxurious focal point in master bedrooms and upscale staging projects.",
      dateAdded: "2024-07-01",
      totalRentals: 18,
      monthlyRevenue: 525.0,
      nextAvailableDate: "Available Now",
    },
  ];
  return items.find((item) => item.id === id) || items[0];
};

export function ItemDetail({ itemId, onBack, onEdit, onDelete, onAssignToJob }: ItemDetailProps) {
  const item = getItemById(itemId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-primary/10 text-primary border-primary/20";
      case "in-use":
        return "bg-chart-3/20 text-chart-5 border-chart-3/20";
      case "maintenance":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
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

  const StatusIcon = getStatusIcon(item.status);

  return (
    <div className="size-full bg-background overflow-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card sticky top-0 z-10"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Inventorly" className="h-8" />
            <h3>Item Details</h3>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(itemId)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(itemId)}
                className="gap-2 text-destructive-foreground hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Image and Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Image */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Basic Info */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="mb-2">{item.name}</h2>
                <p className="text-muted-foreground">{item.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(item.status)} border`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {item.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>

              <p>{item.description}</p>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Room Type</p>
                    <span>{item.roomType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date Added</p>
                    <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-5 h-5 text-muted-foreground" />
                <h3>Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-accent text-accent-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Analytics and Financial Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Financial Overview */}
            <Card className="p-6 space-y-4">
              <h3 className="mb-2">Financial Overview</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Purchase Cost</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>${item.purchaseCost.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Total ROI</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-primary">
                      ${item.roi.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Monthly Revenue</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>${item.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Total Rentals</p>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>{item.totalRentals}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="bg-accent p-4 rounded-[var(--radius)]">
                  <p className="text-muted-foreground mb-1">ROI Percentage</p>
                  <p className="text-primary">
                    {Math.round((item.roi / item.purchaseCost) * 100)}% return
                  </p>
                </div>
              </div>
            </Card>

            {/* Utilization */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <h3>Utilization Rate</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Rate</span>
                  <span>{item.utilizationRate}%</span>
                </div>
                <Progress value={item.utilizationRate} className="h-2" />
                <p className="text-muted-foreground">
                  {item.utilizationRate >= 80
                    ? "High demand - performing excellently"
                    : item.utilizationRate >= 60
                    ? "Good utilization - steady performance"
                    : "Low utilization - consider promotion"}
                </p>
              </div>
            </Card>

            {/* Availability */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3>Availability</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1">Current Status</p>
                  <Badge className={getStatusColor(item.status)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {item.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Next Available</p>
                  <span>{item.nextAvailableDate}</span>
                </div>
              </div>

              {item.status === "available" && onAssignToJob && (
                <Button className="w-full gap-2" onClick={() => onAssignToJob(itemId)}>
                  <Briefcase className="w-4 h-4" />
                  Assign to Job
                </Button>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 space-y-3">
              <h3 className="mb-2">Quick Actions</h3>

              <Button variant="outline" className="w-full gap-2">
                <TrendingUp className="w-4 h-4" />
                View Usage History
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <Calendar className="w-4 h-4" />
                View Rental Schedule
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <DollarSign className="w-4 h-4" />
                View Financial Report
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
