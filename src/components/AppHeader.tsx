import { useState } from "react";
import { Menu } from "lucide-react";
import type { AppState, UserData } from "../types";
import logoImage from "../assets/b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

interface AppHeaderProps {
  user: UserData;
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}

export function AppHeader({ user, currentState, onNavigate }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs = [
    { label: "Dashboard", state: "dashboard" as AppState },
    { label: "Inventory Library", state: "library" as AppState },
    { label: "Reports & Insights", state: "reports" as AppState },
    { label: "Settings", state: "settings" as AppState },
  ];

  const handleNavigation = (state: AppState) => {
    onNavigate(state);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 w-full overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo and User Info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button 
              onClick={() => onNavigate("dashboard")}
              className="cursor-pointer hover:opacity-80 transition-opacity touch-manipulation flex-shrink-0"
              aria-label="Go to dashboard"
            >
              <img src={logoImage} alt="Inventorly" className="h-7 sm:h-8 w-auto" />
            </button>
            <div className="min-w-0 flex-1 hidden sm:block">
              <h4 className="text-foreground text-sm sm:text-base truncate">Welcome back, {user.fullName}</h4>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">{user.businessName}</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.state}
                onClick={() => onNavigate(tab.state)}
                className={`px-4 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation ${
                  currentState === tab.state
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] touch-manipulation"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b border-border flex-shrink-0">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.state}
                      onClick={() => handleNavigation(tab.state)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-colors min-h-[44px] touch-manipulation flex items-center ${
                        currentState === tab.state
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
                {/* User Info in Mobile Menu */}
                <div className="px-6 py-4 border-t border-border flex-shrink-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.businessName}</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
