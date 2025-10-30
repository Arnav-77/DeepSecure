import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { GuideSection } from "./components/GuideSection";
import { ActivityPanel } from "./components/ActivityPanel";
import { AuthenticatorView } from "./components/AuthenticatorView";
import { ProfileView } from "./components/ProfileView";
import { AIAwarenessView } from "./components/AIAwarenessView";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  const [activeView, setActiveView] = useState<"dashboard" | "authenticator" | "profile" | "ai-awareness">("dashboard");
  const [activeProfileTab, setActiveProfileTab] = useState<"profile" | "account" | "billing">("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavigateToProfile = (tab?: "profile" | "account" | "billing") => {
    setActiveView("profile");
    if (tab) {
      setActiveProfileTab(tab);
    }
  };

  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onNavigateToProfile={handleNavigateToProfile}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <DashboardHeader 
          title={
            activeView === "dashboard" ? "Dashboard" : 
            activeView === "authenticator" ? "Authenticator" : 
            activeView === "ai-awareness" ? "AI Awareness" :
            "Account"
          }
          onNavigateToProfile={handleNavigateToProfile}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        <main className={`pt-16 h-screen overflow-auto scrollable-content transition-all duration-300 ease-in ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-8 h-full">
            {activeView === "dashboard" ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100%-2rem)]">
                <div className="lg:col-span-3 overflow-auto scrollable-content">
                  <GuideSection />
                </div>
                <div className="lg:col-span-2 overflow-auto scrollable-content">
                  <ActivityPanel />
                </div>
              </div>
            ) : activeView === "authenticator" ? (
              <div className="h-[calc(100%-2rem)]">
                <AuthenticatorView />
              </div>
            ) : activeView === "ai-awareness" ? (
              <div className="h-[calc(100%-2rem)] overflow-auto scrollable-content">
                <AIAwarenessView />
              </div>
            ) : (
              <div className="h-[calc(100%-2rem)]">
                <ProfileView defaultTab={activeProfileTab} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
