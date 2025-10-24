import { useState } from "react";
import { motion } from "motion/react";
import { 
  Upload, 
  FileSpreadsheet, 
  Download,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { Button } from "./ui-custom/button";
import { Card } from "./ui-custom/card";
import { Alert, AlertDescription } from "./ui-custom/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui-custom/table";
import { Badge } from "./ui-custom/badge";
import { toast } from "sonner@2.0.3";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";

interface BulkUploadProps {
  onBack: () => void;
  onSave: (items: BulkItemData[]) => void;
}

export interface BulkItemData {
  name: string;
  category: string;
  location: string;
  purchaseCost: string;
  quantity: string;
  tags?: string;
  status: "valid" | "warning" | "error";
  errors?: string[];
}

type UploadStep = "upload" | "preview" | "processing";

export function BulkUpload({ onBack, onSave }: BulkUploadProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<BulkItemData[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setFileName(file.name);

      // Simulate file processing
      setTimeout(() => {
        // Mock parsed data with validation
        const mockData: BulkItemData[] = [
          {
            name: "Modern Lounge Chair",
            category: "Furniture",
            location: "Warehouse A - Shelf 5",
            purchaseCost: "450.00",
            quantity: "10",
            tags: "Modern, Seating, Comfortable",
            status: "valid",
          },
          {
            name: "Standing Desk",
            category: "Furniture",
            location: "Warehouse B - Section 3",
            purchaseCost: "680.00",
            quantity: "5",
            tags: "Office, Adjustable",
            status: "valid",
          },
          {
            name: "LED Display Screen",
            category: "",
            location: "Warehouse A - Shelf 12",
            purchaseCost: "1200.00",
            quantity: "3",
            tags: "Electronics, Display",
            status: "warning",
            errors: ["Category is missing"],
          },
          {
            name: "Conference Table",
            category: "Furniture",
            location: "Warehouse C - Bay 1",
            purchaseCost: "2500.00",
            quantity: "2",
            tags: "Meeting, Large",
            status: "valid",
          },
          {
            name: "",
            category: "Decor",
            location: "Warehouse A",
            purchaseCost: "invalid",
            quantity: "5",
            tags: "",
            status: "error",
            errors: ["Item name is required", "Invalid purchase cost format"],
          },
          {
            name: "Ergonomic Office Chair",
            category: "Furniture",
            location: "Warehouse B - Section 7",
            purchaseCost: "320.00",
            quantity: "15",
            tags: "Office, Ergonomic, Seating",
            status: "valid",
          },
        ];

        setParsedData(mockData);
        
        // Calculate stats
        const valid = mockData.filter(item => item.status === "valid").length;
        const warning = mockData.filter(item => item.status === "warning").length;
        const error = mockData.filter(item => item.status === "error").length;
        
        setValidCount(valid);
        setWarningCount(warning);
        setErrorCount(error);
        
        setIsProcessing(false);
        setCurrentStep("preview");
      }, 2000);
    }
  };

  const handleDownloadTemplate = () => {
    // Simulate template download
    console.log("Downloading CSV template...");
    const csvContent = "Name,Category,Location,Purchase Cost,Quantity,Tags\nSample Item,Furniture,Warehouse A,250.00,5,Modern;Office";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_template.csv";
    a.click();
  };

  const handleSaveItems = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Only save valid and warning items
      const itemsToSave = parsedData.filter(item => item.status !== "error");
      toast.success(`Successfully imported ${itemsToSave.length} items to your inventory`);
      onSave(itemsToSave);
      setIsProcessing(false);
    }, 1500);
  };

  const getStatusBadge = (status: "valid" | "warning" | "error") => {
    if (status === "valid") {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    } else if (status === "warning") {
      return (
        <Badge className="bg-accent text-accent-foreground border-accent-foreground/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Warning
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <X className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    }
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
            <h3>Bulk Import Items</h3>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* Upload Step */}
        {currentStep === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Instructions */}
            <Card className="p-6 bg-accent border-accent-foreground/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2">Bulk Import Instructions</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a CSV or Excel file to add multiple items to your inventory at once. Make sure your file includes the following columns:
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Name</strong> - Item name (required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Category</strong> - Item category (required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Location</strong> - Storage location (required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Purchase Cost</strong> - Cost in dollars (required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Quantity</strong> - Number of items (required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Tags</strong> - Comma or semicolon separated tags (optional)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Download Template */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="mb-2">Download Template</h4>
                  <p className="text-muted-foreground">
                    Start with our pre-formatted CSV template to ensure your data is correctly structured.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>
              </div>
            </Card>

            {/* Upload Area */}
            <Card className="p-8">
              <h3 className="mb-6">Upload Your File</h3>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
                <Card className="p-12 border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-2">Upload CSV or Excel File</h4>
                      <p className="text-muted-foreground">
                        Click to browse or drag and drop your file here
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Supported formats: .csv, .xlsx, .xls
                      </p>
                    </div>
                  </div>
                </Card>
              </label>

              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p>Processing file...</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Preview Step */}
        {currentStep === "preview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Items</p>
                    <h4>{parsedData.length}</h4>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid</p>
                    <h4 className="text-primary">{validCount}</h4>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-accent-foreground/20 bg-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Warnings</p>
                    <h4 className="text-accent-foreground">{warningCount}</h4>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <h4 className="text-destructive">{errorCount}</h4>
                  </div>
                </div>
              </Card>
            </div>

            {/* File Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground">File:</p>
                    <h4>{fileName}</h4>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep("upload")}
                >
                  Upload Different File
                </Button>
              </div>
            </Card>

            {/* Warnings/Errors Alert */}
            {(warningCount > 0 || errorCount > 0) && (
              <Alert className={errorCount > 0 ? "border-destructive/50 bg-destructive/5" : "border-accent-foreground/50 bg-accent"}>
                <AlertCircle className={`h-4 w-4 ${errorCount > 0 ? "text-destructive" : "text-accent-foreground"}`} />
                <AlertDescription className="ml-2">
                  {errorCount > 0 ? (
                    <>
                      <strong>{errorCount}</strong> {errorCount === 1 ? "item has" : "items have"} errors and will not be imported. 
                      {warningCount > 0 && (
                        <> <strong>{warningCount}</strong> {warningCount === 1 ? "item has" : "items have"} warnings but can still be imported.</>
                      )}
                    </>
                  ) : (
                    <>
                      <strong>{warningCount}</strong> {warningCount === 1 ? "item has" : "items have"} warnings. Review before importing.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Data Table */}
            <Card className="p-6">
              <h3 className="mb-4">Preview Items ({parsedData.length})</h3>
              
              <div className="border border-border rounded-[var(--radius)] overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Tags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((item, index) => (
                        <TableRow 
                          key={index}
                          className={
                            item.status === "error" 
                              ? "bg-destructive/5" 
                              : item.status === "warning" 
                              ? "bg-accent" 
                              : ""
                          }
                        >
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={!item.name ? "text-muted-foreground italic" : ""}>
                                {item.name || "Missing"}
                              </p>
                              {item.errors && item.errors.length > 0 && (
                                <div className="mt-1 space-y-1">
                                  {item.errors.map((error, i) => (
                                    <p key={i} className="text-destructive">
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={!item.category ? "text-muted-foreground italic" : ""}>
                            {item.category || "Missing"}
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>${item.purchaseCost}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate text-muted-foreground">
                              {item.tags || "-"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveItems}
                disabled={isProcessing || validCount + warningCount === 0}
                size="lg"
                className="flex-1 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing Items...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Import {validCount + warningCount} {validCount + warningCount === 1 ? "Item" : "Items"}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setCurrentStep("upload")}
                variant="outline"
                size="lg"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
