import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Package,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AppState, InventoryItem } from "../types";
import { mockUsageHistory } from "../mockData";

interface ItemDetailProps {
  item: InventoryItem;
  onNavigate: (state: AppState, data?: any) => void;
  onDelete: (itemId: string) => void;
}

export function ItemDetail({ item, onNavigate, onDelete }: ItemDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const usageHistory = mockUsageHistory.filter((h) => h.itemId === item.id);

  // Mock analytics data
  const analyticsData = [
    { month: "Jan", uses: 5 },
    { month: "Feb", uses: 8 },
    { month: "Mar", uses: 12 },
    { month: "Apr", uses: 10 },
    { month: "May", uses: 15 },
    { month: "Jun", uses: 18 },
  ];

  const handleDelete = () => {
    onDelete(item.id);
    toast.success("Item deleted successfully");
    onNavigate("library");
  };

  const getStockStatus = () => {
    if (item.availableQuantity === 0) {
      return { label: "All in Use", variant: "destructive" as const };
    }
    if (item.availableQuantity <= 3) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    return { label: "Available", variant: "default" as const };
  };

  const status = getStockStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <button
            onClick={() => onNavigate("library")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </button>

          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image */}
            <div className="w-full h-96 bg-white rounded-lg flex items-center justify-center p-8">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-24 h-24 text-muted-foreground" />
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-foreground mb-3">{item.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{item.category}</Badge>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted border-0 p-4">
                  <p className="text-muted-foreground mb-1">Total Uses</p>
                  <h3 className="text-foreground">{item.usageCount}</h3>
                </Card>
                <Card className="bg-muted border-0 p-4">
                  <p className="text-muted-foreground mb-1">In Use</p>
                  <h3 className="text-foreground">
                    {item.inUseQuantity} of {item.totalQuantity}
                  </h3>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate("assignToJob", { item })}
                  className="flex-1"
                  disabled={item.availableQuantity === 0}
                >
                  Assign to Job
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-foreground mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Item Name</p>
                      <p className="text-foreground">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Category</p>
                      <p className="text-foreground">{item.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Item ID</p>
                      <p className="text-foreground">{item.id}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-foreground mb-4">Quantity Tracking</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Total Quantity</p>
                      <p className="text-foreground">{item.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">In Use</p>
                      <p className="text-foreground">{item.inUseQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Available</p>
                      <p className="text-foreground">{item.availableQuantity}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-foreground mb-4">Location & Cost</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground mb-1">Location</p>
                        <p className="text-foreground">{item.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground mb-1">Purchase Cost</p>
                        <p className="text-foreground">${item.purchaseCost}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground mb-1">Date Added</p>
                        <p className="text-foreground">
                          {format(item.dateAdded, "PP")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-foreground mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-card border-border elevation-sm p-6">
                <h3 className="text-foreground mb-6">Usage History</h3>
                <div className="space-y-4">
                  {usageHistory.length > 0 ? (
                    usageHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex gap-4 p-4 bg-muted rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-foreground mb-1">
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                          </h4>
                          {entry.jobName && (
                            <p className="text-foreground mb-1">{entry.jobName}</p>
                          )}
                          <p className="text-muted-foreground">
                            by {entry.user} • {format(entry.date, "PP")}
                          </p>
                          {entry.quantity && (
                            <p className="text-muted-foreground">
                              Quantity: {entry.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No history available</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-foreground mb-6">Usage Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uses"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-card border-border elevation-sm p-6">
                    <TrendingUp className="w-8 h-8 text-chart-1 mb-3" />
                    <h4 className="text-foreground mb-1">Avg. Days in Use</h4>
                    <h3 className="text-foreground">14 days</h3>
                  </Card>

                  <Card className="bg-card border-border elevation-sm p-6">
                    <DollarSign className="w-8 h-8 text-chart-3 mb-3" />
                    <h4 className="text-foreground mb-1">Revenue Generated</h4>
                    <h3 className="text-foreground">
                      ${Math.round(item.usageCount * item.purchaseCost * 0.1).toLocaleString()}
                    </h3>
                  </Card>

                  <Card className="bg-card border-border elevation-sm p-6">
                    <Package className="w-8 h-8 text-chart-4 mb-3" />
                    <h4 className="text-foreground mb-1">Utilization Rate</h4>
                    <h3 className="text-foreground">
                      {Math.round((item.inUseQuantity / item.totalQuantity) * 100)}%
                    </h3>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
