import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Package,
  CheckCircle2,
  DollarSign,
  Activity,
  Plus,
  FolderPlus,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  ArrowUpDown,
  Filter,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { mockInventoryItems, mockJobAssignments } from "../mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming } from "../utils/projectUtils";
import { AIAssistant } from "./AIAssistant";
import { DraggableSection } from "./DraggableSection";

interface DashboardProps {
  onNavigate: (state: AppState, data?: any) => void;
  jobAssignments: JobAssignment[];
}

interface DashboardSections {
  kpis: boolean;
  quickActions: boolean;
  aiAssistant: boolean;
  projects: boolean;
  topItems: boolean;
  insights: boolean;
}

const DEFAULT_SECTIONS: DashboardSections = {
  kpis: true,
  quickActions: true,
  aiAssistant: true,
  projects: true,
  topItems: true,
  insights: true,
};

type SectionKey = keyof DashboardSections;

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "kpis",
  "quickActions",
  "aiAssistant",
  "projects",
  "topItems",
  "insights",
];

export function Dashboard({ onNavigate, jobAssignments }: DashboardProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [stagingDate, setStagingDate] = useState<Date>();
  const [sortOrder, setSortOrder] = useState<"earliest" | "latest">("earliest");
  const [projectFilter, setProjectFilter] = useState<"all" | "staged" | "upcoming">("all");
  const [customizeSheetOpen, setCustomizeSheetOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<DashboardSections>(DEFAULT_SECTIONS);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_SECTION_ORDER);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboardSections");
    if (saved) {
      try {
        setVisibleSections(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load dashboard preferences", e);
      }
    }

    const savedOrder = localStorage.getItem("dashboardSectionOrder");
    if (savedOrder) {
      try {
        setSectionOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to load dashboard order", e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const updateSectionVisibility = (section: keyof DashboardSections, visible: boolean) => {
    const newSections = { ...visibleSections, [section]: visible };
    setVisibleSections(newSections);
    localStorage.setItem("dashboardSections", JSON.stringify(newSections));
    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} ${visible ? 'shown' : 'hidden'}`);
  };

  const resetToDefault = () => {
    setVisibleSections(DEFAULT_SECTIONS);
    setSectionOrder(DEFAULT_SECTION_ORDER);
    localStorage.setItem("dashboardSections", JSON.stringify(DEFAULT_SECTIONS));
    localStorage.setItem("dashboardSectionOrder", JSON.stringify(DEFAULT_SECTION_ORDER));
    toast.success("Dashboard reset to default layout");
  };

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSectionOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const [removed] = newOrder.splice(dragIndex, 1);
      newOrder.splice(hoverIndex, 0, removed);
      localStorage.setItem("dashboardSectionOrder", JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  const totalItems = mockInventoryItems.reduce((sum, item) => sum + item.totalQuantity, 0);
  const itemsInUse = mockInventoryItems.reduce((sum, item) => sum + item.inUseQuantity, 0);
  const totalValue = mockInventoryItems.reduce((sum, item) => sum + item.purchaseCost * item.totalQuantity, 0);
  const avgUtilization = Math.round((itemsInUse / totalItems) * 100);

  const topItems = [...mockInventoryItems]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const availableItems = mockInventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
  const lowStockItems = mockInventoryItems.filter(item => item.availableQuantity > 0 && item.availableQuantity <= 3).length;

  // Get active projects with filtering
  const allActiveProjects = jobAssignments.filter(job => job.status === "active");
  const stagedProjectsCount = allActiveProjects.filter(job => isProjectStaged(job)).length;
  
  const filteredProjects = allActiveProjects
    .filter(job => {
      // Always show upcoming projects
      if (isStagingUpcoming(job.stagingDate)) return true;
      
      if (projectFilter === "all") return true;
      
      // For upcoming filter, only upcoming (already handled above)
      if (projectFilter === "upcoming") {
        return false; // Already included above
      }
      
      // For staged filter, check if project is actually staged (date passed)
      if (projectFilter === "staged") {
        return isProjectStaged(job);
      }
      
      // For pending, show projects without staging date or not yet staged
      if (projectFilter === "pending") {
        return !job.stagingDate || (!isProjectStaged(job) && !isStagingUpcoming(job.stagingDate));
      }
      
      return false;
    })
    .sort((a, b) => {
      // First, prioritize upcoming projects
      const aUpcoming = isStagingUpcoming(a.stagingDate);
      const bUpcoming = isStagingUpcoming(b.stagingDate);
      
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      
      // Then sort by staging date
      if (!a.stagingDate || !b.stagingDate) return 0;
      return sortOrder === "earliest" 
        ? a.stagingDate.getTime() - b.stagingDate.getTime()
        : b.stagingDate.getTime() - a.stagingDate.getTime();
    });
  
  // Limit to 3 projects
  const activeProjects = filteredProjects.slice(0, 3);
  const hasMoreProjects = filteredProjects.length > 3;
  
  // Calculate days left in 45-day contract from staging date
  const getDaysLeft = (stagingDate?: Date) => {
    if (!stagingDate) return null;
    const today = new Date();
    const contractEndDate = new Date(stagingDate);
    contractEndDate.setDate(contractEndDate.getDate() + 45);
    const diffTime = contractEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const kpis = [
    {
      label: "Total Items",
      value: totalItems.toString(),
      change: 12,
      icon: Package,
      color: "text-primary",
      onClick: () => onNavigate("library"),
    },
    {
      label: "Available",
      value: availableItems.toString(),
      change: 8,
      icon: CheckCircle2,
      color: "text-chart-3",
      onClick: () => onNavigate("library", { filter: "available" }),
    },
    {
      label: "In Use",
      value: itemsInUse.toString(),
      change: 5,
      icon: Activity,
      color: "text-chart-2",
      onClick: () => onNavigate("inUse"),
    },
    {
      label: "Low Stock",
      value: lowStockItems.toString(),
      change: -3,
      icon: TrendingUp,
      color: "text-chart-4",
      onClick: () => onNavigate("library", { filter: "lowStock" }),
    },
  ];

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("top-items-container");
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(
            container.scrollWidth - container.clientWidth,
            scrollPosition + scrollAmount
          );

    container.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  const handleTopItemClick = (item: InventoryItem) => {
    // Navigate to reports page with selected item
    onNavigate("reports", { selectedItem: item });
  };

  const handleAssignItemClick = (item: InventoryItem) => {
    if (item.availableQuantity === 0) return;
    setSelectedItem(item);
    setAssignDialogOpen(true);
  };

  const handleAssign = () => {
    if (!selectedItem || !jobName || !jobLocation || !stagingDate) return;

    toast.success(`${selectedItem.name} assigned to ${jobName}`);
    setAssignDialogOpen(false);
    setSelectedItem(null);
    setJobName("");
    setJobLocation("");
    setStagingDate(undefined);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableQuantity === 0) {
      return { label: "All in Use", variant: "destructive" as const };
    }
    if (item.availableQuantity <= 3) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    return { label: "Available", variant: "default" as const };
  };

  const getStagingStatusBadge = (status?: "staged" | "upcoming") => {
    switch (status) {
      case "staged":
        return { label: "Staged", variant: "default" as const, color: "bg-chart-3 text-secondary-foreground" };
      case "upcoming":
        return { label: "Upcoming", variant: "secondary" as const, color: "bg-chart-4 text-secondary-foreground" };
      default:
        return { label: "Not Staged", variant: "outline" as const, color: "" };
    }
  };

  const hasAnyVisibleSections = Object.values(visibleSections).some(v => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Customize Button */}
      <div className="flex justify-end mb-6">
        <Sheet open={customizeSheetOpen} onOpenChange={setCustomizeSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Customize Dashboard
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Customize Dashboard</SheetTitle>
              <SheetDescription>
                Choose which sections to display on your dashboard
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>KPI Cards</Label>
                    <p className="text-muted-foreground">
                      Total items, available, in use, and low stock metrics
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.kpis}
                    onCheckedChange={(checked) => updateSectionVisibility("kpis", checked)}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>Quick Actions</Label>
                    <p className="text-muted-foreground">
                      Add item and create project buttons
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.quickActions}
                    onCheckedChange={(checked) => updateSectionVisibility("quickActions", checked)}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>AI Assistant</Label>
                    <p className="text-muted-foreground">
                      Ask questions about your inventory and projects
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.aiAssistant}
                    onCheckedChange={(checked) => updateSectionVisibility("aiAssistant", checked)}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>Projects</Label>
                    <p className="text-muted-foreground">
                      Active staging projects and timelines
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.projects}
                    onCheckedChange={(checked) => updateSectionVisibility("projects", checked)}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>Top 5 Most-Used Items</Label>
                    <p className="text-muted-foreground">
                      Your most frequently used inventory items
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.topItems}
                    onCheckedChange={(checked) => updateSectionVisibility("topItems", checked)}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between py-8 px-4">
                  <div className="space-y-0.5">
                    <Label>Insights</Label>
                    <p className="text-muted-foreground">
                      Usage trends and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={visibleSections.insights}
                    onCheckedChange={(checked) => updateSectionVisibility("insights", checked)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={resetToDefault}
                  className="w-full"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>









      {/* Top 5 Most-Used Items */}
      {visibleSections.topItems && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground">Top 5 Most-Used Items</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-2 border border-border rounded-lg hover:bg-muted"
              disabled={scrollPosition === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
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
          {topItems.map((item) => {
            const status = getStockStatus(item);
            return (
              <Card
                key={item.id}
                className="flex-shrink-0 w-72 bg-card border-border elevation-sm p-4 cursor-pointer hover:elevation-md transition-shadow"
                onClick={() => handleTopItemClick(item)}
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
                <h4 className="text-foreground mb-2">{item.name}</h4>
                <p className="text-muted-foreground mb-3">{item.category}</p>
                <Badge variant={status.variant}>{status.label}</Badge>
              </Card>
            );
          })}
        </div>
      </motion.div>
      )}

      {/* Insights Card */}
      {visibleSections.insights && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-card border-border elevation-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-foreground">Insights</h3>
          </div>
          <h4 className="text-foreground mb-3">Usage Trends</h4>
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
      )}

      {/* Rearrangeable Sections */}
      <DndProvider backend={HTML5Backend}>
        {sectionOrder.map((sectionKey, index) => {
          if (!visibleSections[sectionKey]) return null;
          
          return (
            <DraggableSection
              key={sectionKey}
              id={sectionKey}
              index={index}
              moveSection={moveSection}
            >
              {sectionKey === "kpis" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {kpis.map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
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
                        <h3 className="text-foreground mb-1">{kpi.value}</h3>
                        <p className="text-muted-foreground">{kpi.label}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {sectionKey === "quickActions" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                  <Button onClick={() => onNavigate("addItem")} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                  <Button onClick={() => onNavigate("assignToJob")} variant="outline" className="flex-1">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </motion.div>
              )}

              {sectionKey === "aiAssistant" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-8"
                >
                  <AIAssistant 
                    jobAssignments={jobAssignments}
                    items={mockInventoryItems}
                    onNavigate={onNavigate}
                  />
                </motion.div>
              )}

              {sectionKey === "projects" && activeProjects && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-foreground">Active Projects</h2>
                        <Badge variant="secondary">{stagedProjectsCount} Staged</Badge>
                      </div>
                      <p className="text-muted-foreground">Track staging timelines and item allocation</p>
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            {projectFilter === "all" ? "All" : projectFilter === "staged" ? "Staged" : "Upcoming"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setProjectFilter("all")}>All Projects</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setProjectFilter("staged")}>Staged Only</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setProjectFilter("upcoming")}>Upcoming Only</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <ArrowUpDown className="w-4 h-4" />
                            {sortOrder === "earliest" ? "Earliest" : "Latest"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSortOrder("earliest")}>Earliest First</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortOrder("latest")}>Latest First</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {activeProjects.map((job, i) => {
                      const projectItems = getProjectItemIds(job);
                      const allItems = projectItems
                        .map(id => mockInventoryItems.find(item => item.id === id))
                        .filter(Boolean) as InventoryItem[];
                      const daysLeft = getDaysLeft(job.stagingDate);
                      const isUpcoming = isStagingUpcoming(job.stagingDate);
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card 
                            className="bg-card border-border elevation-sm p-6 cursor-pointer hover:elevation-md transition-shadow"
                            onClick={() => onNavigate("projectDetail", { project: job })}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-foreground mb-1">{job.jobName}</h3>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <p>{job.jobLocation}</p>
                                </div>
                              </div>
                              <Badge variant={job.stagingStatus === "staged" ? "default" : "secondary"}>
                                {job.stagingStatus === "staged" ? "Staged" : "Upcoming"}
                              </Badge>
                            </div>
                            {job.stagingDate && (
                              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{format(job.stagingDate, "MMM d, yyyy")}</span>
                                </div>
                                {daysLeft !== null && daysLeft >= 0 && (
                                  <div className={`flex items-center gap-1 ${isUpcoming ? 'text-chart-4' : 'text-muted-foreground'}`}>
                                    <Clock className="w-4 h-4" />
                                    <span>{isUpcoming ? `${7 - Math.floor((new Date().getTime() - job.stagingDate.getTime()) / (1000 * 60 * 60 * 24))} days` : `${daysLeft}d left`}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span>Items</span>
                                <span>{projectItems.length} assigned</span>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                  {activeProjects.length === 0 && (
                    <Card className="bg-card border-border elevation-sm p-8 text-center mt-6">
                      <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-foreground mb-2">No Projects</h4>
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
                      <Button variant="outline" onClick={() => onNavigate("inUse")}>
                        View All {filteredProjects.length} Projects
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {sectionKey === "topItems" && topItems && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-foreground">Top 5 Most-Used Items</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleScroll("left")}
                        className="p-2 border border-border rounded-lg hover:bg-muted"
                        disabled={scrollPosition === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleScroll("right")}
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
                    {topItems.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <Card
                          key={item.id}
                          className="flex-shrink-0 w-72 bg-card border-border elevation-sm p-4 cursor-pointer hover:elevation-md transition-shadow"
                          onClick={() => handleTopItemClick(item)}
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
                          <h4 className="text-foreground mb-2">{item.name}</h4>
                          <p className="text-muted-foreground mb-3">{item.category}</p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {sectionKey === "insights" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-card border-border elevation-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="text-foreground">Insights</h3>
                    </div>
                    <h4 className="text-foreground mb-3">Usage Trends</h4>
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
              )}
            </DraggableSection>
          );
        })}
      </DndProvider>

      {/* Empty State */}
      {!hasAnyVisibleSections && (
        <Card className="bg-card border-border elevation-sm p-12 text-center">
          <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Sections Visible</h3>
          <p className="text-muted-foreground mb-4">
            You've hidden all dashboard sections. Click "Customize Dashboard" to show sections.
          </p>
          <Button
            variant="outline"
            onClick={() => setCustomizeSheetOpen(true)}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Customize Dashboard
          </Button>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Job</DialogTitle>
            <DialogDescription>
              Assign this item to a specific job with requested staging date
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-foreground mb-1">{selectedItem.name}</h4>
                <p className="text-muted-foreground">
                  Available: {selectedItem.availableQuantity} of {selectedItem.totalQuantity}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Enter job name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobLocation">Job Location</Label>
                <Input
                  id="jobLocation"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label>Requested Staging Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {stagingDate ? format(stagingDate, "PP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={stagingDate}
                      onSelect={setStagingDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAssignDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!jobName || !jobLocation || !stagingDate}
                  className="flex-1"
                >
                  Assign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
