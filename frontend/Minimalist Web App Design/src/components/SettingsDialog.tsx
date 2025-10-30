import { X, Settings as SettingsIcon, Bell, ExternalLink, Play, Minus, Plus, ChevronDown, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { useTheme } from "./ThemeProvider";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = "general" | "notifications";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [accentColor, setAccentColor] = useState("default");
  const [textSize, setTextSize] = useState(100);
  const [language, setLanguage] = useState("auto");
  const [spokenLanguage, setSpokenLanguage] = useState("auto");
  const [voice, setVoice] = useState("sol");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Notification settings
  const [responsesNotif, setResponsesNotif] = useState("push");
  const [tasksNotif, setTasksNotif] = useState("push-email");
  const [projectsNotif, setProjectsNotif] = useState("email");
  const [recommendationsNotif, setRecommendationsNotif] = useState("push-email");

  const navigationItems = [
    { id: "general" as const, icon: SettingsIcon, label: "General" },
    { id: "notifications" as const, icon: Bell, label: "Notifications" },
  ];

  const handleCheckUpdates = () => {
    toast.success("Checking for updates...");
    setTimeout(() => {
      toast.success("You're up to date! Running version 3.2.1");
    }, 1500);
  };

  const handlePlayVoice = () => {
    toast.success(`Playing ${voice} voice sample`);
  };

  const handleTextSizeDecrease = () => {
    if (textSize > 80) {
      setTextSize(textSize - 10);
      toast.success(`Text size: ${textSize - 10}%`);
    }
  };

  const handleTextSizeIncrease = () => {
    if (textSize < 150) {
      setTextSize(textSize + 10);
      toast.success(`Text size: ${textSize + 10}%`);
    }
  };

  const handleTextSizeReset = () => {
    setTextSize(100);
    toast.success("Text size reset to 100%");
  };

  const NavigationSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Close Button - Desktop Only */}
      <div className="p-3 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] sm:w-full h-[90vh] sm:h-[85vh] p-0 gap-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your application preferences and settings
        </DialogDescription>
        
        <div className="flex h-full">
          {/* Left Sidebar Navigation - Desktop Only */}
          <div className="hidden md:flex w-36 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-col">
            <NavigationSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Section Title with Mobile Menu */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              {/* Mobile Menu Button */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 text-gray-600 dark:text-gray-400"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <NavigationSidebar />
                </SheetContent>
              </Sheet>

              <h2 className="text-lg text-gray-900 dark:text-gray-100">
                {activeSection === "general" ? "General" : "Notifications"}
              </h2>

              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-gray-600 dark:text-gray-400"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto scrollable-content px-4 sm:px-5 py-4 sm:py-5">
              {activeSection === "general" ? (
                <div className="space-y-3 sm:space-y-4 max-w-2xl">
                  {/* App updates */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div>
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">App updates</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Current version: 3.2.1
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 w-full sm:w-auto h-8 text-xs"
                      onClick={handleCheckUpdates}
                    >
                      Check for updates
                    </Button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Launch at Login */}
                  <div className="flex items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Launch at Login</div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {launchAtLogin ? "On" : "Off"}
                      </span>
                      <Switch
                        checked={launchAtLogin}
                        onCheckedChange={(checked) => {
                          setLaunchAtLogin(checked);
                          toast.success(`Launch at login ${checked ? "enabled" : "disabled"}`);
                        }}
                      />
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Companion window hotkey */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Companion window hotkey</div>
                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 w-fit">
                      Alt + SPACE
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Appearance */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Appearance</div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                      onClick={() => {
                        const newTheme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
                        setTheme(newTheme);
                        toast.success(`Theme changed to ${newTheme}`);
                      }}
                    >
                      <span className="text-xs capitalize">{theme}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Accent color */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Accent color</div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                      onClick={() => {
                        const colors = ["default", "purple", "green", "orange"];
                        const currentIndex = colors.indexOf(accentColor);
                        const nextColor = colors[(currentIndex + 1) % colors.length];
                        setAccentColor(nextColor);
                        toast.success(`Accent color changed to ${nextColor}`);
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs capitalize">{accentColor}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Text size */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Text size</div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleTextSizeDecrease}
                        disabled={textSize <= 80}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleTextSizeIncrease}
                        disabled={textSize >= 150}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 h-7 text-xs"
                        onClick={handleTextSizeReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Language */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Language</div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                      onClick={() => {
                        const languages = ["auto", "en", "es", "fr", "de", "ja", "zh"];
                        const currentIndex = languages.indexOf(language);
                        const nextLang = languages[(currentIndex + 1) % languages.length];
                        setLanguage(nextLang);
                        toast.success(`Language changed to ${nextLang === "auto" ? "auto-detect" : nextLang}`);
                      }}
                    >
                      <span className="text-xs">{language === "auto" ? "Auto-detect" : language.toUpperCase()}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Spoken language */}
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">Spoken language</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        For best results, select the language you mainly speak. If it's not listed, it may
                        still be supported via auto-detection.
                      </p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                      onClick={() => {
                        const languages = ["auto", "en", "es", "fr", "de", "ja", "zh"];
                        const currentIndex = languages.indexOf(spokenLanguage);
                        const nextLang = languages[(currentIndex + 1) % languages.length];
                        setSpokenLanguage(nextLang);
                        toast.success(`Spoken language changed to ${nextLang === "auto" ? "auto-detect" : nextLang}`);
                      }}
                    >
                      <span className="text-xs">{spokenLanguage === "auto" ? "Auto-detect" : spokenLanguage.toUpperCase()}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Voice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">Voice</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 h-7 text-xs"
                        onClick={handlePlayVoice}
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        Play
                      </Button>
                      <button 
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors"
                        onClick={() => {
                          const voices = ["sol", "luna", "nova", "echo"];
                          const currentIndex = voices.indexOf(voice);
                          const nextVoice = voices[(currentIndex + 1) % voices.length];
                          setVoice(nextVoice);
                          toast.success(`Voice changed to ${nextVoice}`);
                        }}
                      >
                        <span className="text-xs capitalize">{voice}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-w-2xl">
                  {/* Responses */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-2">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">Responses</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get notified when DeepSecure responds to requests that take time, like research or file processing.
                      </p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start flex-shrink-0"
                      onClick={() => {
                        const options = ["push", "email", "push-email", "off"];
                        const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                        const currentIndex = options.indexOf(responsesNotif);
                        const nextOption = options[(currentIndex + 1) % options.length];
                        setResponsesNotif(nextOption);
                        toast.success(`Responses notifications: ${labels[nextOption as keyof typeof labels]}`);
                      }}
                    >
                      <span className="text-xs">
                        {responsesNotif === "push" ? "Push" : responsesNotif === "email" ? "Email" : responsesNotif === "push-email" ? "Push, Email" : "Off"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Tasks */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-2">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">Tasks</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get notified when tasks you've created have updates.
                      </p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start flex-shrink-0"
                      onClick={() => {
                        const options = ["push", "email", "push-email", "off"];
                        const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                        const currentIndex = options.indexOf(tasksNotif);
                        const nextOption = options[(currentIndex + 1) % options.length];
                        setTasksNotif(nextOption);
                        toast.success(`Tasks notifications: ${labels[nextOption as keyof typeof labels]}`);
                      }}
                    >
                      <span className="text-xs">
                        {tasksNotif === "push" ? "Push" : tasksNotif === "email" ? "Email" : tasksNotif === "push-email" ? "Push, Email" : "Off"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Projects */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-2">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">Projects</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get notified when you receive an email invitation to a shared project.
                      </p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start flex-shrink-0"
                      onClick={() => {
                        const options = ["push", "email", "push-email", "off"];
                        const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                        const currentIndex = options.indexOf(projectsNotif);
                        const nextOption = options[(currentIndex + 1) % options.length];
                        setProjectsNotif(nextOption);
                        toast.success(`Projects notifications: ${labels[nextOption as keyof typeof labels]}`);
                      }}
                    >
                      <span className="text-xs">
                        {projectsNotif === "push" ? "Push" : projectsNotif === "email" ? "Email" : projectsNotif === "push-email" ? "Push, Email" : "Off"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Recommendations */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-2">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 text-sm mb-0.5">Recommendations</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Stay in the loop on new tools, tips, and features from DeepSecure.
                      </p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 transition-colors w-full sm:w-auto justify-between sm:justify-start flex-shrink-0"
                      onClick={() => {
                        const options = ["push", "email", "push-email", "off"];
                        const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                        const currentIndex = options.indexOf(recommendationsNotif);
                        const nextOption = options[(currentIndex + 1) % options.length];
                        setRecommendationsNotif(nextOption);
                        toast.success(`Recommendations notifications: ${labels[nextOption as keyof typeof labels]}`);
                      }}
                    >
                      <span className="text-xs">
                        {recommendationsNotif === "push" ? "Push" : recommendationsNotif === "email" ? "Email" : recommendationsNotif === "push-email" ? "Push, Email" : "Off"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
