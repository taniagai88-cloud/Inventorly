import { useState } from "react";
import { motion } from "motion/react";
import { Chrome } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import type { AuthMode, UserData } from "../types";
import logoImage from "figma:asset/b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png";

interface AuthScreenProps {
  onSendCode: (mode: AuthMode, data: Partial<UserData>) => void;
  onGoogleAuth: () => void;
}

export function AuthScreen({ onSendCode, onGoogleAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 10);
    
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (mode === "signup") {
      if (!fullName.trim()) newErrors.fullName = "Full name is required";
      if (!businessName.trim()) newErrors.businessName = "Business name is required";
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (cleaned.length !== 10) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onSendCode(mode, {
      fullName: mode === "signup" ? fullName : "",
      businessName: mode === "signup" ? businessName : "",
      phoneNumber,
    });
    
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    onGoogleAuth();
    setIsLoading(false);
  };

  // Check if all required fields are filled
  const isFormValid = mode === "signup" 
    ? fullName.trim() !== "" && businessName.trim() !== "" && phoneNumber !== ""
    : phoneNumber !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border elevation-sm p-8 rounded-lg">
          {/* Logo and Tagline */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src={logoImage} alt="Inventorly" className="h-12 w-auto" />
            </div>
            <p className="text-muted-foreground">Track. Tag. Simplify your inventory.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    placeholder="John Doe"
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (errors.businessName) setErrors({ ...errors, businessName: "" });
                    }}
                    placeholder="Acme Corp"
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-destructive">{errors.businessName}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className={errors.phoneNumber ? "border-destructive" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <Separator className="flex-1" />
            <p className="text-muted-foreground">
              or {mode === "signup" ? "sign up" : "sign in"} with
            </p>
            <Separator className="flex-1" />
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google or Email
          </Button>

          {/* Toggle Mode */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setErrors({});
              }}
              className="text-primary hover:underline"
            >
              {mode === "signup"
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-muted-foreground mt-6 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
