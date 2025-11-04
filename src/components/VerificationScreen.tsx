import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import type { AuthMode } from "../types";

interface VerificationScreenProps {
  mode: AuthMode;
  phoneNumber: string;
  onVerify: () => void;
  onBack: () => void;
}

export function VerificationScreen({
  mode,
  phoneNumber,
  onVerify,
  onBack,
}: VerificationScreenProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setIsLoading(true);
    
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onVerify();
    setIsLoading(false);
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    setOtp("");
    
    // Simulate resend
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border elevation-sm p-8 rounded-lg">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-foreground mb-2">Enter verification code</h2>
            <p className="text-muted-foreground">
              We sent a 6-digit code to {phoneNumber}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6 flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
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

          {/* Resend Code */}
          <div className="text-center mb-6">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary hover:underline"
              >
                Resend verification code
              </button>
            ) : (
              <p className="text-muted-foreground">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              "Verifying..."
            ) : (
              `Verify and ${mode === "signup" ? "Create Account" : "Sign In"}`
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
