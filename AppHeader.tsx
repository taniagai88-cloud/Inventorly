import { motion } from "motion/react";
import { 
  Menu,
  LayoutDashboard,
  Library,
  BarChart3
} from "lucide-react";
import { Button } from "./ui-custom/button";
import logo from "figma:asset/815a36ee3b9743b756569c7710735c64f0b01ef6.png";

interface AppHeaderProps {
  userName: string;
  businessName: string;
  currentPage: "dashboard" | "library" | "reports";
  onNavigate: (page: "dashboard" | "library" | "reports") => void;
}

export function AppHeader({ userName = "User", businessName = "Your Business", currentPage, onNavigate }: AppHeaderProps) {
  // Get the first character of userName, with fallback
  const userInitial = userName && userName.length > 0 ? userName.charAt(0).toUpperCase() : "U";
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border bg-card sticky top-0 z-10"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <img src={logo} alt="Inventorly" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-muted-foreground">{businessName}</p>
            <p className="text-muted-foreground">{userName}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {userInitial}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="border-t border-border px-6">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className={`gap-2 border-b-2 ${
              currentPage === "dashboard" 
                ? "border-primary" 
                : "border-transparent hover:border-border"
            } rounded-none px-4 py-5`}
            onClick={() => onNavigate("dashboard")}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className={`gap-2 border-b-2 ${
              currentPage === "library" 
                ? "border-primary" 
                : "border-transparent hover:border-border"
            } rounded-none px-4 py-5`}
            onClick={() => onNavigate("library")}
          >
            <Library className="w-4 h-4" />
            Inventory Library
          </Button>
          <Button
            variant="ghost"
            className={`gap-2 border-b-2 ${
              currentPage === "reports" 
                ? "border-primary" 
                : "border-transparent hover:border-border"
            } rounded-none px-4 py-5`}
            onClick={() => onNavigate("reports")}
          >
            <BarChart3 className="w-4 h-4" />
            Reports & Insights
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
