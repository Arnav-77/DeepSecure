import { Home, Shield, Brain, Settings, AlertTriangle, CheckCircle, RotateCw, Lightbulb, Headset, Info, PanelLeftClose } from "lucide-react";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { HelpCenterDialog } from "./HelpCenterDialog";
import { SettingsDialog } from "./SettingsDialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState, useEffect } from "react";

interface DetectionResult {
  score: number;
  anomaly_string: string;
  malware_flag: boolean;
  components?: {
    visual_score?: number;
    auditory_score?: number;
    signature_check?: {
      has_signature: boolean;
      matches: string[];
    };
    metadata_keys?: number;
    temporal_check?: {
      motion_jitter: number;
      is_video: boolean;
      frame_count: number;
    };
  };
}

interface Chat {
  id: string;
  title: string;
  timestamp: number;
  time: string;
  result?: DetectionResult;
  filename?: string;
}

interface SidebarProps {
  activeView: "dashboard" | "authenticator" | "profile" | "ai-awareness";
  onViewChange: (view: "dashboard" | "authenticator" | "profile" | "ai-awareness") => void;
  onNavigateToProfile: (tab: "profile" | "account" | "billing") => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const STORAGE_KEY = "deepsecure_previous_chats";

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

const loadChatsFromStorage = (): Chat[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const chats: Chat[] = JSON.parse(stored);
      return chats.map(chat => ({
        ...chat,
        time: formatRelativeTime(chat.timestamp)
      }));
    }
  } catch (error) {
    console.error("Error loading chats from storage:", error);
  }
  
  // Default chats if storage is empty
  const defaultChats: Chat[] = [
    { id: "1", title: "Security Analysis Q4", timestamp: Date.now() - 2 * 60 * 60 * 1000, time: "2 hours ago" },
    { id: "2", title: "Authentication Setup", timestamp: Date.now() - 24 * 60 * 60 * 1000, time: "Yesterday" },
    { id: "3", title: "Integration Help", timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, time: "2 days ago" },
    { id: "4", title: "Password Management", timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, time: "3 days ago" },
    { id: "5", title: "2FA Configuration", timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, time: "1 week ago" },
  ];
  saveChatsToStorage(defaultChats);
  return defaultChats.map(chat => ({
    ...chat,
    time: formatRelativeTime(chat.timestamp)
  }));
};

const saveChatsToStorage = (chats: Chat[]) => {
  try {
    // Save id, title, timestamp, result, and filename (time is computed dynamically)
    const chatsToSave = chats.map(({ id, title, timestamp, result, filename }) => ({
      id,
      title,
      timestamp,
      result,
      filename
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatsToSave));
  } catch (error) {
    console.error("Error saving chats to storage:", error);
  }
};

// Export function to add new chat (can be called from AuthenticatorView)
export const addChatToStorage = (title: string, result?: DetectionResult, filename?: string) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let existingChats: Chat[] = [];
    
    if (stored) {
      try {
        existingChats = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored chats:", e);
      }
    }
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: title || "New Chat",
      timestamp: Date.now(),
      result,
      filename
    };
    
    // Add to beginning and limit to last 50 chats
    const updatedChats = [newChat, ...existingChats].slice(0, 50);
    saveChatsToStorage(updatedChats);
    
    // Dispatch custom event to notify Sidebar to refresh
    window.dispatchEvent(new CustomEvent("chatsUpdated"));
  } catch (error) {
    console.error("Error adding chat to storage:", error);
  }
};

export function Sidebar({ activeView, onViewChange, onNavigateToProfile, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previousChats, setPreviousChats] = useState<Chat[]>([]);
  
  const menuItems = [
    { icon: Home, label: "Dashboard", view: "dashboard" as const },
    { icon: Shield, label: "Authenticator", view: "authenticator" as const },
    { icon: Brain, label: "AI Awareness", view: "ai-awareness" as const },
  ];

  useEffect(() => {
    // Load chats on mount
    setPreviousChats(loadChatsFromStorage());
    
    // Listen for chat updates
    const handleChatsUpdated = () => {
      setPreviousChats(loadChatsFromStorage());
    };
    
    window.addEventListener("chatsUpdated", handleChatsUpdated);
    
    // Update time every minute
    const interval = setInterval(() => {
      setPreviousChats(prev => prev.map(chat => ({
        ...chat,
        time: formatRelativeTime(chat.timestamp)
      })));
    }, 60000);
    
    return () => {
      window.removeEventListener("chatsUpdated", handleChatsUpdated);
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo / Toggle Button */}
      <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        {isCollapsed ? (
          <button 
            onClick={onToggleCollapse}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <div className="w-4 h-4 border-2 border-white rounded"></div>
          </button>
        ) : (
          <>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded"></div>
            </div>
            <div className="flex-1">
              <div className="text-gray-900 dark:text-gray-100">DeepSecure</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-400 h-8 w-8"
              onClick={onToggleCollapse}
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pb-4 pt-2">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</div>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.view === activeView;
              
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Authenticator") {
                      setIsAuthDialogOpen(true);
                    } else if (item.view) {
                      onViewChange(item.view);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Previous Chats */}
        {!isCollapsed && (
          <div className="flex-1 px-3 pt-4 overflow-hidden flex flex-col">
            <div className="px-3 mb-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Previous Chats</div>
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-3">
                {previousChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      console.log("Chat clicked:", chat);
                      onViewChange("authenticator");
                      // Dispatch event with chat data to load in AuthenticatorView
                      // Add a small delay to ensure component is ready
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("loadChat", { 
                          detail: { chat } 
                        }));
                      }, 200);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="text-sm truncate font-medium">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Bottom Section - Settings & Support */}
      <div className="px-3 pb-3">
        <Separator className="mb-3" />
        <div className="space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => setIsHelpCenterOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "Support" : undefined}
          >
            <Headset className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Support</span>}
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen}
      />

      {/* Help Center Dialog */}
      <HelpCenterDialog 
        open={isHelpCenterOpen} 
        onOpenChange={setIsHelpCenterOpen}
      />

      {/* Authenticator Dialog */}
      <Dialog 
        open={isAuthDialogOpen} 
        onOpenChange={(open) => {
          setIsAuthDialogOpen(open);
          if (!open) {
            // When dialog closes, navigate to authenticator view
            onViewChange("authenticator");
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto scrollable-content">
          <DialogHeader className="gap-3">
            <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Info className="w-6 h-6 text-blue-500" />
              Important: How to Use the Authenticator Effectively
            </DialogTitle>
            <DialogDescription>
              Please read these guidelines to get the best results from our authenticator tool.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Section 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2">Not a One-Click Solution</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    The authenticator is a powerful tool, but it requires your review and interaction
                    to achieve the best results.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2">Review and Verify Credentials</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    After authentication, some credentials may need verification. Check each entry
                    to see alternative options and choose the one that fits best.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 items-start">
                <RotateCw className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2">Regenerate Security Tokens</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you're not satisfied with the token alternatives, you can regenerate new
                    tokens by clicking the refresh button.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 items-start">
                <Lightbulb className="w-5 h-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2">Initial Setup Quality Matters</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your authentication security depends heavily on the quality of your initial setup.
                    You'll get better results using strong passwords and multi-factor authentication
                    methods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
