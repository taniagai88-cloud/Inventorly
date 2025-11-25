import { motion } from "motion/react";
import {
  Package,
  CheckCircle2,
  Activity,
  TrendingUp,
  Plus,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { format } from "date-fns";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming, getStagingStatus, calculateInvoiceTotal } from "../utils/projectUtils";
import { AIAssistant } from "./AIAssistant";
import type { AppState, InventoryItem, JobAssignment } from "../types";

interface SectionProps {
  onNavigate: (state: AppState, data?: any) => void;
  kpis?: any[];
  topItems?: InventoryItem[];
  activeProjects?: JobAssignment[];
  filteredProjects?: JobAssignment[];
  hasMoreProjects?: boolean;
  sortOrder?: "earliest" | "latest";
  setSortOrder?: (order: "earliest" | "latest") => void;
  projectFilter?: "all" | "staged" | "upcoming";
  setProjectFilter?: (filter: "all" | "staged" | "upcoming") => void;
  scrollPosition?: number;
  handleScroll?: (direction: "left" | "right") => void;
  handleTopItemClick?: (item: InventoryItem) => void;
  getStockStatus?: (item: InventoryItem) => { label: string; variant: "default" | "secondary" | "destructive" };
  getDaysLeft?: (date?: Date) => number | null;
  stagedProjectsCount?: number;
  jobAssignments?: JobAssignment[];
  items?: InventoryItem[];
}

export function KPISection({ kpis, onNavigate }: SectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis?.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="bg-card border-border elevation-sm p-6 cursor-pointer hover:elevation-md transition-shadow"
            onClick={kpi.onClick}
          >
            <div className="flex items-start justify-between mb-4">
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
              <div className="flex items-center gap-1">
                {kpi.change > 0 ? (
                  <ArrowUp className="w-4 h-4 text-chart-3" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-destructive" />
                )}
                <span className={kpi.change > 0 ? "text-chart-3" : "text-destructive"}>
                  {Math.abs(kpi.change)}%
                </span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1 leading-snug">{kpi.value}</h3>
            <p className="text-sm font-normal text-muted-foreground leading-relaxed">{kpi.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function QuickActionsSection({ onNavigate }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col sm:flex-row gap-4 mb-8"
    >
      <Button 
        onClick={() => onNavigate("addItem")} 
        className="flex-1 bg-primary text-white hover:!bg-secondary transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
      <Button onClick={() => onNavigate("assignToJob")} variant="outline" className="flex-1">
        <FolderPlus className="w-4 h-4 mr-2" />
        Create Project
      </Button>
    </motion.div>
  );
}

export function AIAssistantSection({ jobAssignments, items, onNavigate }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="mb-8"
    >
      <AIAssistant 
        jobAssignments={jobAssignments || []}
        items={items || []}
        onNavigate={onNavigate}
      />
    </motion.div>
  );
}

export function ProjectsSection({
  activeProjects,
  filteredProjects,
  hasMoreProjects,
  sortOrder,
  setSortOrder,
  projectFilter,
  setProjectFilter,
  getDaysLeft,
  stagedProjectsCount,
  onNavigate,
  items,
}: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-foreground leading-snug">Projects</h2>
          </div>
          <p className="text-muted-foreground">Track staging timelines and item allocation</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button 
            onClick={() => onNavigate("assignToJob")} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === "earliest" ? "Earliest" : "Latest"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder?.("earliest")}>
                  Earliest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder?.("latest")}>
                  Latest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeProjects?.map((job, index) => {
          const projectItems = getProjectItemIds(job);
          const allItems = projectItems
            .map(id => items?.find(item => item.id === id))
            .filter(Boolean) as InventoryItem[];
          
          const daysLeft = getDaysLeft?.(job.stagingDate);
          const isUpcoming = isStagingUpcoming(job.stagingDate);
          const stagingStatus = getStagingStatus(job);
          
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-card border-border elevation-sm p-6 cursor-pointer hover:elevation-md transition-shadow group"
                onClick={() => onNavigate("projectDetail", { project: job })}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1 leading-snug group-hover:text-white transition-colors">{job.clientName || job.shortAddress || job.jobLocation}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground group-hover:text-white transition-colors">
                      <MapPin className="w-3 h-3" />
                      <p>{job.jobLocation}</p>
                    </div>
                  </div>
                  <Badge variant={stagingStatus === "staged" ? "default" : "secondary"}>
                    {stagingStatus === "staged" ? "Staged" : stagingStatus === "upcoming" ? "Upcoming" : "Pending"}
                  </Badge>
                </div>

                {job.stagingDate && (
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(job.stagingDate, "MMM d, yyyy")}</span>
                    </div>
                    {daysLeft !== null && daysLeft >= 0 && (
                      <div className={`flex items-center gap-1 ${isUpcoming ? 'text-chart-4' : 'text-muted-foreground'} group-hover:text-white transition-colors`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {isUpcoming ? `${7 - Math.floor((new Date().getTime() - job.stagingDate.getTime()) / (1000 * 60 * 60 * 24))} days` : `${daysLeft}d left`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-white transition-colors">
                    <span>Items</span>
                    <span>{projectItems.length} assigned</span>
                  </div>
                  {job.roomPricing && Object.keys(job.roomPricing).length > 0 && (
                    <div className="flex items-center justify-between group-hover:text-white transition-colors">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-foreground font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(calculateInvoiceTotal(job))}
                      </span>
                    </div>
                  )}
                  {allItems.length > 0 && (
                    <p className="text-muted-foreground">
                      Items will be shown here once they've been added
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("library", { selectedProjectId: job.id });
                    }}
                  >
                    {isUpcoming ? "Add Inventory" : "Add Items"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {activeProjects?.length === 0 && (
        <Card className="bg-card border-border elevation-sm p-8 text-center mt-6">
          <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-base font-medium text-foreground mb-2 leading-normal">No Projects</h4>
          <p className="text-muted-foreground mb-4">
            {projectFilter !== "all" 
              ? `No ${projectFilter} projects found. Try changing the filter.`
              : "Create your first project to start tracking staging and deployments"}
          </p>
          {projectFilter === "all" && (
            <Button onClick={() => onNavigate("assignToJob")} variant="outline">
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </Card>
      )}

      {hasMoreProjects && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => onNavigate("allProjects")}>
            View All {filteredProjects?.length} Projects
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export function TopItemsSection({
  topItems,
  scrollPosition,
  handleScroll,
  handleTopItemClick,
  getStockStatus,
}: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground leading-snug">Top 5 Most-Used Items</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleScroll?.("left")}
            className="p-2 border border-border rounded-lg hover:bg-muted"
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll?.("right")}
            className="p-2 border border-border rounded-lg hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        id="top-items-container"
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {topItems?.map((item) => {
          const status = getStockStatus?.(item) || { label: "Available", variant: "default" as const };
          return (
            <Card
              key={item.id}
              className="flex-shrink-0 w-72 bg-card border-border elevation-sm p-4 cursor-pointer hover:elevation-md transition-shadow"
              onClick={() => handleTopItemClick?.(item)}
            >
              <div className="relative mb-4">
                <div className="w-full h-40 bg-white rounded-lg flex items-center justify-center overflow-hidden">
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
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {item.usageCount} uses
                </Badge>
              </div>
              <h4 className="text-base font-medium text-foreground mb-2 leading-normal">{item.name}</h4>
              <p className="text-sm font-normal text-muted-foreground mb-3 leading-relaxed">{item.category}</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

export function InsightsSection({ onNavigate }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="bg-card border-border elevation-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground leading-snug">Insights</h3>
        </div>
        <h4 className="text-base font-medium text-foreground mb-3 leading-normal">Usage Trends</h4>
        <p className="text-muted-foreground mb-4">
          Your inventory utilization has increased by 8% this month. Professional Display Screens
          and Modern Lounge Chairs are your most-used items. Consider increasing stock for items
          frequently showing low availability.
        </p>
        <button
          onClick={() => onNavigate("reports")}
          className="text-primary hover:underline"
        >
          View Full Report →
        </button>
      </Card>
    </motion.div>
  );
}
