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
  /* 1920px+ (3xl) - 12 columns */
  lg: [
    { i: "aiAssistant", x: 0, y: 0, w: 12, h: 8, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 12, h: 6, minW: 6, minH: 4 },
    { i: "kpis", x: 0, y: 14, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "quickActions", x: 0, y: 18, w: 12, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 20, w: 12, h: 10, minW: 6, minH: 5 },
    { i: "insights", x: 0, y: 30, w: 12, h: 3, minW: 6, minH: 3 },
  ],
  /* 1280px-1919px (xl/2xl) - 10 columns */
  md: [
    { i: "aiAssistant", x: 0, y: 0, w: 10, h: 8, minW: 5, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 10, h: 6, minW: 5, minH: 4 },
    { i: "kpis", x: 0, y: 14, w: 10, h: 4, minW: 5, minH: 3 },
    { i: "quickActions", x: 0, y: 18, w: 10, h: 2, minW: 5, minH: 2 },
    { i: "topItems", x: 0, y: 20, w: 10, h: 10, minW: 5, minH: 5 },
    { i: "insights", x: 0, y: 30, w: 10, h: 3, minW: 5, minH: 3 },
  ],
  /* 768px-1279px (tablet) - 6 columns */
  sm: [
    { i: "aiAssistant", x: 0, y: 0, w: 6, h: 8, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 6, h: 7, minW: 6, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 6, h: 5, minW: 6, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 6, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 6, h: 12, minW: 6, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 6, h: 3, minW: 6, minH: 3 },
  ],
  /* 414px-767px (medium mobile) - 4 columns */
  xs: [
    { i: "aiAssistant", x: 0, y: 0, w: 4, h: 8, minW: 4, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 4, h: 7, minW: 4, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 4, h: 5, minW: 4, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 4, h: 2, minW: 4, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 4, h: 12, minW: 4, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 4, h: 3, minW: 4, minH: 3 },
  ],
  /* 320px-413px (small mobile) - 2 columns */
  xxs: [
    { i: "aiAssistant", x: 0, y: 0, w: 2, h: 8, minW: 2, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 2, h: 7, minW: 2, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 2, h: 5, minW: 2, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 2, h: 12, minW: 2, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 2, h: 3, minW: 2, minH: 3 },
  ],
};

export function GridDashboard({ onNavigate, jobAssignments }: DashboardProps) {
  // Real-time date state that updates every minute
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Track window width for responsive grid settings
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Update current date every minute for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [sortOrder, setSortOrder] = useState<"earliest" | "latest">("earliest");
  const [projectFilter, setProjectFilter] = useState<"all" | "staged" | "upcoming">("all");
  const [customizeSheetOpen, setCustomizeSheetOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<DashboardSections>(DEFAULT_SECTIONS);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
        // Ensure at least some sections are visible
        const hasAnyVisible = Object.values(merged).some(v => v);
        if (!hasAnyVisible) {
          // If all sections are hidden, reset to defaults
          setVisibleSections(DEFAULT_SECTIONS);
          localStorage.setItem("dashboardSections", JSON.stringify(DEFAULT_SECTIONS));
        } else {
          setVisibleSections(merged);
        }
      } catch (e) {
        console.error("Failed to load dashboard preferences", e);
        // Reset to defaults on error
        setVisibleSections(DEFAULT_SECTIONS);
        localStorage.setItem("dashboardSections", JSON.stringify(DEFAULT_SECTIONS));
      }
    } else {
      // No saved preferences, use defaults
      setVisibleSections(DEFAULT_SECTIONS);
    }
    setIsInitialized(true);

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

  // Prevent Insights from overlapping topItems - comprehensive JavaScript solution
  // 
  // CRITICAL: This effect MUST NOT call setLayouts to avoid infinite loops.
  // 
  // Anti-pattern to avoid:
  //   useEffect(() => {
  //     if (contentHeight > 50) {
  //       setLayouts(newLayouts); // ❌ DON'T DO THIS if layouts is in dependency array
  //     }
  //   }, [layouts]); // ❌ This creates an infinite loop!
  //
  // Safe pattern (current implementation):
  //   - Use DOM manipulation (style.setProperty) instead of state updates
  //   - Depend only on visibleSections, not layouts
  //   - If you must update layouts, use a ref or compare values before calling setLayouts
  useEffect(() => {
    if (!visibleSections.topItems || !visibleSections.insights) return;
    
    // Track last applied transform to prevent unnecessary DOM manipulations
    let lastAppliedTransform = '';
    let isProcessing = false;
    
    const preventOverlap = () => {
      // Prevent concurrent executions
      if (isProcessing) return;
      isProcessing = true;
      
      try {
        // Find the grid items using multiple selectors for reliability
        const topItemsGridItem = Array.from(document.querySelectorAll('.react-grid-item')).find(
          (el) => {
            const hasDataKey = el.querySelector('[data-grid-key="topItems"]');
            const hasClass = el.querySelector('.top-items-expandable');
            const hasKey = el.getAttribute('key') === 'topItems';
            return hasDataKey || hasClass || hasKey;
          }
        );
        
        const insightsGridItem = Array.from(document.querySelectorAll('.react-grid-item')).find(
          (el) => {
            const hasDataKey = el.querySelector('[data-grid-key="insights"]');
            const hasKey = el.getAttribute('key') === 'insights';
            return hasDataKey || hasKey;
          }
        );
        
        if (!topItemsGridItem || !insightsGridItem) {
          isProcessing = false;
          return;
        }
        
        const layoutContainer = topItemsGridItem.closest('.react-grid-layout');
        if (!layoutContainer) {
          isProcessing = false;
          return;
        }
        
        // Get actual rendered positions
        const topItemsRect = topItemsGridItem.getBoundingClientRect();
        const insightsRect = insightsGridItem.getBoundingClientRect();
        const containerRect = layoutContainer.getBoundingClientRect();
        
        // Calculate positions relative to container
        const topItemsBottom = topItemsRect.bottom - containerRect.top;
        const insightsTop = insightsRect.top - containerRect.top;
        
        // Always ensure topItems can expand
        (topItemsGridItem as HTMLElement).style.setProperty('height', 'auto', 'important');
        (topItemsGridItem as HTMLElement).style.setProperty('overflow', 'visible', 'important');
        (topItemsGridItem as HTMLElement).style.setProperty('min-height', '100%', 'important');
        
        // Position Insights directly at the bottom of Top Items (no gap)
        // Calculate how much to push Insights down to sit right below Top Items
        const pushDown = topItemsBottom - insightsTop;
        
        if (pushDown > 0) {
          // Push Insights down to sit directly below Top Items
          const newTransform = `translateY(${pushDown}px)`;
          
          // Only update if transform has changed
          if (lastAppliedTransform !== newTransform) {
            (insightsGridItem as HTMLElement).style.setProperty('transform', newTransform, 'important');
            (insightsGridItem as HTMLElement).style.setProperty('position', 'relative', 'important');
            (insightsGridItem as HTMLElement).style.setProperty('z-index', '1', 'important');
            lastAppliedTransform = newTransform;
          }
        } else {
          // Reset transform if Insights is already positioned correctly
          if (lastAppliedTransform !== '') {
            (insightsGridItem as HTMLElement).style.setProperty('transform', '', 'important');
            lastAppliedTransform = '';
          }
        }
      } catch (e) {
        // Silently fail if elements not found
      } finally {
        isProcessing = false;
      }
    };
    
    // Throttle function to prevent excessive calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledPreventOverlap = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        preventOverlap();
        throttleTimeout = null;
      }, 100); // Throttle to max once per 100ms
    };
    
    // Run immediately and set up delayed checks
    preventOverlap();
    const timeoutId1 = setTimeout(preventOverlap, 100);
    const timeoutId2 = setTimeout(preventOverlap, 300);
    
    // Use ResizeObserver to watch for topItems height changes (throttled)
    let resizeObserver: ResizeObserver | null = null;
    const topItemsElement = document.querySelector('.top-items-expandable') || document.querySelector('[data-grid-key="topItems"]');
    if (topItemsElement && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        throttledPreventOverlap();
      });
      resizeObserver.observe(topItemsElement);
    }
    
    // Use MutationObserver to catch when react-grid-layout updates styles (throttled)
    let mutationObserver: MutationObserver | null = null;
    const layoutContainer = document.querySelector('.react-grid-layout');
    if (layoutContainer) {
      mutationObserver = new MutationObserver(() => {
        throttledPreventOverlap();
      });
      mutationObserver.observe(layoutContainer, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        subtree: true,
      });
    }
    
    // Window resize handler (throttled)
    const resizeHandler = () => {
      throttledPreventOverlap();
    };
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      window.removeEventListener('resize', resizeHandler);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [visibleSections.topItems, visibleSections.insights]);

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
    xxs: layouts.xxs?.filter(l => visibleSections[l.i as keyof DashboardSections]) || [],
  };

  // Don't render until initialized to avoid flash of empty state
  if (!isInitialized) {
    return (
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 overflow-x-hidden">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-3 sm:pb-4 md:pb-6 lg:pb-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-foreground text-xl sm:text-2xl mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">Drag and resize sections to customize your layout</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => {
              setIsEditMode(!isEditMode);
              toast.success(isEditMode ? "Edit mode disabled" : "Edit mode enabled - drag to rearrange");
            }}
            size="sm"
            className="gap-2 h-8 px-3 text-xs"
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden sm:inline">{isEditMode ? "Done Editing" : "Edit Layout"}</span>
            <span className="sm:hidden">{isEditMode ? "Done" : "Edit"}</span>
          </Button>
          <Sheet open={customizeSheetOpen} onOpenChange={setCustomizeSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 px-3 text-xs">
                <LayoutGrid className="w-3 h-3" />
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
        <div className="w-full">
          <ResponsiveGridLayout
            className="layout"
            layouts={visibleLayouts}
            useCSSTransforms={false}
            measureBeforeMount={false}
            autoSize={true}
            breakpoints={{ 
              lg: 1920,   // 1920px+
              md: 1280,   // 1280px-1919px
              sm: 768,    // 768px-1279px
              xs: 414,    // 414px-767px
              xxs: 320    // 320px-413px
            }}
            cols={{ 
              lg: 12,     // 1920px+
              md: 10,     // 1280px-1919px
              sm: 6,      // 768px-1279px
              xs: 4,      // 414px-767px
              xxs: 2      // 320px-413px
            }}
            rowHeight={windowWidth < 414 ? 50 : windowWidth < 768 ? 55 : 60}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={(currentLayout, allLayouts) => {
              handleLayoutChange(currentLayout, allLayouts);
              // Note: Overlap prevention is handled by MutationObserver in useEffect
              // No need for duplicate logic here to avoid excessive DOM manipulations
            }}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
            margin={{
              lg: [8, 6],     // 1920px+
              md: [6, 6],     // 1280px-1919px
              sm: [6, 4],     // 768px-1279px
              xs: [4, 4],     // 414px-767px
              xxs: [4, 2]     // 320px-413px
            }}
          >
          {visibleSections.kpis && (
            <div key="kpis">
              <Card className={`bg-card border-border elevation-sm p-3 sm:p-4 ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move mb-2 p-1.5 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-card border border-border elevation-sm cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation p-3 sm:p-4 rounded-lg"
                      onClick={kpi.onClick}
                    >
                      <div className="flex items-start justify-between mb-2">
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
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {visibleSections.quickActions && (
            <div key="quickActions">
              <Card className={`bg-card border-border elevation-sm p-3 sm:p-4 ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move mb-2 p-1.5 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                  <Button 
                    onClick={() => onNavigate("addItem")} 
                    className="flex-1 w-full bg-primary text-white hover:!bg-secondary transition-colors min-h-[44px] touch-manipulation"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                  <Button onClick={() => onNavigate("assignToJob")} variant="outline" className="flex-1 w-full min-h-[44px] touch-manipulation">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {visibleSections.aiAssistant && (
            <div key="aiAssistant" className="ai-assistant-expandable">
              <div className={isEditMode ? 'cursor-move' : ''}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move border border-border mb-2 p-1.5 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
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
              <Card className={`bg-card border-border elevation-sm h-full overflow-auto p-3 sm:p-4 ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move mb-2 p-1.5 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
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
                        <Button variant="outline" size="sm" className="gap-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
            <div 
              key="topItems" 
              ref={(node) => {
                if (node) {
                  // Override react-grid-layout's inline height style
                  const gridItem = node.closest('.react-grid-item');
                  if (gridItem) {
                    (gridItem as HTMLElement).style.height = 'auto';
                    (gridItem as HTMLElement).style.minHeight = '100%';
                    (gridItem as HTMLElement).style.overflow = 'visible';
                  }
                }
              }}
              className="top-items-expandable"
            >
              <Card className={`bg-card border-border elevation-sm flex flex-col p-3 sm:p-4 ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move mb-2 p-1.5 rounded-lg flex-shrink-0">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="mb-2 flex-shrink-0">
                  <h2 className="text-foreground mb-1">Top 5 Most-Used</h2>
                  <p className="text-muted-foreground">Your most frequently used items</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {topItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div
                        key={item.id}
                        className="border border-border cursor-pointer hover:bg-muted transition-colors flex flex-col touch-manipulation p-3 rounded-lg"
                        onClick={() => handleTopItemClick(item)}
                      >
                        <div className="relative mb-2 flex-shrink-0">
                          <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden rounded-md p-4">
                            {item.imageUrl ? (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          
                        </div>
                        <h4 className="text-foreground mb-2 overflow-hidden text-ellipsis line-clamp-2 min-h-[2.5rem]">{item.name}</h4>
                        <div className="flex items-center justify-between gap-2 mt-auto">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <p className="text-muted-foreground whitespace-nowrap">
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
            <div key="insights" data-grid-key="insights">
              <Card className={`bg-card border-border elevation-sm h-full p-3 sm:p-4 ${isEditMode ? 'cursor-move' : ''}`}>
                {isEditMode && (
                  <div className="drag-handle flex items-center justify-center bg-muted cursor-move mb-2 p-1.5 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Drag to move</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground">Insights</h3>
                </div>
                <h4 className="text-foreground mb-2">Usage Trends</h4>
                <p className="text-muted-foreground mb-2">
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
        </div>
      )}
    </div>
  );
}
