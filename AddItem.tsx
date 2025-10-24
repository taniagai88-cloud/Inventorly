import { useState } from "react";
import { motion } from "motion/react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  DollarSign,
  Tag,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Input } from "./ui-custom/input";
import { Label } from "./ui-custom/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AITagReview } from "./AITagReview";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";
import diningSetImage from "figma:asset/fcefe658a9e2207b1f229e93901617054db9abe2.png";

interface AddItemProps {
  onBack: () => void;
  onSave: (itemData: ItemData) => void;
  onBulkUpload?: () => void;
}

interface ItemData {
  image: string;
  name: string;
  category: string;
  location: string;
  purchaseCost: string;
  tags: string[];
}

type Step = "photo" | "tags" | "review";

export function AddItem({ onBack, onSave, onBulkUpload }: AddItemProps) {
  const [currentStep, setCurrentStep] = useState<Step>("photo");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    purchaseCost: "",
  });
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [showTagReview, setShowTagReview] = useState(false);
  const [aiPopulatedFields, setAiPopulatedFields] = useState<Set<string>>(new Set());

  const steps = [
    { id: "photo" as Step, label: "Photo" },
    { id: "tags" as Step, label: "Tags" },
    { id: "review" as Step, label: "Review" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsUploading(false);
        setCurrentStep("tags");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Simulate camera capture with the dining set image
    setIsUploading(true);
    setTimeout(() => {
      setImagePreview(diningSetImage);
      setIsUploading(false);
      setCurrentStep("tags");
    }, 1000);
  };

  const handleAutoTag = async () => {
    setIsTagging(true);
    // Simulate AI tagging and auto-population
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate AI tags - using the dining set specific tags
    const mockTags = ["Modern", "Round Table", "Leather Chairs", "Dining Set", "Contemporary"];
    setAiTags(mockTags);
    
    // Auto-populate form fields based on AI analysis
    const aiSuggestions = {
      name: "Modern Dining Set with Leather Chairs",
      category: "Furniture",
      location: "Warehouse B - Section 5",
      purchaseCost: "1850.00",
    };
    
    // Only populate empty fields
    const fieldsToPopulate = new Set<string>();
    const updatedFormData = { ...formData };
    
    Object.entries(aiSuggestions).forEach(([field, value]) => {
      if (!formData[field as keyof typeof formData]) {
        updatedFormData[field as keyof typeof formData] = value;
        fieldsToPopulate.add(field);
      }
    });
    
    setFormData(updatedFormData);
    setAiPopulatedFields(fieldsToPopulate);
    setIsTagging(false);
    setShowTagReview(true);
  };

  const handleConfirmTags = (confirmedTags: string[]) => {
    setAiTags(confirmedTags);
    setShowTagReview(false);
    setCurrentStep("review");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Remove AI-populated indicator when user manually edits
    if (aiPopulatedFields.has(name)) {
      setAiPopulatedFields((prev) => {
        const updated = new Set(prev);
        updated.delete(name);
        return updated;
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const itemData: ItemData = {
      image: imagePreview,
      ...formData,
      tags: aiTags,
    };
    console.log("Saving item:", itemData);
    setIsSaving(false);
    onSave(itemData);
  };

  const canProceedToReview = imagePreview && formData.name;

  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.id === currentStep);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Inventorly" className="h-8" />
            <h3>Add New Item</h3>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      getCurrentStepIndex() >= index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`ml-3 transition-colors ${
                      getCurrentStepIndex() >= index
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-border">
                    <div
                      className={`h-full transition-all duration-500 ${
                        getCurrentStepIndex() > index ? "bg-primary" : "bg-transparent"
                      }`}
                      style={{ width: getCurrentStepIndex() > index ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Photo Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-8">
            <h3 className="mb-6">Upload Item Photo</h3>
            
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-[var(--radius)] overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setImagePreview("");
                    setCurrentStep("photo");
                    setAiTags([]);
                  }}
                >
                  Change Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Upload Button */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Card className="p-8 border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all text-center h-full">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h4 className="mb-2">Upload Photo</h4>
                          <p className="text-muted-foreground">
                            Single item image
                          </p>
                        </div>
                      </div>
                    </Card>
                  </label>

                  {/* Camera Button */}
                  <button
                    onClick={handleCameraCapture}
                    disabled={isUploading}
                    className="text-left"
                  >
                    <Card className="p-8 border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all text-center h-full">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h4 className="mb-2">Take Photo</h4>
                          <p className="text-muted-foreground">
                            Use your camera
                          </p>
                        </div>
                      </div>
                    </Card>
                  </button>

                  {/* Bulk Upload Button */}
                  {onBulkUpload && (
                    <button
                      onClick={onBulkUpload}
                      disabled={isUploading}
                      className="text-left"
                    >
                      <Card className="p-8 border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all text-center h-full">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                            <FileSpreadsheet className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h4 className="mb-2">Upload CSV/Excel</h4>
                            <p className="text-muted-foreground">
                              Bulk import items
                            </p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  )}
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p>Uploading...</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI Tagging & Manual Fields Section */}
        {imagePreview && !showTagReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 space-y-6"
          >
            {/* AI Tag Button */}
            <Card className="p-6 bg-accent border-accent-foreground/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1">AI Analysis</h4>
                    <p className="text-muted-foreground">
                      Let AI analyze the image and populate item details
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAutoTag}
                  disabled={isTagging || aiTags.length > 0}
                  className="gap-2"
                >
                  {isTagging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : aiTags.length > 0 ? (
                    "Analysis Complete"
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>

              {aiTags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground">AI Suggested Tags:</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowTagReview(true)}
                      className="gap-1"
                    >
                      Review Tags
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-[var(--radius-sm)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Manual Fields */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Item Details</h3>
                {aiPopulatedFields.size > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>AI-populated</span>
                  </div>
                )}
              </div>
              <form className="space-y-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Item Name
                      {aiPopulatedFields.has("name") && (
                        <span className="ml-auto flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Event Decor Set"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={aiPopulatedFields.has("name") ? "border-primary/50 bg-accent" : ""}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Category
                      {aiPopulatedFields.has("category") && (
                        <span className="ml-auto flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="category"
                      name="category"
                      type="text"
                      placeholder="e.g., Event Equipment"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={aiPopulatedFields.has("category") ? "border-primary/50 bg-accent" : ""}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                      {aiPopulatedFields.has("location") && (
                        <span className="ml-auto flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g., Warehouse A, Shelf 3"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={aiPopulatedFields.has("location") ? "border-primary/50 bg-accent" : ""}
                    />
                  </div>
                </div>

                {/* Purchase Cost */}
                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Purchase Cost
                      {aiPopulatedFields.has("purchaseCost") && (
                        <span className="ml-auto flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="purchaseCost"
                      name="purchaseCost"
                      type="text"
                      placeholder="e.g., 250.00"
                      value={formData.purchaseCost}
                      onChange={handleInputChange}
                      className={aiPopulatedFields.has("purchaseCost") ? "border-primary/50 bg-accent" : ""}
                    />
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* AI Tag Review Section */}
        {imagePreview && showTagReview && (
          <AITagReview
            imageUrl={imagePreview}
            initialTags={aiTags}
            onConfirm={handleConfirmTags}
            onBack={() => setShowTagReview(false)}
          />
        )}

        {/* Review & Save Section */}
        {canProceedToReview && !showTagReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6 bg-accent border-accent-foreground/10">
              <h3 className="mb-4">Ready to Save</h3>
              <p className="text-muted-foreground mb-6">
                Review your item details and save to your inventory. You can always edit this information later.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="lg"
                  className="flex-1 gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save to Inventory"
                  )}
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="lg"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
