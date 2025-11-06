import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { getSetting } from "../utils/settings";

interface AssignToJobProps {
  item?: InventoryItem;
  onNavigate: (state: AppState, data?: any) => void;
  onCreateJob: (job: JobAssignment) => void;
}

export function AssignToJob({ item, onNavigate, onCreateJob }: AssignToJobProps) {
  const [jobName, setJobName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [stagingDate, setStagingDate] = useState<Date>();
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobName || !jobLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (item && parseInt(quantity) > item.availableQuantity) {
      toast.error(`Only ${item.availableQuantity} items available`);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use stagingDate if provided, otherwise use today's date
    const contractDuration = getSetting("contractDuration");
    const startDate = stagingDate || new Date();
    const endDate = stagingDate 
      ? new Date(stagingDate.getTime() + contractDuration * 24 * 60 * 60 * 1000) // Contract duration from settings
      : new Date(startDate.getTime() + contractDuration * 24 * 60 * 60 * 1000); // Contract duration from settings

    // Create new job assignment
    const newJob: JobAssignment = {
      id: `job-${Date.now()}`,
      itemId: item?.id || "",
      jobName,
      jobLocation,
      startDate: startDate,
      endDate: endDate,
      quantity: item ? parseInt(quantity) : 0,
      notes,
      assignedBy: "Current User",
      status: "active",
      stagingDate: stagingDate,
      stagingStatus: stagingDate ? "upcoming" : undefined,
      clientName: jobName,
      shortAddress: jobLocation.split(",")[0],
      fullAddress: jobLocation,
      itemIds: item ? [item.id] : [],
    };

    onCreateJob(newJob);

    toast.success(
      item
        ? `${item.name} assigned to ${jobName}`
        : `Job "${jobName}" created successfully`
    );

    onNavigate("projectDetail", { project: newJob });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate(item ? "itemDetail" : "library")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <h2 className="text-foreground mb-6">Assign to Job</h2>

          {/* Item Info (if coming from item detail) */}
          {item && (
            <Card className="bg-muted border-0 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-foreground mb-1">{item.name}</h4>
                  <p className="text-muted-foreground">
                    Available: {item.availableQuantity} of {item.totalQuantity}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Form */}
          <Card className="bg-card border-border elevation-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobName">
                  Job/Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobName"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Enter job name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobLocation">
                  Job Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobLocation"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Requested Staging Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
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

              {item && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity to Assign</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={item.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {parseInt(quantity) > item.availableQuantity && (
                    <p className="text-destructive">
                      Only {item.availableQuantity} items available
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate(item ? "itemDetail" : "dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !jobName ||
                    !jobLocation ||
                    (item && parseInt(quantity) > item.availableQuantity)
                  }
                  className="flex-1"
                >
                  {isLoading 
                    ? (item ? "Assigning..." : "Creating...") 
                    : (item ? "Assign Item" : "Create")}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
