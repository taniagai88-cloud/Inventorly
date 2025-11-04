import { motion } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Clock, Package, TrendingUp, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { format, differenceInDays } from "date-fns";
import type { AppState, JobAssignment, InventoryItem } from "../types";
import { getProjectItemIds, isProjectStaged } from "../utils/projectUtils";

interface ProjectDetailProps {
  project: JobAssignment;
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
}

export function ProjectDetail({ project, items, onNavigate }: ProjectDetailProps) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate("dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

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
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onNavigate("library", { selectedProjectId: project.id })}
            >
              Manage Inventory
            </Button>
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

        {/* Insights & Analytics */}
        <Card className="bg-card border-border elevation-sm p-6 mb-6">
          <h4 className="text-foreground mb-6">Project Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
