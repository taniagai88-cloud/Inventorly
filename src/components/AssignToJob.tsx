import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Package, MapPin, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import type { AppState, InventoryItem, JobAssignment } from "../types";
import { getSetting } from "../utils/settings";
import { getStagingStatus } from "../utils/projectUtils";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AssignToJobProps {
  item?: InventoryItem;
  onNavigate: (state: AppState, data?: any) => void;
  onCreateJob: (job: JobAssignment) => void;
  jobAssignments?: JobAssignment[];
  onUpdateJob?: (job: JobAssignment) => void;
}

export function AssignToJob({ item, onNavigate, onCreateJob, jobAssignments = [], onUpdateJob }: AssignToJobProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [stagingDate, setStagingDate] = useState<Date>();
  const [stagingDateOption, setStagingDateOption] = useState<"date" | "tbd">("tbd");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get active projects
  const activeProjects = jobAssignments.filter(job => job.status === "active");

  const handleAssignToExistingProject = async (project: JobAssignment) => {
    if (!item || !onUpdateJob) return;

    if (item.availableQuantity === 0) {
      toast.error("No items available");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add item to project's itemIds
    const existingItemIds = project.itemIds || [];
    const updatedItemIds = [...existingItemIds, item.id];
    const updatedProject: JobAssignment = {
      ...project,
      itemIds: updatedItemIds,
    };

    onUpdateJob(updatedProject);

    toast.success(`${item.name} assigned to ${project.clientName || project.shortAddress || project.jobLocation}`);
    setIsLoading(false);
    onNavigate("itemDetail", { item });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !jobLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (item && parseInt(quantity) > (item?.availableQuantity || 0)) {
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
      jobLocation,
      startDate: startDate,
      endDate: endDate,
      quantity: item ? parseInt(quantity) : 0,
      notes,
      assignedBy: "Current User",
      status: "active",
      stagingDate: stagingDate,
      stagingStatus: stagingDate ? getStagingStatus({ stagingDate } as JobAssignment) : undefined,
      clientName: clientName,
      clientEmail: clientEmail || undefined,
      shortAddress: jobLocation.split(",")[0],
      fullAddress: jobLocation,
      itemIds: item ? [item.id] : [],
    };

    onCreateJob(newJob);

    toast.success(
      item
        ? `${item.name} assigned to ${clientName}`
        : `Project "${clientName}" created successfully`
    );

    // Reset form
    setShowCreateForm(false);
    setClientName("");
    setJobLocation("");
    setClientEmail("");
    setStagingDate(undefined);
    setStagingDateOption("tbd");
    setQuantity("1");
    setNotes("");

    if (item) {
      // If assigning from item detail, go back to item detail
      onNavigate("itemDetail", { item });
    } else {
      // Otherwise go to project detail
      onNavigate("projectDetail", { project: newJob });
    }
  };

  // If item is provided, show dialog overlay with projects
  if (item) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onNavigate("itemDetail", { item })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground leading-snug">
              Assign {item.name} to Project
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground leading-relaxed">
              Select an existing project or create a new one
            </DialogDescription>
          </DialogHeader>

          {/* Item Info */}
          <Card className="bg-muted border-0 p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-medium text-foreground mb-1 leading-normal">{item.name}</h4>
                <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                  Available: {item.availableQuantity} of {item.totalQuantity}
                </p>
              </div>
            </div>
          </Card>

          {!showCreateForm ? (
            <>
              {/* Existing Projects List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-medium text-foreground leading-snug">Select a Project</h3>
                {activeProjects.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-card border-border elevation-sm p-4 cursor-pointer hover:elevation-md transition-shadow"
                        onClick={() => handleAssignToExistingProject(project)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-foreground mb-1 leading-normal">
                              {project.clientName || project.shortAddress || project.jobLocation}
                            </h4>
                            <div className="flex items-center gap-4 mt-2">
                              {project.jobLocation && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{project.shortAddress || project.jobLocation}</span>
                                </div>
                              )}
                              {project.stagingDate && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{format(project.stagingDate, "MMM d, yyyy")}</span>
                                </div>
                              )}
                            </div>
                            {project.itemIds && project.itemIds.length > 0 && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {project.itemIds.length} item{project.itemIds.length !== 1 ? "s" : ""} assigned
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignToExistingProject(project);
                            }}
                            disabled={isLoading}
                          >
                            Assign
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                      No projects available. Create a new project to assign this item.
                    </p>
                  </div>
                )}
              </div>

              {/* Create New Project Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Create New Project Form */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground leading-snug">Create New Project</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Back to Projects
                  </Button>
                </div>

                <Card className="bg-card border-border elevation-sm p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        Client Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter client name"
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
                      <Label htmlFor="clientEmail">
                        Client Email
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@example.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        If you don't add an email, you won't be able to send an invoice.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>
                        Requested Staging Date
                      </Label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="stagingDate-select"
                            name="stagingDateOption"
                            checked={stagingDateOption === "date"}
                            onChange={() => {
                              setStagingDateOption("date");
                            }}
                            className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                          />
                          <Label htmlFor="stagingDate-select" className="cursor-pointer font-normal">
                            Select a date
                          </Label>
                        </div>
                        {stagingDateOption === "date" && (
                          <div className="ml-6">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  type="button"
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
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="stagingDate-tbd"
                            name="stagingDateOption"
                            checked={stagingDateOption === "tbd"}
                            onChange={() => {
                              setStagingDateOption("tbd");
                              setStagingDate(undefined);
                            }}
                            className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                          />
                          <Label htmlFor="stagingDate-tbd" className="cursor-pointer font-normal">
                            To be determined
                          </Label>
                        </div>
                      </div>
                    </div>

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
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !clientName ||
                          !jobLocation ||
                          parseInt(quantity) > item.availableQuantity
                        }
                        className="flex-1"
                      >
                        {isLoading ? "Creating..." : "Create & Assign"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Original full-page form when no item is provided
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
              onClick={() => onNavigate("library")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6 leading-snug">Assign to Job</h2>

          {/* Form */}
          <Card className="bg-card border-border elevation-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
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
                <Label htmlFor="clientEmail">
                  Client Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  If you don't add an email, you won't be able to send an invoice.
                </p>
              </div>

              <div className="space-y-3">
                <Label>
                  Requested Staging Date
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="stagingDate-select"
                      name="stagingDateOption"
                      checked={stagingDateOption === "date"}
                      onChange={() => {
                        setStagingDateOption("date");
                      }}
                      className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                    />
                    <Label htmlFor="stagingDate-select" className="cursor-pointer font-normal">
                      Select a date
                    </Label>
                  </div>
                  {stagingDateOption === "date" && (
                    <div className="ml-6">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            type="button"
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
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="stagingDate-tbd"
                      name="stagingDateOption"
                      checked={stagingDateOption === "tbd"}
                      onChange={() => {
                        setStagingDateOption("tbd");
                        setStagingDate(undefined);
                      }}
                      className="h-4 w-4 text-accent border-border focus:ring-accent cursor-pointer"
                    />
                    <Label htmlFor="stagingDate-tbd" className="cursor-pointer font-normal">
                      To be determined
                    </Label>
                  </div>
                </div>
              </div>

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
                  onClick={() => onNavigate("dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !clientName ||
                    !jobLocation
                  }
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
