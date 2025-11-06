import type { AppState, UserData } from "../types";
import logoImage from "figma:asset/b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png";

interface AppHeaderProps {
  user: UserData;
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}

export function AppHeader({ user, currentState, onNavigate }: AppHeaderProps) {
  const tabs = [
    { label: "Dashboard", state: "dashboard" as AppState },
    { label: "Inventory Library", state: "library" as AppState },
    { label: "Reports & Insights", state: "reports" as AppState },
    { label: "Settings", state: "settings" as AppState },
  ];

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and User Info */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate("dashboard")}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Go to dashboard"
            >
              <img src={logoImage} alt="Inventorly" className="h-8 w-auto" />
            </button>
            <div>
              <h4 className="text-foreground">Welcome back, {user.fullName}</h4>
              <p className="text-muted-foreground">{user.businessName}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.state}
                onClick={() => onNavigate(tab.state)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentState === tab.state
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex gap-2 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.state}
              onClick={() => onNavigate(tab.state)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                currentState === tab.state
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
