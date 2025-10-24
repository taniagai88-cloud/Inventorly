import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Activity,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Badge } from "./ui-custom/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AppHeader } from "./AppHeader";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import deskImage from "figma:asset/d1da7464c1ebcc24a1502c17d6987fa88a4fb5f3.png";
import chairImage from "figma:asset/af97294c1da1ac8535a59452f21be667a162fcff.png";
import floorLampImage from "figma:asset/690d82d765bc87a642e654c45ff62e78d98609e6.png";
import roundTableImage from "figma:asset/f3605307254b8a3a82abb076d58585719cbd4246.png";
import oliveTreeImage from "figma:asset/c47166bb3e07ff395671cb27cc14e05ec42d5841.png";

interface ReportsInsightsProps {
  userName: string;
  businessName: string;
  onBack: () => void;
  onViewItem?: (itemId: number) => void;
  selectedItemId?: number;
  onNavigate?: (page: "dashboard" | "library" | "reports") => void;
}

// Mock data for ROI overview
const roiData = [
  { name: "Positive ROI", value: 78, color: "var(--chart-1)" },
  { name: "Breakeven", value: 15, color: "var(--chart-3)" },
  { name: "Negative ROI", value: 7, color: "var(--chart-4)" },
];

// Mock data for utilization over time
const utilizationData = [
  { month: "Jan", utilization: 65, revenue: 12500 },
  { month: "Feb", utilization: 70, revenue: 14200 },
  { month: "Mar", utilization: 68, revenue: 13800 },
  { month: "Apr", utilization: 75, revenue: 16200 },
  { month: "May", utilization: 82, revenue: 18900 },
  { month: "Jun", utilization: 88, revenue: 21500 },
];

// Mock data for top performing items
const topPerformingItems = [
  {
    id: 2,
    name: "Modern Lounge Chair",
    category: "Seating",
    image: chairImage,
    roi: 3200,
    roiPercent: 711,
    utilization: 92,
    revenue: 4800,
  },
  {
    id: 1,
    name: "Executive Standing Desk",
    category: "Office Furniture",
    image: deskImage,
    roi: 2800,
    roiPercent: 622,
    utilization: 88,
    revenue: 3900,
  },
  {
    id: 5,
    name: "Round Conference Table",
    category: "Office Furniture",
    image: roundTableImage,
    roi: 2500,
    roiPercent: 556,
    utilization: 85,
    revenue: 3500,
  },
  {
    id: 4,
    name: "Industrial Floor Lamp",
    category: "Lighting",
    image: floorLampImage,
    roi: 1800,
    roiPercent: 500,
    utilization: 78,
    revenue: 2400,
  },
  {
    id: 6,
    name: "Decorative Olive Tree",
    category: "Decor",
    image: oliveTreeImage,
    roi: 1200,
    roiPercent: 400,
    utilization: 70,
    revenue: 1800,
  },
];

// Mock AI insights
const predictiveInsights = [
  {
    id: 1,
    type: "demand",
    icon: TrendingUp,
    title: "Increased Demand Forecast",
    message:
      "Based on booking patterns, you'll need 15-20 more chairs by March 2026 to meet demand for spring events.",
    priority: "high",
  },
  {
    id: 2,
    type: "maintenance",
    icon: Activity,
    title: "Maintenance Schedule Alert",
    message:
      "5 items are approaching maintenance cycles. Schedule servicing to maintain high utilization rates.",
    priority: "medium",
  },
  {
    id: 3,
    type: "opportunity",
    icon: Lightbulb,
    title: "Revenue Opportunity",
    message:
      "Modern Lounge Chairs have 92% utilization. Consider purchasing 3-5 more units to capture unmet demand worth ~$2,400/month.",
    priority: "high",
  },
  {
    id: 4,
    type: "trend",
    icon: TrendingDown,
    title: "Seasonal Trend Alert",
    message:
      "Outdoor decor items typically see 40% lower demand in winter months. Plan inventory accordingly.",
    priority: "low",
  },
];

export function ReportsInsights({ userName, businessName, onBack, onViewItem, selectedItemId, onNavigate }: ReportsInsightsProps) {
  const averageROI = 2500; // Mock average ROI
  const totalRevenue = 21500; // Mock total revenue

  // Filter items if a specific item is selected
  const filteredItems = selectedItemId 
    ? topPerformingItems.filter(item => item.id === selectedItemId)
    : topPerformingItems;

  const handleViewItem = (itemId: number) => {
    if (onViewItem) {
      onViewItem(itemId);
    }
  };

  const handleNavigate = (page: "dashboard" | "library" | "reports") => {
    if (onNavigate) {
      onNavigate(page);
    } else if (page === "dashboard") {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        userName={userName}
        businessName={businessName}
        currentPage="reports"
        onNavigate={handleNavigate}
      />
      
      {/* Page Title */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-1">Reports & Insights</h2>
          <p className="text-muted-foreground">
            {selectedItemId 
              ? `Showing reports for ${filteredItems[0]?.name || 'selected item'}`
              : 'Track performance and optimize your inventory'
            }
          </p>
        </div>
      </div>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* ROI Overview & Utilization Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Overview - Donut Chart */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3>ROI Overview</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    Average return on investment across all items
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={roiData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roiData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="text-center mt-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <DollarSign className="w-6 h-6 text-primary" />
                      <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--font-weight-medium)" }}>
                        {averageROI.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                      Average ROI per item
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border">
                  {roiData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span style={{ fontSize: "var(--text-sm)" }}>
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Utilization Graph */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3>Utilization Trends</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    Monthly utilization rate and revenue
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="month"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: "var(--text-xs)" }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: "var(--text-xs)" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: "var(--text-xs)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="utilization"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      name="Utilization %"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      name="Revenue $"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Performing Items */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3>Top Performing Items</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    Highest ROI inventory sorted by performance
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Top 5
                </Badge>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleViewItem(item.id)}
                    className="flex items-center gap-4 p-4 border border-border rounded-[var(--radius)] hover:border-primary hover:bg-accent cursor-pointer transition-all group"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Item Image */}
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-[var(--radius-sm)] border border-border shrink-0"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate">{item.name}</h4>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "var(--text-sm)" }}>
                        {item.category}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
                          ROI
                        </p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {item.roi.toLocaleString()}
                          </span>
                          <span className="text-primary" style={{ fontSize: "var(--text-xs)" }}>
                            (+{item.roiPercent}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
                          Utilization
                        </p>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-chart-3" />
                          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {item.utilization}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
                          Revenue
                        </p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-chart-1" />
                          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {item.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Predictive Insights */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3>Predictive Insights</h3>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                  AI-powered recommendations to optimize your inventory
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictiveInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  const priorityColors = {
                    high: "text-primary",
                    medium: "text-chart-3",
                    low: "text-muted-foreground",
                  };
                  const priorityBgColors = {
                    high: "bg-primary/10",
                    medium: "bg-chart-3/10",
                    low: "bg-muted",
                  };

                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-border rounded-[var(--radius)] hover:border-primary hover:bg-accent transition-all"
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] ${
                            priorityBgColors[insight.priority as keyof typeof priorityBgColors]
                          } shrink-0`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              priorityColors[insight.priority as keyof typeof priorityColors]
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4>{insight.title}</h4>
                            <Badge
                              variant={insight.priority === "high" ? "default" : "secondary"}
                              className="shrink-0"
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
