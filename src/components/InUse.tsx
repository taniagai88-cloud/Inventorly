import { useState } from "react";
import { motion } from "motion/react";
import { LayoutGrid, List, MapPin, Calendar, User, Package, ArrowLeft } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { mockJobAssignments } from "../mockData";
import { format } from "date-fns";
import { getItemLocation, getAccurateItemQuantities } from "../utils/projectUtils";

interface InUseProps {
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  jobAssignments?: JobAssignment[];
}

export function InUse({ items, onNavigate, jobAssignments = [] }: InUseProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Use provided jobAssignments or fallback to mock data
  const activeJobAssignments = jobAssignments.length > 0 
    ? jobAssignments.filter(job => job.status === "active")
    : mockJobAssignments.filter(job => job.status === "active");

  // Calculate accurate quantities for all items based on project assignments
  const itemsWithAccurateQuantities = items.map(item => {
    const accurateQuantities = getAccurateItemQuantities(item, activeJobAssignments);
    return { ...item, ...accurateQuantities };
  });

  // Filter items that are in use
  const inUseItems = itemsWithAccurateQuantities.filter((item) => item.inUseQuantity > 0);

  // Get job assignments for an item
  const getItemJobs = (itemId: string): JobAssignment[] => {
    return activeJobAssignments.filter(
      (job) => job.itemId === itemId
    );
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 overflow-x-hidden">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-foreground mb-2">Items in Use</h1>
          <p className="text-muted-foreground">
            {inUseItems.length} item{inUseItems.length !== 1 ? "s" : ""} currently deployed
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {inUseItems.map((item, index) => {
            const jobs = getItemJobs(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card border-border elevation-sm overflow-hidden hover:elevation-md transition-shadow cursor-pointer touch-manipulation">
                  <div onClick={() => onNavigate("itemDetail", { item })}>
                    {/* Image */}
                    <div className="aspect-square bg-white flex items-center justify-center p-6">
                      {item.imageUrl ? (
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-muted" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-foreground text-sm sm:text-base">{item.name}</h3>
                        <Badge className="bg-chart-2 text-secondary-foreground shrink-0 text-xs">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Usage Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                          <p className="text-muted-foreground">
                            {item.inUseQuantity} of {item.totalQuantity} in use
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <p className="text-muted-foreground">
                            {getItemLocation(item.id, item.location, activeJobAssignments, item.inUseQuantity, item.totalQuantity)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-2 transition-all"
                            style={{
                              width: `${(item.inUseQuantity / item.totalQuantity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Active Jobs */}
                      {jobs.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-muted-foreground mb-2">Active Jobs:</p>
                          <div className="space-y-2">
                            {jobs.map((job) => (
                              <div key={job.id} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-chart-3 mt-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground truncate">{job.clientName || job.shortAddress || job.jobLocation}</p>
                                  <p className="text-muted-foreground">
                                    {job.quantity} unit{job.quantity !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg overflow-hidden elevation-sm"
        >
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">Item</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">Category</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">Location</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">In Use</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">Utilization</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-muted-foreground text-xs sm:text-sm">Active Jobs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inUseItems.map((item, index) => {
                  const jobs = getItemJobs(item.id);
                  const utilizationPercent = Math.round(
                    (item.inUseQuantity / item.totalQuantity) * 100
                  );

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation"
                      onClick={() => onNavigate("itemDetail", { item })}
                    >
                      {/* Item */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-muted shrink-0" />
                            )}
                          </div>
                          <div>
                            <p className="text-foreground">{item.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <Badge className="bg-chart-2 text-secondary-foreground">
                          {item.category}
                        </Badge>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <p className="text-foreground">
                            {getItemLocation(item.id, item.location, activeJobAssignments, item.inUseQuantity, item.totalQuantity)}
                          </p>
                        </div>
                      </td>

                      {/* In Use */}
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {item.inUseQuantity} / {item.totalQuantity}
                        </p>
                      </td>

                      {/* Utilization */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className="h-full bg-chart-2 transition-all"
                              style={{ width: `${utilizationPercent}%` }}
                            />
                          </div>
                          <p className="text-foreground">{utilizationPercent}%</p>
                        </div>
                      </td>

                      {/* Active Jobs */}
                      <td className="px-6 py-4">
                        {jobs.length > 0 ? (
                          <div className="space-y-1">
                            {jobs.map((job) => (
                              <div key={job.id} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-chart-3 mt-1.5 shrink-0" />
                                <div>
                                  <p className="text-foreground">{job.clientName || job.shortAddress || job.jobLocation}</p>
                                  <p className="text-muted-foreground">
                                    {job.quantity} unit{job.quantity !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">—</p>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {inUseItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Items in Use</h3>
          <p className="text-muted-foreground mb-6">
            All your inventory is currently available
          </p>
          <Button onClick={() => onNavigate("library")}>
            Browse Inventory
          </Button>
        </motion.div>
      )}
    </div>
  );
}
