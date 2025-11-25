import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Upload,
  Sparkles,
  ArrowLeft,
  X,
  Edit,
  Check,
  Plus,
  Package,
  Tag,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";
import type { AppState, InventoryItem } from "../types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import diningSetImage from "../assets/dining-room.jpg";
import roundTableImage from "../assets/round-table.png";
import leatherChairImage from "../assets/leather-chair.png";
import ceramicTreeImage from "../assets/ceramic-tree.png";
import whiteCeramicVaseImage from "../assets/white-ceramic-vase.png";

interface DetectedItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  quantity: number;
  imageUrl?: string;
  purchaseCost?: number;
  location?: string;
}

interface MultiItemImageUploadProps {
  onNavigate: (state: AppState, data?: any) => void;
  onSave: (item: InventoryItem) => void;
  autoLoadDiningSet?: boolean;
}

export function MultiItemImageUpload({ onNavigate, onSave, autoLoadDiningSet }: MultiItemImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // Auto-load dining set image when coming from "Take Photo"
  // This ensures that every time "Take Photo" is clicked, the dining room photo is always loaded
  useEffect(() => {
    if (autoLoadDiningSet) {
      // Reset state to ensure clean slate
      setUploadedImage(null);
      setDetectedItems([]);
      setAddedItemIds(new Set());
      setEditingItemId(null);
      
      // Load the dining set image
      const diningSetImageUrl = diningSetImage;
      setUploadedImage(diningSetImageUrl);
      setIsAnalyzing(true);
      
      // Automatically analyze the image
      const analyzeDiningSetImage = async () => {
        // Create a mock file object for the analysis
        const mockFile = new File([], "dining-set.png", { type: "image/png" });
        try {
          const items = await analyzeImage(mockFile, diningSetImageUrl);
          setDetectedItems(items);
          toast.success(`Detected ${items.length} item(s) in the dining set image!`);
        } catch (error) {
          toast.error("Failed to analyze image. Please try again.");
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      analyzeDiningSetImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadDiningSet]);


  // Mock AI analysis function - replace with real AI vision API
  const analyzeImage = async (imageFile: File, sourceImageUrl?: string): Promise<DetectedItem[]> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock detected items based on the dining set image
    // In production, this would call an AI vision API that extracts individual item images
    // For now, all items use the main uploaded image
    // In production, each item would have its own cropped/extracted image URL
    const mainImageUrl = sourceImageUrl || uploadedImage || diningSetImage;
    
    return [
      {
        id: "detected-1",
        name: "Modern Round Extendable Dining Table with Starburst Metal Base - 48\" Diameter (Extends to 60\")",
        category: "Furniture",
        tags: [
          "dining table",
          "round table",
          "extendable table",
          "wood top",
          "light wood",
          "oak finish",
          "modern furniture",
          "metal base",
          "starburst base",
          "kitchen furniture",
          "dining furniture",
          "home decor",
          "48 inch",
          "60 inch",
          "extendable",
        ],
        quantity: 1,
        purchaseCost: 899,
        location: "Warehouse A - Section 1",
        imageUrl: roundTableImage,
      },
      {
        id: "detected-2",
        name: "Set of 4 Brown Leather Dining Chairs with Black Metal Legs",
        category: "Furniture",
        tags: [
          "dining chair",
          "side chair",
          "brown chair",
          "leather chair",
          "upholstered chair",
          "modern furniture",
          "metal legs",
          "curved back",
          "kitchen chair",
          "dining furniture",
          "seating",
          "set of 4",
          "chair set",
          "brown leather",
        ],
        quantity: 1,
        purchaseCost: 249,
        location: "Warehouse A - Section 1",
        imageUrl: leatherChairImage,
      },
      {
        id: "detected-3",
        name: "Abstract Sculptural White Decorative Vase or Candle Holder - Accessory",
        category: "Accessories",
        tags: [
          "vase",
          "candle holder",
          "decorative",
          "sculptural",
          "white",
          "cream",
          "ceramic",
          "abstract",
          "organic shape",
          "table decor",
          "accessory",
          "home decor",
        ],
        quantity: 1,
        purchaseCost: 89,
        location: "Warehouse A - Section 1",
        imageUrl: ceramicTreeImage,
      },
      {
        id: "detected-4",
        name: "Small Round White Vase with Dark Rim - Accessory",
        category: "Accessories",
        tags: [
          "vase",
          "small vase",
          "round vase",
          "white",
          "cream",
          "dark rim",
          "black rim",
          "table decor",
          "decorative",
          "accessory",
          "home decor",
        ],
        quantity: 1,
        purchaseCost: 45,
        location: "Warehouse A - Section 1",
        imageUrl: whiteCeramicVaseImage,
      },
    ];
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);

    try {
      // Analyze image with AI
      const items = await analyzeImage(file, imageUrl);
      setDetectedItems(items);
      toast.success(`Detected ${items.length} item(s) in the image!`);
    } catch (error) {
      toast.error("Failed to analyze image. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleSaveItem = (item: DetectedItem, editedData?: Partial<DetectedItem>) => {
    const finalItem = { ...item, ...editedData };
    
    const newInventoryItem: InventoryItem = {
      id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
      name: finalItem.name,
      category: finalItem.category,
      location: finalItem.location || "Warehouse A - Section 1",
      purchaseCost: finalItem.purchaseCost || 0,
      totalQuantity: finalItem.quantity,
      inUseQuantity: 0,
      availableQuantity: finalItem.quantity,
      tags: finalItem.tags,
      imageUrl: finalItem.imageUrl || uploadedImage || undefined,
      usageCount: 0,
      dateAdded: new Date(),
      aiGenerated: true,
    };

    onSave(newInventoryItem);
    setAddedItemIds(new Set([...addedItemIds, item.id]));
    setEditingItemId(null);
    toast.success(`Added: ${finalItem.name} (Quantity: ${finalItem.quantity})`);
  };

  const handleSaveAll = () => {
    detectedItems.forEach((item) => {
      if (!addedItemIds.has(item.id)) {
        handleSaveItem(item);
      }
    });
    toast.success("All items added successfully!");
    setTimeout(() => {
      onNavigate("library");
    }, 1000);
  };

  const handleRemoveItem = (itemId: string) => {
    setDetectedItems(detectedItems.filter((item) => item.id !== itemId));
  };

  const allItemsAdded = detectedItems.length > 0 && detectedItems.every((item) => addedItemIds.has(item.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("addItem")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2 leading-snug">
            Upload Image with Multiple Items
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Upload an image and we'll automatically detect and identify each item for you
          </p>
        </div>

        {/* Image Upload Section */}
        {!uploadedImage && (
          <Card className="bg-card border-border elevation-sm p-8 mb-6">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                Upload Your Image
              </h2>
              <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                Take or upload a photo containing multiple inventory items
              </p>
            </div>

            <label
              htmlFor="multi-image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-foreground">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-muted-foreground">PNG, JPG, or WEBP up to 10MB</p>
              </div>
              <input
                id="multi-image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </Card>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <Card className="bg-card border-border elevation-sm p-8 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2 leading-snug">
                Analyzing Image...
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI is detecting and identifying items in your image
              </p>
            </div>
          </Card>
        )}

        {/* Image Preview and Detected Items */}
        {uploadedImage && detectedItems.length > 0 && (
          <>
            {/* Image Preview */}
            <Card className="bg-card border-border elevation-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground leading-snug">
                  Uploaded Image
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setDetectedItems([]);
                    setAddedItemIds(new Set());
                    setEditingItemId(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full h-64 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback
                  src={uploadedImage}
                  alt="Uploaded inventory image"
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>

            {/* Detected Items List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground leading-snug">
                  Detected Items ({detectedItems.length})
                </h3>
                {detectedItems.length > 0 && !allItemsAdded && (
                  <Button
                    onClick={handleSaveAll}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add All Items
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {detectedItems.map((item) => {
                  const isAdded = addedItemIds.has(item.id);
                  const isEditing = editingItemId === item.id;

                  if (isEditing) {
                    return (
                      <ItemEditForm
                        key={item.id}
                        item={item}
                        onSave={(editedData) => {
                          handleSaveItem(item, editedData);
                        }}
                        onCancel={() => setEditingItemId(null)}
                      />
                    );
                  }

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="bg-card border-border elevation-sm p-6">
                        <div className="flex items-start gap-4">
                          {/* Item Image */}
                          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2 border border-border">
                            {item.imageUrl || uploadedImage ? (
                              <ImageWithFallback
                                src={item.imageUrl || uploadedImage || ""}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-base font-medium text-foreground mb-1 leading-normal">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">{item.category}</Badge>
                                  <Badge variant="outline">Qty: {item.quantity}</Badge>
                                  {item.purchaseCost && (
                                    <Badge variant="outline">
                                      ${item.purchaseCost}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {isAdded && (
                                <Badge className="bg-chart-3 text-white">
                                  <Check className="w-3 h-3 mr-1" />
                                  Added
                                </Badge>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.tags.slice(0, 8).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 8 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.tags.length - 8} more
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {!isAdded ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditItem(item.id)}
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit & Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveItem(item)}
                                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item.id)}
                                  className="gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Success Message */}
            {allItemsAdded && (
              <Card className="bg-chart-3/10 border-chart-3 elevation-sm p-6">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-chart-3" />
                  <div>
                    <h4 className="text-base font-medium text-foreground mb-1 leading-normal">
                      All items added successfully!
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You can continue adding more items or navigate back to your inventory.
                    </p>
                  </div>
                  <Button
                    onClick={() => onNavigate("library")}
                    className="ml-auto bg-chart-3 text-white hover:bg-chart-3/90"
                  >
                    View Inventory
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Item Edit Form Component
interface ItemEditFormProps {
  item: DetectedItem;
  onSave: (editedData: Partial<DetectedItem>) => void;
  onCancel: () => void;
}

function ItemEditForm({ item, onSave, onCancel }: ItemEditFormProps) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [purchaseCost, setPurchaseCost] = useState(item.purchaseCost?.toString() || "");
  const [location, setLocation] = useState(item.location || "");
  const [tags, setTags] = useState<string[]>(item.tags);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      name,
      category,
      quantity: parseInt(quantity) || 1,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      location: location || undefined,
      tags,
    });
  };

  return (
    <Card className="bg-card border-border elevation-sm p-6">
      <h4 className="text-base font-medium text-foreground mb-4 leading-normal">
        Edit Item Details
      </h4>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Item Name</Label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cost">Purchase Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-cost"
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Warehouse A - Section 1"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="edit-tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
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
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !category}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save & Add Item
          </Button>
        </div>
      </div>
    </Card>
  );
}
