import { motion } from "motion/react";
import logoImage from "figma:asset/b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            scale: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
            },
          }}
        >
          <img src={logoImage} alt="Inventorly" className="h-16 w-auto" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-foreground">Setting up your workspace...</h2>
        </motion.div>
      </div>
    </div>
  );
}
