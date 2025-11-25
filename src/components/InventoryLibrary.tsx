import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, MapPin, Activity, Clock, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { formatDistanceToNow } from "date-fns";
import { AIAssistant } from "./AIAssistant";
import { getItemLocation, getAccurateItemQuantities } from "../utils/projectUtils";

interface InventoryLibraryProps {
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  initialFilter?: string;
  jobAssignments: JobAssignment[];
}

export function InventoryLibrary({ items, onNavigate, initialFilter = "all", jobAssignments }: InventoryLibraryProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState("name");

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const getStockStatus = (item: InventoryItem & { availableQuantity?: number }) => {
    const availableQty = item.availableQuantity ?? item.totalQuantity - item.inUseQuantity;
    if (availableQty === 0) {
      return { label: "All in Use", variant: "destructive" as const, filter: "inUse" };
    }
    if (availableQty <= 3) {
      return { label: "Low Stock", variant: "secondary" as const, filter: "lowStock" };
    }
    return { label: "Available", variant: "default" as const, filter: "available" };
  };

  const filteredItems = items
    .map(item => {
      const activeProjects = jobAssignments.filter(job => job.status === "active");
      const accurateQuantities = getAccurateItemQuantities(item, activeProjects);
      return { ...item, ...accurateQuantities };
    })
    .filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const status = getStockStatus(item);
      const matchesStatus =
        statusFilter === "all" || status.filter === statusFilter;

      return matchesCategory && matchesStatus;
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


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => onNavigate("dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground leading-snug">Inventory Library</h2>
                </div>
                
        {/* AI Assistant as Search */}
        <div className="mb-6">
          <AIAssistant 
            jobAssignments={jobAssignments}
            items={items}
            onNavigate={onNavigate}
          />
        </div>

        {/* Sort */}
        <div className="flex gap-4 mb-6 sm:mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item, index) => {
              const activeProjects = jobAssignments.filter(job => job.status === "active");
              const status = getStockStatus(item);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="bg-card border-border elevation-sm p-4 sm:p-6 hover:elevation-md transition-shadow touch-manipulation"
                  >

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
                          <Package className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-base font-medium text-foreground mb-1 leading-normal">{item.name}</h4>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="w-4 h-4 shrink-0" />
                            <span>
                              {item.inUseQuantity} of {item.totalQuantity} in use
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span>{getItemLocation(item.id, item.location, activeProjects, item.inUseQuantity, item.totalQuantity)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4 shrink-0" />
                            <span>{item.usageCount} uses</span>
                          </div>

                          {item.lastUsed && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4 shrink-0" />
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
                <h3 className="text-lg font-medium text-foreground mb-2 leading-snug">No items found</h3>
                <p className="text-sm font-normal text-muted-foreground mb-6 leading-relaxed">
                  Try adjusting your search or filters
                </p>
                <Button onClick={() => onNavigate("addItem")}>Add New Item</Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
