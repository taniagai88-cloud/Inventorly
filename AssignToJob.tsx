import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  Package,
  Briefcase,
  X,
  Check,
  Search,
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Label } from "./ui-custom/label";
import { Input } from "./ui-custom/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui-custom/select";
import { Calendar } from "./ui-custom/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui-custom/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui-custom/dialog";
import { Badge } from "./ui-custom/badge";
import { Checkbox } from "./ui-custom/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";
import screenImage from "figma:asset/0d139f55c7ec7b449bb659812e83bc0fd6846324.png";
import deskImage from "figma:asset/d1da7464c1ebcc24a1502c17d6987fa88a4fb5f3.png";
import chairImage from "figma:asset/af97294c1da1ac8535a59452f21be667a162fcff.png";
import floorLampImage from "figma:asset/690d82d765bc87a642e654c45ff62e78d98609e6.png";
import roundTableImage from "figma:asset/f3605307254b8a3a82abb076d58585719cbd4246.png";
import oliveTreeImage from "figma:asset/c47166bb3e07ff395671cb27cc14e05ec42d5841.png";
import beigeChairImage from "figma:asset/bf3e3b2adbbf51a3685ccb430cd7f99f62425330.png";
import juteRugImage from "figma:asset/f5a2d9644fffe5e34bfd23da01cfaaa2b7ee4a7a.png";
import oliveGreenPillowImage from "figma:asset/76b3695f8fd53782b957f65619ca621ff4a6454e.png";
import woodenBedImage from "figma:asset/a76222775f9255aefbcfeeda97001c3a2820fb74.png";
import goldBarCartImage from "figma:asset/7c88476d06e9bfb8e21678c9b9ce829a2c9129da.png";
import diamondJuteRugImage from "figma:asset/2c489e62b99b8b4f0d5e5eca8520aa88995ac72b.png";
import { toast } from "sonner@2.0.3";

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: "Summer Wedding - Smith & Johnson",
    date: new Date(2025, 5, 15),
    location: "Grand Hotel Ballroom",
    status: "active",
  },
  {
    id: 2,
    name: "Corporate Conference - TechCorp",
    date: new Date(2025, 4, 20),
    location: "Convention Center",
    status: "active",
  },
  {
    id: 3,
    name: "Birthday Party - Miller Family",
    date: new Date(2025, 4, 5),
    location: "Garden Venue",
    status: "completed",
  },
];

// Mock inventory items
const mockInventoryItems = [
  {
    id: 2,
    name: "Modern Lounge Chair",
    category: "Furniture",
    image: chairImage,
    status: "available",
  },
  {
    id: 3,
    name: "Professional Display Screen",
    category: "Electronics",
    image: screenImage,
    status: "available",
  },
  {
    id: 4,
    name: "Adjustable Workstation",
    category: "Furniture",
    image: deskImage,
    status: "in-use",
  },
  {
    id: 5,
    name: "Curved Accent Chair",
    category: "Furniture",
    image: beigeChairImage,
    status: "available",
  },
  {
    id: 6,
    name: "Natural Jute Area Rug",
    category: "Decor",
    image: juteRugImage,
    status: "available",
  },
  {
    id: 7,
    name: "Olive Velvet Throw Pillow",
    category: "Decor",
    image: oliveGreenPillowImage,
    status: "available",
  },
  {
    id: 8,
    name: "Natural Oak Platform Bed",
    category: "Furniture",
    image: woodenBedImage,
    status: "in-use",
  },
  {
    id: 9,
    name: "Brass Bar Cart",
    category: "Furniture",
    image: goldBarCartImage,
    status: "available",
  },
  {
    id: 10,
    name: "Contemporary Round Table",
    category: "Furniture",
    image: roundTableImage,
    status: "available",
  },
  {
    id: 11,
    name: "Diamond Weave Jute Rug",
    category: "Decor",
    image: diamondJuteRugImage,
    status: "available",
  },
  {
    id: 12,
    name: "Modern Gold Floor Lamp",
    category: "Lighting",
    image: floorLampImage,
    status: "available",
  },
  {
    id: 13,
    name: "Decorative Olive Tree",
    category: "Decor",
    image: oliveTreeImage,
    status: "available",
  },
];

interface AssignToJobProps {
  onBack: () => void;
  preSelectedItems?: number[];
}

export function AssignToJob({ onBack, preSelectedItems = [] }: AssignToJobProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [assignedItemIds, setAssignedItemIds] = useState<number[]>(preSelectedItems);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddItemsOpen, setIsAddItemsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New project form
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");
  const [newProjectDate, setNewProjectDate] = useState<Date | undefined>(undefined);

  const selectedProject = mockProjects.find(p => p.id.toString() === selectedProjectId);
  const assignedItems = mockInventoryItems.filter(item => assignedItemIds.includes(item.id));
  const availableItems = mockInventoryItems.filter(
    item => !assignedItemIds.includes(item.id) && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    // In a real app, this would create a new project in the database
    toast.success("Project created successfully!");
    setNewProjectName("");
    setNewProjectLocation("");
    setNewProjectDate(undefined);
    setIsCreateProjectOpen(false);
  };

  const handleAddItems = (itemId: number) => {
    if (assignedItemIds.includes(itemId)) {
      setAssignedItemIds(assignedItemIds.filter(id => id !== itemId));
    } else {
      setAssignedItemIds([...assignedItemIds, itemId]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setAssignedItemIds(assignedItemIds.filter(id => id !== itemId));
  };

  const handleSaveAssignment = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    if (assignedItemIds.length === 0) {
      toast.error("Please assign at least one item");
      return;
    }

    // In a real app, this would save the assignment to the database
    toast.success(`Successfully assigned ${assignedItemIds.length} items to ${selectedProject?.name}`);
    
    // Reset form
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  return (
    <div className="size-full bg-background overflow-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card sticky top-0 z-10"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Inventorly" className="h-8" />
            <h3>Assign Items to Job</h3>
          </div>
        </div>
      </motion.header>

      <main className="p-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Project Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <h3>Select Project</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="project">Project</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger id="project" className="mt-2">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{project.name}</span>
                            {project.status === "completed" && (
                              <Badge variant="outline" className="bg-muted">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Add a new project to assign inventory items.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="projectName">Project Name</Label>
                          <Input
                            id="projectName"
                            placeholder="e.g., Summer Wedding - Smith & Johnson"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="projectLocation">Location</Label>
                          <Input
                            id="projectLocation"
                            placeholder="e.g., Grand Hotel Ballroom"
                            value={newProjectLocation}
                            onChange={(e) => setNewProjectLocation(e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Event Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start gap-2 mt-2"
                              >
                                <CalendarIcon className="w-4 h-4" />
                                {newProjectDate ? (
                                  newProjectDate.toLocaleDateString()
                                ) : (
                                  <span className="text-muted-foreground">Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newProjectDate}
                                onSelect={setNewProjectDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateProjectOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProject} className="flex-1">
                            Create Project
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Project Details */}
              {selectedProject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-accent p-4 rounded-[var(--radius)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{selectedProject.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Event Date:</span>
                    <span>{selectedProject.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={selectedProject.status === "active" ? "default" : "outline"}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Delivery Date */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <h3>Delivery Date</h3>
            </div>

            <div>
              <Label>When do you need these items?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 mt-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {deliveryDate ? (
                      deliveryDate.toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </Card>

          {/* Assigned Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <h3>Assigned Items</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {assignedItemIds.length}
                </Badge>
              </div>

              <Dialog open={isAddItemsOpen} onOpenChange={setIsAddItemsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Items
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Items to Assignment</DialogTitle>
                    <DialogDescription>
                      Select inventory items to add to this job assignment.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-auto space-y-2 pr-2">
                    {availableItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-[var(--radius)] hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleAddItems(item.id)}
                      >
                        <Checkbox
                          checked={assignedItemIds.includes(item.id)}
                          onCheckedChange={() => handleAddItems(item.id)}
                        />
                        <div className="w-16 h-16 rounded-[var(--radius)] overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p>{item.name}</p>
                          <p className="text-muted-foreground">{item.category}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddItemsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddItemsOpen(false)} className="flex-1 gap-2">
                      <Check className="w-4 h-4" />
                      Done ({assignedItemIds.length} selected)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Assigned Items List */}
            {assignedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items assigned yet</p>
                <p>Click "Add Items" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {assignedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 border border-border rounded-[var(--radius)] bg-card"
                    >
                      <div className="w-16 h-16 rounded-[var(--radius)] overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p>{item.name}</p>
                        <p className="text-muted-foreground">{item.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-muted-foreground hover:text-destructive-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>

          {/* Save Assignment */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} className="flex-1 gap-2">
              <Check className="w-4 h-4" />
              Save Assignment
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
