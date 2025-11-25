import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { mockUsageHistory } from "../mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getItemLocation, getProjectsForItem, getAccurateItemQuantities } from "../utils/projectUtils";

interface ItemDetailProps {
  item: InventoryItem;
  onNavigate: (state: AppState, data?: any) => void;
  onDelete: (itemId: string) => void;
  onUpdateItem?: (item: InventoryItem) => void;
  jobAssignments?: JobAssignment[];
}

export function ItemDetail({ item, onNavigate, onDelete, onUpdateItem, jobAssignments = [] }: ItemDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState<InventoryItem>(item);
  const [isSaving, setIsSaving] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  // Calculate accurate quantities based on project assignments
  const activeProjects = jobAssignments.filter(job => job.status === "active");
  const accurateQuantities = getAccurateItemQuantities(item, activeProjects);
  const displayItem = { ...item, ...accurateQuantities };

  // Update editedItem when item prop changes
  useEffect(() => {
    setEditedItem(item);
    setNewTagValue("");
  }, [item]);

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

  const handleEdit = () => {
    setEditedItem(item);
    setNewTagValue("");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedItem.name || !editedItem.category || !editedItem.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editedItem.totalQuantity < editedItem.inUseQuantity) {
      toast.error("Total quantity cannot be less than items in use");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Recalculate availableQuantity
    const updatedItem: InventoryItem = {
      ...editedItem,
      availableQuantity: editedItem.totalQuantity - editedItem.inUseQuantity,
    };

    if (onUpdateItem) {
      onUpdateItem(updatedItem);
    }

    toast.success("Item updated successfully");
    setIsSaving(false);
    setEditDialogOpen(false);
    
    // Refresh the item detail view
    onNavigate("itemDetail", { item: updatedItem });
  };

  const getStockStatus = () => {
    if (displayItem.availableQuantity === 0) {
      return { label: "All in Use", variant: "destructive" as const };
    }
    if (displayItem.availableQuantity <= 3) {
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
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate("library")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Image */}
            <div className="w-full h-64 sm:h-80 lg:h-96 bg-white rounded-lg flex items-center justify-center p-4 sm:p-8">
              {item.imageUrl ? (
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground" />
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3 leading-snug">{item.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{item.category}</Badge>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted border-0 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Total Uses</p>
                  <h3 className="text-lg font-medium text-foreground leading-snug">{item.usageCount}</h3>
                </Card>
                <Card className="bg-muted border-0 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">In Use</p>
                  <h3 className="text-lg font-medium text-foreground leading-snug">
                    {displayItem.inUseQuantity} of {displayItem.totalQuantity}
                  </h3>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => onNavigate("assignToJob", { item })}
                  className="flex-1 min-h-[44px] touch-manipulation"
                  disabled={displayItem.availableQuantity === 0}
                >
                  Assign to Job
                </Button>
                <div className="flex gap-2 sm:gap-3">
                  <Button variant="outline" onClick={handleEdit} className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="min-h-[44px] px-3 sm:px-4 touch-manipulation">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-h-[44px] px-3 sm:px-4 touch-manipulation">History</TabsTrigger>
              <TabsTrigger value="analytics" className="min-h-[44px] px-3 sm:px-4 touch-manipulation">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-card border-border elevation-sm p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4 leading-snug">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Item Name</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Category</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{item.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Item ID</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{item.id}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4 leading-snug">Quantity Tracking</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Total Quantity</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{displayItem.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">In Use</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{displayItem.inUseQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Available</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{displayItem.availableQuantity}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4 leading-snug">Location & Cost</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Location</p>
                        {(() => {
                          const activeProjects = jobAssignments.filter(job => job.status === "active");
                          const assignedProjects = getProjectsForItem(item.id, activeProjects);
                          const availableInWarehouse = displayItem.availableQuantity > 0;
                          
                          return (
                            <div className="space-y-3">
                              {/* Warehouse Location */}
                              {availableInWarehouse && (
                                <div>
                                  <p className="text-sm font-normal text-foreground leading-relaxed">
                                    {item.location} ({displayItem.availableQuantity} available)
                                  </p>
                                </div>
                              )}
                              
                              {/* Project Locations */}
                              {assignedProjects.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-2 leading-normal">
                                    Out on Projects ({assignedProjects.length}):
                                  </p>
                                  {assignedProjects.map((project) => {
                                    // Count how many times this item appears in the project
                                    const itemCount = (project.itemIds || []).filter(id => id === item.id).length;
                                    return (
                                      <div 
                                        key={project.id}
                                        className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                                        onClick={() => onNavigate("projectDetail", { project })}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground leading-normal">
                                              {project.clientName || project.shortAddress || project.jobLocation || "Unknown Project"}
                                            </p>
                                            {project.shortAddress && (
                                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {project.shortAddress}
                                              </p>
                                            )}
                                            {project.stagingDate && (
                                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                Staged: {format(project.stagingDate, "MMM d, yyyy")}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium text-foreground leading-normal">
                                              {itemCount}x
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* If no projects and no warehouse items */}
                              {assignedProjects.length === 0 && !availableInWarehouse && (
                                <p className="text-sm font-normal text-foreground leading-relaxed">
                                  {item.location}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Purchase Cost</p>
                        <p className="text-sm font-normal text-foreground leading-relaxed">${item.purchaseCost}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Date Added</p>
                        <p className="text-sm font-normal text-foreground leading-relaxed">
                          {format(item.dateAdded, "PP")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card border-border elevation-sm p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4 leading-snug">Tags</h3>
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
                <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Usage History</h3>
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
                          <h4 className="text-base font-medium text-foreground mb-1 leading-normal">
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                          </h4>
                          {entry.jobLocation && (
                            <p className="text-sm font-normal text-foreground mb-1 leading-relaxed">{entry.jobLocation}</p>
                          )}
                          <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                            by {entry.user} • {format(entry.date, "PP")}
                          </p>
                          {entry.quantity && (
                            <p className="text-sm font-normal text-muted-foreground leading-relaxed">
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
                  <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Usage Over Time</h3>
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
                    <h4 className="text-base font-medium text-foreground mb-1 leading-normal">Avg. Days in Use</h4>
                    <h3 className="text-lg font-medium text-foreground leading-snug">14 days</h3>
                  </Card>

                  <Card className="bg-card border-border elevation-sm p-6">
                    <DollarSign className="w-8 h-8 text-chart-3 mb-3" />
                    <h4 className="text-base font-medium text-foreground mb-1 leading-normal">Revenue Generated</h4>
                    <h3 className="text-lg font-medium text-foreground leading-snug">
                      ${Math.round(item.usageCount * item.purchaseCost * 0.1).toLocaleString()}
                    </h3>
                  </Card>

                  <Card className="bg-card border-border elevation-sm p-6">
                    <Package className="w-8 h-8 text-chart-4 mb-3" />
                    <h4 className="text-base font-medium text-foreground mb-1 leading-normal">Utilization Rate</h4>
                    <h3 className="text-lg font-medium text-foreground leading-snug">
                      {Math.round((displayItem.inUseQuantity / displayItem.totalQuantity) * 100)}%
                    </h3>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground leading-snug">
              Edit Item
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground leading-relaxed">
              Update the item details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Item Image */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-border">
                {editedItem.imageUrl ? (
                  <ImageWithFallback
                    src={editedItem.imageUrl}
                    alt={editedItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Image</p>
                <Button variant="outline" size="sm" className="mt-1">
                  Change Image
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-category"
                  value={editedItem.category}
                  onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                  placeholder="Enter category"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-location"
                  value={editedItem.location}
                  onChange={(e) => setEditedItem({ ...editedItem, location: e.target.value })}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cost">
                  Purchase Cost <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedItem.purchaseCost}
                  onChange={(e) => setEditedItem({ ...editedItem, purchaseCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-total-quantity">
                  Total Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-total-quantity"
                  type="number"
                  min={editedItem.inUseQuantity}
                  value={editedItem.totalQuantity}
                  onChange={(e) => {
                    const totalQty = parseInt(e.target.value) || 0;
                    setEditedItem({
                      ...editedItem,
                      totalQuantity: totalQty,
                      availableQuantity: totalQty - editedItem.inUseQuantity,
                    });
                  }}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Currently in use: {editedItem.inUseQuantity}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-in-use">
                  In Use Quantity
                </Label>
                <Input
                  id="edit-in-use"
                  type="number"
                  min="0"
                  max={editedItem.totalQuantity}
                  value={editedItem.inUseQuantity}
                  onChange={(e) => {
                    const inUseQty = parseInt(e.target.value) || 0;
                    setEditedItem({
                      ...editedItem,
                      inUseQuantity: inUseQty,
                      availableQuantity: editedItem.totalQuantity - inUseQty,
                    });
                  }}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Available: {editedItem.totalQuantity - editedItem.inUseQuantity}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {editedItem.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => {
                        setEditedItem({
                          ...editedItem,
                          tags: editedItem.tags.filter((_, i) => i !== index),
                        });
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a tag"
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const newTag = newTagValue.trim();
                      if (newTag && !editedItem.tags.includes(newTag)) {
                        setEditedItem({
                          ...editedItem,
                          tags: [...editedItem.tags, newTag],
                        });
                        setNewTagValue("");
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
