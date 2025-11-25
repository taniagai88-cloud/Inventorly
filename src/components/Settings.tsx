import React, { useState } from "react";
import { ArrowLeft, Save, Building2, MapPin, Calendar, DollarSign } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { AppState } from "../types";
import { toast } from "sonner@2.0.3";
import { defaultSettings, loadSettings, type SettingsData } from "../utils/settings";

// Currency formatter function for USD
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface SettingsProps {
  onNavigate: (state: AppState) => void;
}


export function Settings({ onNavigate }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsData>(loadSettings());

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? value : Number(value),
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("inventorly-settings", JSON.stringify(settings));
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", e);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("dashboard")}
            className="gap-2 min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">Manage your staging dates, pricing, and warehouse location</p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto min-h-[44px] touch-manipulation">
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Settings</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Staging Dates Section */}
        <Card className="bg-card border-border elevation-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-foreground" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">Staging Dates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="defaultStagingPeriod" className="text-foreground">
                Default Staging Period (days)
              </Label>
              <Input
                id="defaultStagingPeriod"
                type="number"
                min="1"
                value={settings.defaultStagingPeriod}
                onChange={(e) => handleChange("defaultStagingPeriod", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs font-normal text-muted-foreground mt-1 leading-relaxed">
                Default number of days for staging contracts
              </p>
            </div>
            <div>
              <Label htmlFor="contractDuration" className="text-foreground">
                Contract Duration (days)
              </Label>
              <Input
                id="contractDuration"
                type="number"
                min="1"
                value={settings.contractDuration}
                onChange={(e) => handleChange("contractDuration", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs font-normal text-muted-foreground mt-1 leading-relaxed">
                Standard contract duration from staging date
              </p>
            </div>
          </div>
        </Card>

        {/* Pricing Section */}
        <Card className="bg-card border-border elevation-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground leading-snug">Room Pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="livingRoomPrice" className="text-foreground">
                Living Room
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="livingRoomPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.livingRoomPrice}
                  onChange={(e) => handleChange("livingRoomPrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="diningRoomPrice" className="text-foreground">
                Dining Room
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="diningRoomPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.diningRoomPrice}
                  onChange={(e) => handleChange("diningRoomPrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="officePrice" className="text-foreground">
                Office
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="officePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.officePrice}
                  onChange={(e) => handleChange("officePrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bathroomPrice" className="text-foreground">
                Bathroom
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="bathroomPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.bathroomPrice}
                  onChange={(e) => handleChange("bathroomPrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="kitchenPrice" className="text-foreground">
                Kitchen
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="kitchenPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.kitchenPrice}
                  onChange={(e) => handleChange("kitchenPrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="otherRoomPrice" className="text-foreground">
                Other Room
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="otherRoomPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.otherRoomPrice}
                  onChange={(e) => handleChange("otherRoomPrice", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {/* Bedroom with sizes */}
          <div className="mt-6 pt-6 border-t border-border">
            <Label className="text-base font-medium text-foreground mb-4 block leading-normal">Bedroom</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedroomPriceSmall" className="text-xs font-medium text-muted-foreground leading-normal">
                  Small
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                  <Input
                    id="bedroomPriceSmall"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.bedroomPriceSmall}
                    onChange={(e) => handleChange("bedroomPriceSmall", parseFloat(e.target.value) || 0)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bedroomPriceMedium" className="text-xs font-medium text-muted-foreground leading-normal">
                  Medium
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                  <Input
                    id="bedroomPriceMedium"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.bedroomPriceMedium}
                    onChange={(e) => handleChange("bedroomPriceMedium", parseFloat(e.target.value) || 0)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bedroomPriceLarge" className="text-xs font-medium text-muted-foreground leading-normal">
                  Large
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                  <Input
                    id="bedroomPriceLarge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.bedroomPriceLarge}
                    onChange={(e) => handleChange("bedroomPriceLarge", parseFloat(e.target.value) || 0)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Delivery & Pickup Fees */}
        <Card className="bg-card border-border elevation-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground leading-snug">Delivery & Pickup Fees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryFee" className="text-foreground">
                Delivery Fee
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.deliveryFee}
                  onChange={(e) => handleChange("deliveryFee", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pickupFee" className="text-foreground">
                Pickup Fee
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
                <Input
                  id="pickupFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.pickupFee}
                  onChange={(e) => handleChange("pickupFee", parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Warehouse Location Section */}
        <Card className="bg-card border-border elevation-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground leading-snug">Warehouse Location</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="warehouseName" className="text-foreground">
                Warehouse Name
              </Label>
              <Input
                id="warehouseName"
                value={settings.warehouseName}
                onChange={(e) => handleChange("warehouseName", e.target.value)}
                className="mt-1"
                placeholder="Main Warehouse"
              />
            </div>
            <div>
              <Label htmlFor="warehouseAddress" className="text-foreground">
                Street Address
              </Label>
              <Input
                id="warehouseAddress"
                value={settings.warehouseAddress}
                onChange={(e) => handleChange("warehouseAddress", e.target.value)}
                className="mt-1"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="warehouseCity" className="text-foreground">
                  City
                </Label>
                <Input
                  id="warehouseCity"
                  value={settings.warehouseCity}
                  onChange={(e) => handleChange("warehouseCity", e.target.value)}
                  className="mt-1"
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <Label htmlFor="warehouseState" className="text-foreground">
                  State
                </Label>
                <Input
                  id="warehouseState"
                  value={settings.warehouseState}
                  onChange={(e) => handleChange("warehouseState", e.target.value)}
                  className="mt-1"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="warehouseZip" className="text-foreground">
                  ZIP Code
                </Label>
                <Input
                  id="warehouseZip"
                  value={settings.warehouseZip}
                  onChange={(e) => handleChange("warehouseZip", e.target.value)}
                  className="mt-1"
                  placeholder="90001"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="warehousePhone" className="text-foreground">
                Phone Number
              </Label>
              <Input
                id="warehousePhone"
                value={settings.warehousePhone}
                onChange={(e) => handleChange("warehousePhone", e.target.value)}
                className="mt-1"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

