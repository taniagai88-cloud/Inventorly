import { useState } from "react";
import { motion } from "motion/react";
import {
  Package,
  CheckCircle2,
  DollarSign,
  Activity,
  Download,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { getAccurateItemQuantities } from "../utils/projectUtils";

interface ReportsInsightsProps {
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
  selectedItem?: InventoryItem | null;
  jobAssignments?: JobAssignment[];
}

export function ReportsInsights({ items, onNavigate, selectedItem, jobAssignments = [] }: ReportsInsightsProps) {
  const [dateRange, setDateRange] = useState("30days");

  // Calculate accurate quantities based on project assignments
  const activeProjects = jobAssignments.filter(job => job.status === "active");
  const itemsWithAccurateQuantities = items.map(item => {
    const accurateQuantities = getAccurateItemQuantities(item, activeProjects);
    return { ...item, ...accurateQuantities };
  });
  
  const totalItems = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.totalQuantity, 0);
  const itemsInUse = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.inUseQuantity, 0);
  const totalValue = itemsWithAccurateQuantities.reduce((sum, item) => sum + item.purchaseCost * item.totalQuantity, 0);
  const avgUtilization = Math.round((itemsInUse / totalItems) * 100);

  const kpis = [
    {
      label: "Total Items",
      value: totalItems.toString(),
      change: 12,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Items in Use",
      value: itemsInUse.toString(),
      change: 8,
      icon: CheckCircle2,
      color: "text-chart-3",
    },
    {
      label: "ROI Summary",
      value: `$${Math.round(totalValue * 0.25).toLocaleString()}`,
      change: 15,
      icon: DollarSign,
      color: "text-chart-4",
    },
    {
      label: "Avg. Utilization",
      value: `${avgUtilization}%`,
      change: 5,
      icon: Activity,
      color: "text-chart-2",
    },
  ];

  // Mock chart data
  const usageData = [
    { date: "Oct 1", items: 45 },
    { date: "Oct 8", items: 52 },
    { date: "Oct 15", items: 58 },
    { date: "Oct 22", items: 65 },
    { date: "Oct 29", items: itemsInUse },
  ];

  const categoryData = itemsWithAccurateQuantities.reduce((acc, item) => {
    const existing = acc.find((c) => c.category === item.category);
    if (existing) {
      existing.count += item.totalQuantity;
    } else {
      acc.push({ category: item.category, count: item.totalQuantity });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  const revenueData = [
    { month: "May", revenue: 12500 },
    { month: "Jun", revenue: 15800 },
    { month: "Jul", revenue: 18200 },
    { month: "Aug", revenue: 21500 },
    { month: "Sep", revenue: 24800 },
    { month: "Oct", revenue: 28300 },
  ];

  const topPerformers = [...itemsWithAccurateQuantities]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      revenue: Math.round(item.usageCount * item.purchaseCost * 0.1),
      utilization: Math.round((item.inUseQuantity / item.totalQuantity) * 100),
    }));

  const lowStockItems = itemsWithAccurateQuantities.filter((item) => item.availableQuantity <= 3);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "Item,Category,Total Uses,Revenue\n" +
      topPerformers.map(item => `${item.name},${item.category},${item.usageCount},$${item.revenue}`).join("\n");
    
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "inventory-report.csv";
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground leading-snug">Reports & Insights</h2>
            {selectedItem && (
              <p className="text-sm font-normal text-muted-foreground mt-1 leading-relaxed">
                Viewing insights for: {selectedItem.name}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Selected Item Banner */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-primary/10 border-primary p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-medium text-foreground leading-snug">{selectedItem.name}</h3>
                    <Badge variant="outline">{selectedItem.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Total Uses</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{selectedItem.usageCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Total Quantity</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{selectedItem.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">In Use</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">{selectedItem.inUseQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 leading-normal">Utilization</p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">
                        {Math.round((selectedItem.inUseQuantity / selectedItem.totalQuantity) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("reports")}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border elevation-sm p-6">
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

        {/* Charts */}
        <div className="space-y-6 mb-8">
          {/* Usage Over Time */}
          <Card className="bg-card border-border elevation-sm p-6">
            <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Inventory Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
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
                  dataKey="items"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Items in Use"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items by Category */}
            <Card className="bg-card border-border elevation-sm p-6">
              <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Items by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="category" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue Generated */}
            <Card className="bg-card border-border elevation-sm p-6">
              <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Revenue Generated</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-3)"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Top Performing Items Table */}
        <Card className="bg-card border-border elevation-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Top Performing Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item Name</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Uses</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border cursor-pointer hover:bg-muted ${
                      selectedItem?.id === item.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => onNavigate("itemDetail", { item })}
                  >
                    <td className="p-3 text-sm font-normal text-foreground leading-relaxed">{item.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="p-3 text-sm font-normal text-foreground leading-relaxed">{item.usageCount}</td>
                    <td className="p-3 text-sm font-normal text-foreground leading-relaxed">${item.revenue.toLocaleString()}</td>
                    <td className="p-3 text-sm font-normal text-foreground leading-relaxed">{item.utilization}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alerts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card className="bg-card border-border elevation-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-chart-4" />
              <h3 className="text-lg font-medium text-foreground leading-snug">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-border transition-colors"
                    onClick={() => onNavigate("itemDetail", { item })}
                  >
                    <h4 className="text-base font-medium text-foreground mb-1 leading-normal">{item.name}</h4>
                    <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                      Only {item.availableQuantity} available
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-normal text-muted-foreground leading-relaxed">No low stock items</p>
              )}
            </div>
          </Card>

          {/* Insights Summary */}
          <Card className="bg-card border-border elevation-sm p-6">
            <h3 className="text-lg font-medium text-foreground mb-6 leading-snug">Key Insights</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-medium text-foreground mb-2 leading-normal">Most Used Items</h4>
                <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                  {topPerformers[0]?.name} leads with {topPerformers[0]?.usageCount} uses,
                  followed by {topPerformers[1]?.name}.
                </p>
              </div>
              <div>
                <h4 className="text-base font-medium text-foreground mb-2 leading-normal">Utilization Trends</h4>
                <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                  Overall utilization has increased by 8% this month. Consider expanding
                  your {categoryData[0]?.category} inventory.
                </p>
              </div>
              <div>
                <h4 className="text-base font-medium text-foreground mb-2 leading-normal">Cost Optimization</h4>
                <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                  High-frequency items are generating strong ROI. Review underutilized
                  items for potential reallocation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
