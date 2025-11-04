import { useState } from "react";
import { motion } from "motion/react";
import { LayoutGrid, List, MapPin, Calendar, User, Package } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { mockJobAssignments } from "../mockData";
import { format } from "date-fns";

interface InUseProps {
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
}

export function InUse({ items, onNavigate }: InUseProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Filter items that are in use
  const inUseItems = items.filter((item) => item.inUseQuantity > 0);

  // Get job assignments for an item
  const getItemJobs = (itemId: string): JobAssignment[] => {
    return mockJobAssignments.filter(
      (job) => job.itemId === itemId && job.status === "active"
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-foreground mb-2">Items in Use</h1>
          <p className="text-muted-foreground">
            {inUseItems.length} item{inUseItems.length !== 1 ? "s" : ""} currently deployed
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inUseItems.map((item, index) => {
            const jobs = getItemJobs(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card border-border elevation-sm overflow-hidden hover:elevation-md transition-shadow cursor-pointer">
                  <div onClick={() => onNavigate("itemDetail", { item })}>
                    {/* Image */}
                    <div className="aspect-square bg-white flex items-center justify-center p-6">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-muted" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-foreground">{item.name}</h3>
                        <Badge className="bg-chart-2 text-secondary-foreground shrink-0">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Usage Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {item.inUseQuantity} of {item.totalQuantity} in use
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground">{item.location}</p>
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
                                  <p className="text-foreground truncate">{job.jobName}</p>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-muted-foreground">Item</th>
                  <th className="px-6 py-4 text-left text-muted-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-muted-foreground">Location</th>
                  <th className="px-6 py-4 text-left text-muted-foreground">In Use</th>
                  <th className="px-6 py-4 text-left text-muted-foreground">Utilization</th>
                  <th className="px-6 py-4 text-left text-muted-foreground">Active Jobs</th>
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
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onNavigate("itemDetail", { item })}
                    >
                      {/* Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-muted" />
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
                          <p className="text-foreground">{item.location}</p>
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
                                  <p className="text-foreground">{job.jobName}</p>
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
