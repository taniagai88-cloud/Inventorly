import { useState } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Upload,
  Package,
  Tag,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";
import type { AppState } from "../types";
import chairImage from "figma:asset/af97294c1da1ac8535a59452f21be667a162fcff.png";

interface AddItemProps {
  onNavigate: (state: AppState) => void;
  onSave: (item: any) => void;
}

type Step = "photo" | "tags" | "review";

export function AddItem({ onNavigate, onSave }: AddItemProps) {
  const [step, setStep] = useState<Step>("photo");
  const [imageUrl, setImageUrl] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiPopulated, setAiPopulated] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handlePhotoUpload = async (type: "camera" | "upload") => {
    // Simulate photo capture/upload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setImageUrl(chairImage);
    setStep("tags");
  };

  const handleAiTag = async () => {
    setIsAiLoading(true);
    
    // Simulate AI tagging
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock AI-generated data
    setItemName("Mid-Century Leather Accent Chair");
    setCategory("Furniture");
    setLocation("Warehouse A - Section 1");
    setPurchaseCost("649");
    setAiTags(["chair", "accent", "leather", "mid-century", "brown", "seating"]);
    setAiPopulated(["itemName", "category", "location", "purchaseCost"]);
    
    setIsAiLoading(false);
    toast.success("AI auto-tagging complete!");
  };

  const handleContinue = () => {
    setStep("review");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !aiTags.includes(newTag.trim())) {
      setAiTags([...aiTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAiTags(aiTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      category,
      location,
      purchaseCost: parseFloat(purchaseCost),
      totalQuantity: 1,
      inUseQuantity: 0,
      availableQuantity: 1,
      tags: aiTags,
      imageUrl,
      usageCount: 0,
      dateAdded: new Date(),
      aiGenerated: aiPopulated.length > 0,
    };

    onSave(newItem);
    toast.success("Item saved successfully!");
    onNavigate("dashboard");
  };

  const steps: Step[] = ["photo", "tags", "review"];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            if (step === "photo") {
              onNavigate("dashboard");
            } else if (step === "tags") {
              setStep("photo");
            } else if (step === "review") {
              setStep("tags");
            }
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["Photo", "Tags", "Review"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index <= stepIndex
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {index < stepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={
                  index <= stepIndex ? "text-foreground" : "text-muted-foreground"
                }
              >
                {label}
              </span>
              {index < 2 && <div className="w-12 h-0.5 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {step === "photo" && (
            <Card className="bg-card border-border elevation-sm p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Package className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-foreground mb-2">Add an item to your inventory</h2>
                <p className="text-muted-foreground">
                  Take or upload a photo of your item
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => handlePhotoUpload("camera")}
                  variant="outline"
                  className="w-full h-24"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  <span>Take Photo</span>
                </Button>

                <Button
                  onClick={() => handlePhotoUpload("upload")}
                  variant="outline"
                  className="w-full h-24"
                >
                  <Upload className="w-6 h-6 mr-3" />
                  <span>Upload Photo</span>
                </Button>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => onNavigate("bulkUpload")}
                  className="text-primary hover:underline"
                >
                  Bulk Upload Items →
                </button>
              </div>
            </Card>
          )}

          {step === "tags" && (
            <Card className="bg-card border-border elevation-sm p-8">
              {/* Image Preview */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Item preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground mb-2">Item Details</h3>
                  <p className="text-muted-foreground">
                    Add details manually or use AI auto-tag
                  </p>
                </div>
              </div>

              {/* AI Auto-Tag Button */}
              <div className="mb-6">
                <Button
                  onClick={handleAiTag}
                  disabled={isAiLoading}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAiLoading ? "AI Processing..." : "AI Auto-Tag"}
                </Button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    {aiPopulated.includes("itemName") && (
                      <Badge variant="secondary" className="h-5">
                        <Check className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="itemName"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="category">Category</Label>
                    {aiPopulated.includes("category") && (
                      <Badge variant="secondary" className="h-5">
                        <Check className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Electronics, Furniture"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="location">Location</Label>
                    {aiPopulated.includes("location") && (
                      <Badge variant="secondary" className="h-5">
                        <Check className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Warehouse A - Section 3"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="purchaseCost">Purchase Cost</Label>
                    {aiPopulated.includes("purchaseCost") && (
                      <Badge variant="secondary" className="h-5">
                        <Check className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="purchaseCost"
                      type="number"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="tags"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Add a tag and press Enter"
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {aiTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {aiTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="pl-3 pr-2 py-1 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  disabled={!itemName || !category || !location || !purchaseCost}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {step === "review" && (
            <Card className="bg-card border-border elevation-sm p-8">
              <h2 className="text-foreground mb-6">Review & Save</h2>

              <div className="space-y-6">
                {/* Image Preview */}
                <div className="w-full h-48 bg-white rounded-lg flex items-center justify-center p-6">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={itemName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-foreground mb-1">{itemName}</h4>
                    <p className="text-muted-foreground">{category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="text-foreground">{location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Purchase Cost</p>
                      <p className="text-foreground">${purchaseCost}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {aiPopulated.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-secondary">
                        <Sparkles className="w-4 h-4" />
                        <p>
                          {aiPopulated.length} fields auto-populated by AI
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("tags")}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Save Item
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
