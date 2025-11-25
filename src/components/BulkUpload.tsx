import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Download, Upload, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";
import type { AppState } from "../types";

interface BulkUploadProps {
  onNavigate: (state: AppState) => void;
}

export function BulkUpload({ onNavigate }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const csvContent =
      "Item Name,Category,Location,Purchase Cost,Quantity,Tags\n" +
      "Sample Monitor,Electronics,Warehouse A,899,5,monitor display 4K\n" +
      "Office Chair,Furniture,Warehouse B,459,10,chair office ergonomic";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded!");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".xlsx")) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setFile(selectedFile);

    // Simulate CSV parsing
    const mockData = [
      {
        name: "Sample Monitor",
        category: "Electronics",
        location: "Warehouse A",
        cost: 899,
        quantity: 5,
        tags: "monitor display 4K",
      },
      {
        name: "Office Chair",
        category: "Furniture",
        location: "Warehouse B",
        cost: 459,
        quantity: 10,
        tags: "chair office ergonomic",
      },
    ];

    setPreviewData(mockData);
  };

  const handleImport = async () => {
    setIsProcessing(true);

    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(`Successfully imported ${previewData.length} items!`);
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 overflow-x-hidden">
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

          <h2 className="text-foreground mb-2">Bulk Upload Items</h2>
          <p className="text-muted-foreground mb-8">
            Upload multiple items at once using a CSV or Excel file
          </p>

          {/* Instructions */}
          <Card className="bg-card border-border elevation-sm p-6 mb-6">
            <h3 className="text-foreground mb-4">How to bulk upload:</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  1
                </span>
                <span className="text-foreground">Download our CSV template</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  2
                </span>
                <span className="text-foreground">Fill in your inventory data</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  3
                </span>
                <span className="text-foreground">Upload the completed file</span>
              </li>
            </ol>

            <Button onClick={downloadTemplate} variant="outline" className="mt-6">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </Card>

          {/* Upload Section */}
          <Card className="bg-card border-border elevation-sm p-6 mb-6">
            <h3 className="text-foreground mb-4">Upload File</h3>

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-foreground">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-muted-foreground">CSV or XLSX files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
              />
            </label>

            {file && (
              <div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-foreground">{file.name}</p>
                  <p className="text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Preview */}
          {previewData.length > 0 && (
            <Card className="bg-card border-border elevation-sm p-6 mb-6">
              <h3 className="text-foreground mb-4">
                Preview ({previewData.length} items)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">Item Name</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Cost</th>
                      <th className="text-left p-3">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3 text-foreground">{row.name}</td>
                        <td className="p-3 text-foreground">{row.category}</td>
                        <td className="p-3 text-foreground">{row.location}</td>
                        <td className="p-3 text-foreground">${row.cost}</td>
                        <td className="p-3 text-foreground">{row.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleImport}
                disabled={isProcessing}
                className="w-full mt-6"
              >
                {isProcessing ? "Importing..." : `Import ${previewData.length} Items`}
              </Button>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
