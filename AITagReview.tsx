import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Check, Sparkles, Edit2 } from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Input } from "./ui-custom/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Tag {
  id: string;
  text: string;
  confidence: number;
  isEditing: boolean;
}

interface AITagReviewProps {
  imageUrl: string;
  initialTags: string[];
  onConfirm: (tags: string[]) => void;
  onBack?: () => void;
}

export function AITagReview({ imageUrl, initialTags, onConfirm, onBack }: AITagReviewProps) {
  const [tags, setTags] = useState<Tag[]>(
    initialTags.map((text, index) => ({
      id: `tag-${index}`,
      text,
      confidence: Math.random() * 0.3 + 0.7, // Mock confidence between 70-100%
      isEditing: false,
    }))
  );
  const [newTagText, setNewTagText] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleEditTag = (id: string) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id ? { ...tag, isEditing: true } : tag
      )
    );
  };

  const handleSaveTag = (id: string, newText: string) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id
          ? { ...tag, text: newText.trim(), isEditing: false }
          : tag
      )
    );
  };

  const handleCancelEdit = (id: string) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id ? { ...tag, isEditing: false } : tag
      )
    );
  };

  const handleRemoveTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  const handleAddTag = () => {
    if (newTagText.trim()) {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        text: newTagText.trim(),
        confidence: 1.0, // Manual tags have 100% confidence
        isEditing: false,
      };
      setTags((prev) => [...prev, newTag]);
      setNewTagText("");
      setIsAddingTag(false);
    }
  };

  const handleConfirm = () => {
    const finalTags = tags.map((tag) => tag.text);
    onConfirm(finalTags);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-primary";
    if (confidence >= 0.75) return "bg-chart-1";
    return "bg-chart-3";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3>AI Tag Review</h3>
            <p className="text-muted-foreground">
              Review and edit AI-generated tags, or add your own
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div>
            <p className="text-muted-foreground mb-3">Image Preview</p>
            <div className="relative aspect-square rounded-[var(--radius)] overflow-hidden bg-muted">
              <ImageWithFallback
                src={imageUrl}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground">AI-Generated Tags</p>
              <span className="text-muted-foreground">
                {tags.length} {tags.length === 1 ? "tag" : "tags"}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-4 bg-accent border-border">
                      {tag.isEditing ? (
                        <EditTagInput
                          initialValue={tag.text}
                          onSave={(newText) => handleSaveTag(tag.id, newText)}
                          onCancel={() => handleCancelEdit(tag.id)}
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">{tag.text}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditTag(tag.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveTag(tag.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Confidence
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(tag.confidence * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-border rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${tag.confidence * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`h-full rounded-full ${getConfidenceColor(
                                  tag.confidence
                                )}`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Tag Section */}
              {isAddingTag ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 bg-card border-primary">
                    <div className="flex gap-2">
                      <Input
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value)}
                        placeholder="Enter tag name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddTag();
                          } else if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setNewTagText("");
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        onClick={handleAddTag}
                        disabled={!newTagText.trim()}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setIsAddingTag(false);
                          setNewTagText("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setIsAddingTag(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleConfirm}
          size="lg"
          className="flex-1 gap-2"
          disabled={tags.length === 0}
        >
          <Check className="w-4 h-4" />
          Confirm Tags
        </Button>
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
          >
            Back
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Separate component for editing tag text
function EditTagInput({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(value);
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        autoFocus
      />
      <Button
        size="icon"
        onClick={() => onSave(value)}
        disabled={!value.trim()}
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={onCancel}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
