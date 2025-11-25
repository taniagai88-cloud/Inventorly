import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
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
  LayoutGrid,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { motion } from "motion/react";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { mockInventoryItems } from "../mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming, getStagingStatus, getAccurateItemQuantities, calculateInvoiceTotal } from "../utils/projectUtils";
import { AIAssistant } from "./AIAssistant";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

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

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "aiAssistant", x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 4, w: 12, h: 6, minW: 6, minH: 4 },
    { i: "kpis", x: 0, y: 10, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "quickActions", x: 0, y: 14, w: 12, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 16, w: 12, h: 6, minW: 6, minH: 5 },
    { i: "insights", x: 0, y: 22, w: 12, h: 3, minW: 6, minH: 3 },
  ],
  md: [
    { i: "aiAssistant", x: 0, y: 0, w: 10, h: 4, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 4, w: 10, h: 6, minW: 6, minH: 4 },
    { i: "kpis", x: 0, y: 10, w: 10, h: 4, minW: 6, minH: 3 },
    { i: "quickActions", x: 0, y: 14, w: 10, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 16, w: 10, h: 6, minW: 6, minH: 5 },
    { i: "insights", x: 0, y: 22, w: 10, h: 3, minW: 6, minH: 3 },
  ],
  sm: [
    { i: "aiAssistant", x: 0, y: 0, w: 6, h: 4, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 4, w: 6, h: 7, minW: 6, minH: 5 },
    { i: "kpis", x: 0, y: 11, w: 6, h: 5, minW: 6, minH: 4 },
    { i: "quickActions", x: 0, y: 16, w: 6, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 18, w: 6, h: 8, minW: 6, minH: 6 },
    { i: "insights", x: 0, y: 26, w: 6, h: 3, minW: 6, minH: 3 },
  ],
  xs: [
    { i: "aiAssistant", x: 0, y: 0, w: 4, h: 4, minW: 4, minH: 3 },
    { i: "projects", x: 0, y: 4, w: 4, h: 7, minW: 4, minH: 5 },
    { i: "kpis", x: 0, y: 11, w: 4, h: 5, minW: 4, minH: 4 },
    { i: "quickActions", x: 0, y: 16, w: 4, h: 2, minW: 4, minH: 2 },
    { i: "topItems", x: 0, y: 18, w: 4, h: 8, minW: 4, minH: 6 },
    { i: "insights", x: 0, y: 26, w: 4, h: 3, minW: 4, minH: 3 },
  ],
};

export function GridDashboard({ onNavigate, jobAssignments }: DashboardProps) {
  // Real-time date state that updates every minute
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Update current date every minute for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [sortOrder, setSortOrder] = useState<"earliest" | "latest">("earliest");
  const [projectFilter, setProjectFilter] = useState<"all" | "staged" | "upcoming">("all");
  const [customizeSheetOpen, setCustomizeSheetOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<DashboardSections>(DEFAULT_SECTIONS);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("dashboardSections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties are defined
        const merged = { ...DEFAULT_SECTIONS, ...parsed };
        // Ensure quickActions is always visible
        merged.quickActions = true;
        setVisibleSections(merged);
      } catch (e) {
        console.error("Failed to load dashboard preferences", e);
      }
    }

    const savedLayouts = localStorage.getItem("dashboardLayouts");
    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        // Ensure quickActions is in all layouts
        ['lg', 'md', 'sm'].forEach(breakpoint => {
          if (parsedLayouts[breakpoint]) {
            const hasQuickActions = parsedLayouts[breakpoint].some((l: any) => l.i === 'quickActions');
            if (!hasQuickActions) {
              // Add quickActions layout (position after kpis)
              const kpisIndex = parsedLayouts[breakpoint].findIndex((l: any) => l.i === 'kpis');
              const quickActionsLayout = DEFAULT_LAYOUTS[breakpoint as keyof typeof DEFAULT_LAYOUTS].find(l => l.i === 'quickActions');
              if (quickActionsLayout && kpisIndex >= 0) {
                parsedLayouts[breakpoint].splice(kpisIndex + 1, 0, quickActionsLayout);
              }
            }
          }
        });
        setLayouts(parsedLayouts);
      } catch (e) {
        console.error("Failed to load dashboard layouts", e);
      }
    }
  }, []);

  const updateSectionVisibility = (section: keyof DashboardSections, visible: boolean) => {
    // Prevent hiding quickActions section
    if (section === "quickActions" && !visible) {
      toast.error("Quick Actions section cannot be hidden");
      return;
    }
    const newSections = { ...visibleSections, [section]: visible };
    // Ensure quickActions is always true
    newSections.quickActions = true;
    setVisibleSections(newSections);
    localStorage.setItem("dashboardSections", JSON.stringify(newSections));
    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} ${visible ? 'shown' : 'hidden'}`);
  };

  const resetToDefault = () => {
    setVisibleSections(DEFAULT_SECTIONS);
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.setItem("dashboardSections", JSON.stringify(DEFAULT_SECTIONS));
    localStorage.setItem("dashboardLayouts", JSON.stringify(DEFAULT_LAYOUTS));
    toast.success("Dashboard reset to default layout");
  };

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem("dashboardLayouts", JSON.stringify(allLayouts));
  };

  // Get active projects
  const allActiveProjects = jobAssignments.filter(job => job.status === "active");
  
  // Calculate accurate quantities based on project assignments
  const itemsWithAccurateQuantities = mockInventoryItems.map(item => {
    const accurateQuantities = getAccurateItemQuantities(item, allActiveProjects);
    return { ...item, ...accurateQuantities };
  });

  const totalItems = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.totalQuantity, 0);
  const itemsInUse = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.inUseQuantity, 0);
  const availableItems = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.availableQuantity, 0);
  const lowStockItems = itemsWithAccurateQuantities.filter(item => item.availableQuantity > 0 && item.availableQuantity <= 3).length;

  const topItems = [...itemsWithAccurateQuantities]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);
  const stagedProjectsCount = allActiveProjects.filter(job => isProjectStaged(job)).length;

  const filteredProjects = allActiveProjects
    .filter(job => {
      if (projectFilter === "all") return true;
      if (projectFilter === "staged") return isProjectStaged(job);
      if (projectFilter === "upcoming") return isStagingUpcoming(job.stagingDate);
      return false;
    })
    .sort((a, b) => {
      const aUpcoming = isStagingUpcoming(a.stagingDate);
      const bUpcoming = isStagingUpcoming(b.stagingDate);
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (!a.stagingDate || !b.stagingDate) return 0;
      return sortOrder === "earliest" 
        ? a.stagingDate.getTime() - b.stagingDate.getTime()
        : b.stagingDate.getTime() - a.stagingDate.getTime();
    });

  const activeProjects = filteredProjects.slice(0, 3);
  const hasMoreProjects = filteredProjects.length > 3;

  const getDaysLeft = (stagingDate?: Date) => {
    if (!stagingDate) return null;
    const today = currentDate;
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
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    container.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  const handleTopItemClick = (item: InventoryItem) => {
    onNavigate("reports", { selectedItem: item });
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

  const hasAnyVisibleSections = Object.values(visibleSections).some(v => v);

  // Filter layouts to only include visible sections
  const visibleLayouts = {
    lg: layouts.lg.filter(l => visibleSections[l.i as keyof DashboardSections]),
    md: layouts.md.filter(l => visibleSections[l.i as keyof DashboardSections]),
    sm: layouts.sm.filter(l => visibleSections[l.i as keyof DashboardSections]),
    xs: layouts.xs?.filter(l => visibleSections[l.i as keyof DashboardSections]) || [],
  };

  return (
    <div className="max-w-7xl mx-auto" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 className="text-foreground text-xl sm:text-2xl" style={{ marginBottom: 'var(--spacing-1)' }}>Dashboard</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">Drag and resize sections to customize your layout</p>
        </div>
        <div className="flex flex-wrap w-full sm:w-auto" style={{ gap: 'var(--spacing-2)' }}>
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => {
              setIsEditMode(!isEditMode);
              toast.success(isEditMode ? "Edit mode disabled" : "Edit mode enabled - drag to rearrange");
            }}
            style={{ gap: 'var(--spacing-2)' }}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{isEditMode ? "Done Editing" : "Edit Layout"}</span>
            <span className="sm:hidden">{isEditMode ? "Done" : "Edit"}</span>
          </Button>
          <Sheet open={customizeSheetOpen} onOpenChange={setCustomizeSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" style={{ gap: 'var(--spacing-2)' }} className="flex-1 sm:flex-initial min-h-[44px]">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Sections</span>
                <span className="sm:hidden">Sections</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Customize Dashboard</SheetTitle>
                <SheetDescription>
                  Toggle sections and use Edit Layout to rearrange them
                </SheetDescription>
              </SheetHeader>
              <div style={{ marginTop: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                  <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                    <div>
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

                <div style={{ paddingTop: 'var(--spacing-4)' }}>
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
      </div>

      {!hasAnyVisibleSections ? (
        <Card className="bg-card border-border elevation-sm text-center" style={{ padding: 'var(--spacing-12)' }}>
          <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto" style={{ marginBottom: 'var(--spacing-4)' }} />
          <h3 className="text-foreground" style={{ marginBottom: 'var(--spacing-2)' }}>No Sections Visible</h3>
          <p className="text-muted-foreground" style={{ marginBottom: 'var(--spacing-4)' }}>
            You've hidden all dashboard sections. Click "Sections" to show sections.
          </p>
          <Button
            variant="outline"
            onClick={() => setCustomizeSheetOpen(true)}
            style={{ gap: 'var(--spacing-2)' }}
          >
            <LayoutGrid className="w-4 h-4" />
            Show Sections
          </Button>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={visibleLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
        >
          {visibleSections.kpis && (
            <div key="kpis">
              <Card className={`bg-card border-border elevation-sm h-full ${isEditMode ? 'cursor-move' : ''}`} style={{ padding: 'var(--spacing-6)' }}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)' }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full gap-4 sm:gap-6">
                  {kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-card border border-border elevation-sm cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation p-4 sm:p-6 rounded-lg"
                      onClick={kpi.onClick}
                    >
                      <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                        <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                        <div className="flex items-center" style={{ gap: 'var(--spacing-1)' }}>
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
                      <h3 className="text-foreground" style={{ marginBottom: 'var(--spacing-1)' }}>{kpi.value}</h3>
                      <p className="text-muted-foreground">{kpi.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {visibleSections.quickActions && (
            <div key="quickActions">
              <Card className={`bg-card border-border elevation-sm h-full ${isEditMode ? 'cursor-move' : ''}`} style={{ padding: 'var(--spacing-6)' }}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)' }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row h-full items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                  <Button 
                    onClick={() => onNavigate("addItem")} 
                    className="flex-1 w-full bg-primary text-white hover:!bg-secondary transition-colors min-h-[44px] touch-manipulation"
                  >
                    <Plus className="w-4 h-4" style={{ marginRight: 'var(--spacing-2)' }} />
                    Add Item
                  </Button>
                  <Button onClick={() => onNavigate("assignToJob")} variant="outline" className="flex-1 w-full min-h-[44px] touch-manipulation">
                    <FolderPlus className="w-4 h-4" style={{ marginRight: 'var(--spacing-2)' }} />
                    Create Project
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {visibleSections.aiAssistant && (
            <div key="aiAssistant">
              <div className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move border border-border" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)' }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <AIAssistant 
                  jobAssignments={jobAssignments}
                  items={mockInventoryItems}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          )}

          {visibleSections.projects && (
            <div key="projects">
              <Card className={`bg-card border-border elevation-sm h-full overflow-auto ${isEditMode ? 'cursor-move' : ''}`} style={{ padding: 'var(--spacing-6)' }}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)' }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
                      <h2 className="text-foreground">Projects</h2>
                    </div>
                    <p className="text-muted-foreground">Track staging timelines</p>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                    <Button 
                      onClick={() => onNavigate("assignToJob")} 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                    <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" style={{ gap: 'var(--spacing-2)' }}>
                            <ArrowUpDown className="w-4 h-4" />
                            {sortOrder === "earliest" ? "Earliest" : "Latest"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSortOrder("earliest")}>
                            Earliest First
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortOrder("latest")}>
                            Latest First
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-4)' }}>
                  {activeProjects.map((job) => {
                    const projectItems = getProjectItemIds(job);
                    const daysLeft = getDaysLeft(job.stagingDate);
                    const isUpcoming = isStagingUpcoming(job.stagingDate);
                    const stagingStatus = getStagingStatus(job);
                    
                    return (
                      <div
                        key={job.id}
                        className="border border-border cursor-pointer hover:bg-muted transition-colors group"
                        style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}
                        onClick={() => onNavigate("projectDetail", { project: job })}
                      >
                        <div className="flex items-start justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
                          <div className="flex-1">
                            <h4 className="text-foreground group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-1)' }}>{job.clientName || job.shortAddress || job.jobLocation}</h4>
                            <div className="flex items-center text-muted-foreground group-hover:text-white transition-colors" style={{ gap: 'var(--spacing-1)' }}>
                              <MapPin className="w-3 h-3" />
                              <p>{job.jobLocation}</p>
                            </div>
                          </div>
                          <Badge variant={stagingStatus === "staged" ? "default" : "secondary"}>
                            {stagingStatus === "staged" ? "Staged" : stagingStatus === "upcoming" ? "Upcoming" : "Pending"}
                          </Badge>
                        </div>

                        {job.stagingDate && (
                          <div className="flex items-center text-muted-foreground group-hover:text-white transition-colors" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                            <CalendarIcon className="w-3 h-3" />
                            <span>{format(job.stagingDate, "MMM d")}</span>
                            {daysLeft !== null && daysLeft >= 0 && (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>{isUpcoming ? `${Math.max(0, Math.ceil((job.stagingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))}d` : `${daysLeft}d left`}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="space-y-1">
                        <p className="text-muted-foreground group-hover:text-white transition-colors">{projectItems.length} items</p>
                          {job.roomPricing && Object.keys(job.roomPricing).length > 0 && (
                            <p className="text-foreground font-medium group-hover:text-white transition-colors" style={{ fontSize: 'var(--font-size-sm)' }}>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(calculateInvoiceTotal(job))}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeProjects.length === 0 && (
                  <div className="text-center" style={{ padding: 'var(--spacing-8) 0' }}>
                    <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto" style={{ marginBottom: 'var(--spacing-4)' }} />
                    <p className="text-muted-foreground">No projects found</p>
                  </div>
                )}

                {hasMoreProjects && (
                  <div className="flex justify-center" style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("allProjects")}>
                      View All {filteredProjects.length} Projects
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}

          {visibleSections.topItems && (
            <div key="topItems">
              <Card className={`bg-card border-border elevation-sm h-full overflow-hidden flex flex-col ${isEditMode ? 'cursor-move' : ''}`} style={{ padding: 'var(--spacing-6)' }}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div style={{ marginBottom: 'var(--spacing-4)', flexShrink: 0 }}>
                  <h2 className="text-foreground" style={{ marginBottom: 'var(--spacing-1)' }}>Top 5 Most-Used</h2>
                  <p className="text-muted-foreground">Your most frequently used items</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4" style={{ flex: 1, minHeight: 0, alignContent: 'start' }}>
                  {topItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div
                        key={item.id}
                        className="border border-border cursor-pointer hover:bg-muted transition-colors flex flex-col touch-manipulation"
                        style={{ padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}
                        onClick={() => handleTopItemClick(item)}
                      >
                        <div className="relative" style={{ marginBottom: 'var(--spacing-2)', flexShrink: 0 }}>
                          <div className="w-full bg-white flex items-center justify-center overflow-hidden" style={{ height: '7rem', borderRadius: 'var(--radius-md)' }}>
                            {item.imageUrl ? (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          
                        </div>
                        <h4 className="text-foreground" style={{ marginBottom: 'var(--spacing-2)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.5rem' }}>{item.name}</h4>
                        <div className="flex items-center justify-between" style={{ gap: 'var(--spacing-2)', marginTop: 'auto' }}>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <p className="text-muted-foreground" style={{ whiteSpace: 'nowrap' }}>
                            {item.availableQuantity}/{item.totalQuantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {visibleSections.insights && (
            <div key="insights">
              <Card className={`bg-card border-border elevation-sm h-full ${isEditMode ? 'cursor-move' : ''}`} style={{ padding: 'var(--spacing-6)' }}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)' }}>
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" style={{ marginRight: 'var(--spacing-2)' }} />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground">Insights</h3>
                </div>
                <h4 className="text-foreground" style={{ marginBottom: 'var(--spacing-3)' }}>Usage Trends</h4>
                <p className="text-muted-foreground" style={{ marginBottom: 'var(--spacing-4)' }}>
                  Your inventory utilization has increased by 8% this month. Professional Display Screens
                  and Modern Lounge Chairs are your most-used items.
                </p>
                <button
                  onClick={() => onNavigate("reports")}
                  className="text-primary hover:underline"
                >
                  View Full Report
                </button>
              </Card>
            </div>
          )}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
