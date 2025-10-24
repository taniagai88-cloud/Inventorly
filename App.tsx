import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Phone } from "lucide-react";
import { Button } from "./components/ui-custom/button";
import { Input } from "./components/ui-custom/input";
import { Label } from "./components/ui-custom/label";
import { Separator } from "./components/ui-custom/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./components/ui-custom/input-otp";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";
import { motion } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Dashboard } from "./components/Dashboard";
import { AddItem } from "./components/AddItem";
import { BulkUpload } from "./components/BulkUpload";
import { InventoryLibrary } from "./components/InventoryLibrary";
import { ItemDetail } from "./components/ItemDetail";
import { AssignToJob } from "./components/AssignToJob";
import { ReportsInsights } from "./components/ReportsInsights";
import { Toaster } from "./components/ui-custom/sonner";

type AppState = "auth" | "verify" | "loading" | "dashboard" | "addItem" | "bulkUpload" | "library" | "itemDetail" | "assignToJob" | "reports";
type AuthMode = "signup" | "signin";

export default function App() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    businessName: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Simulate loading and transition to dashboard
  useEffect(() => {
    if (appState === "loading") {
      const timer = setTimeout(() => {
        setAppState("dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number
    if (name === "phoneNumber") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;
      if (cleaned.length >= 1) {
        formatted = `(${cleaned.slice(0, 3)}`;
      }
      if (cleaned.length >= 4) {
        formatted += `) ${cleaned.slice(3, 6)}`;
      }
      if (cleaned.length >= 7) {
        formatted += `-${cleaned.slice(6, 10)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (authMode === "signup") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }
    }

    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate sending SMS
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Sending verification code to ${formData.phoneNumber}`);
      setIsLoading(false);
      setAppState("verify");
      setResendTimer(60);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      alert("Please enter the 6-digit verification code");
      return;
    }
    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Verifying code:", verificationCode);
    console.log("User data:", formData);
    setIsLoading(false);
    setAppState("loading");
  };

  const handleResendCode = async () => {
    if (resendTimer === 0) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Resending code to ${formData.phoneNumber}`);
      setVerificationCode("");
      setResendTimer(60);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setAppState("auth");
    setVerificationCode("");
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Google authentication initiated");
    // Set some default data for Google auth
    setFormData({
      fullName: "Demo User",
      phoneNumber: "(555) 123-4567",
      businessName: "Demo Business",
    });
    setIsGoogleLoading(false);
    setAppState("loading");
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signup" ? "signin" : "signup");
    setErrors({});
  };

  // Check if all required fields are filled
  const isFormComplete = () => {
    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
    const hasValidPhone = phoneDigits.length === 10;

    if (authMode === "signup") {
      return (
        formData.fullName.trim() !== "" &&
        formData.businessName.trim() !== "" &&
        hasValidPhone
      );
    } else {
      return hasValidPhone;
    }
  };

  const handleAddItem = () => {
    setAppState("addItem");
  };

  const handleBackToDashboard = () => {
    setAppState("dashboard");
  };

  const handleSaveItem = (itemData: any) => {
    console.log("Item saved:", itemData);
    setAppState("dashboard");
  };

  const handleBulkUpload = () => {
    setAppState("bulkUpload");
  };

  const handleSaveBulkItems = (items: any[]) => {
    console.log("Bulk items saved:", items);
    setAppState("dashboard");
  };

  // Show loading screen
  if (appState === "loading") {
    return <LoadingScreen />;
  }

  // Show add item screen
  if (appState === "addItem") {
    return (
      <AddItem 
        onBack={handleBackToDashboard}
        onSave={handleSaveItem}
        onBulkUpload={handleBulkUpload}
      />
    );
  }

  // Show bulk upload screen
  if (appState === "bulkUpload") {
    return (
      <>
        <BulkUpload
          onBack={() => setAppState("addItem")}
          onSave={handleSaveBulkItems}
        />
        <Toaster />
      </>
    );
  }

  // Navigation handler
  const handleNavigation = (page: "dashboard" | "library" | "reports") => {
    if (page === "dashboard") {
      setSelectedItemId(null);
      setAppState("dashboard");
    } else if (page === "library") {
      setAppState("library");
    } else if (page === "reports") {
      setAppState("reports");
    }
  };

  // Show dashboard
  if (appState === "dashboard") {
    return (
      <>
        <Dashboard 
          userName={formData.fullName || "User"} 
          businessName={formData.businessName || "Your Business"}
          onAddItem={handleAddItem}
          onViewLibrary={() => setAppState("library")}
          onAssignToJob={() => setAppState("assignToJob")}
          onViewReports={(itemId) => {
            setSelectedItemId(itemId || null);
            setAppState("reports");
          }}
          onNavigate={handleNavigation}
        />
        <Toaster />
      </>
    );
  }

  // Show inventory library
  if (appState === "library") {
    return (
      <>
        <InventoryLibrary
          userName={formData.fullName || "User"}
          businessName={formData.businessName || "Your Business"}
          onBack={() => setAppState("dashboard")}
          onViewDetails={(itemId) => {
            setSelectedItemId(itemId);
            setAppState("itemDetail");
          }}
          onNavigate={handleNavigation}
        />
        <Toaster />
      </>
    );
  }

  // Show item detail
  if (appState === "itemDetail" && selectedItemId) {
    return (
      <ItemDetail
        itemId={selectedItemId}
        onBack={() => setAppState("library")}
        onEdit={(itemId) => {
          console.log("Edit item:", itemId);
        }}
        onDelete={(itemId) => {
          console.log("Delete item:", itemId);
          setAppState("library");
        }}
        onAssignToJob={(itemId) => {
          setSelectedItemId(itemId);
          setAppState("assignToJob");
        }}
      />
    );
  }

  // Show assign to job
  if (appState === "assignToJob") {
    return (
      <>
        <AssignToJob onBack={() => setAppState("dashboard")} />
        <Toaster />
      </>
    );
  }

  // Show reports and insights
  if (appState === "reports") {
    return (
      <>
        <ReportsInsights
          userName={formData.fullName || "User"}
          businessName={formData.businessName || "Your Business"}
          onBack={() => {
            setSelectedItemId(null);
            setAppState("dashboard");
          }}
          onViewItem={(itemId) => {
            setSelectedItemId(itemId);
            setAppState("itemDetail");
          }}
          selectedItemId={selectedItemId || undefined}
          onNavigate={handleNavigation}
        />
        <Toaster />
      </>
    );
  }

  // Show verification screen
  if (appState === "verify") {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center"
            >
              <img src={logo} alt="Inventorly" className="h-12" />
            </motion.div>
          </div>

          {/* Verification Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-card border border-border rounded-lg p-8 shadow-lg"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="mb-6">
              <h2 className="mb-2">Enter verification code</h2>
              <p className="text-muted-foreground">
                We sent a 6-digit code to {formData.phoneNumber}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* Verification Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-muted-foreground">
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  `Verify and ${authMode === "signup" ? "Create Account" : "Sign In"}`
                )}
              </Button>
            </form>
          </motion.div>

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-center text-muted-foreground"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show auth form (signup/signin)
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <img src={logo} alt="Inventorly" className="h-12" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground"
          >
            Track. Tag. Simplify your inventory.
          </motion.p>
        </div>

        {/* Auth Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-card border border-border rounded-lg p-8 shadow-lg"
        >
          <div className="mb-6">
            <h2 className="mb-2">
              {authMode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground">
              {authMode === "signup" 
                ? "Start managing your inventory today"
                : "Sign in to continue to Inventorly"
              }
            </p>
          </div>

          {/* Phone Auth Form */}
          <form onSubmit={handleSendCode} className="space-y-4">
            {authMode === "signup" && (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? "border-destructive" : ""}
                    disabled={isLoading || isGoogleLoading}
                  />
                  {errors.fullName && (
                    <p className="text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={errors.businessName ? "border-destructive" : ""}
                    disabled={isLoading || isGoogleLoading}
                  />
                  {errors.businessName && (
                    <p className="text-destructive">{errors.businessName}</p>
                  )}
                </div>
              </>
            )}

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? "border-destructive" : ""}
                disabled={isLoading || isGoogleLoading}
                maxLength={14}
              />
              {errors.phoneNumber && (
                <p className="text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading || !isFormComplete()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-muted-foreground">
                or {authMode === "signup" ? "sign up" : "sign in"} with
              </span>
            </div>
          </div>

          {/* Google or Email Auth */}
          <Button
            type="button"
            size="sm"
            className="w-full mb-4"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google or Email
              </>
            )}
          </Button>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-primary hover:underline"
                disabled={isLoading || isGoogleLoading}
              >
                {authMode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-center text-muted-foreground"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
}
