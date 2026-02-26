import { X, Settings as SettingsIcon, Bell, ExternalLink, Play, Minus, Plus, ChevronDown, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { toast } from "sonner";
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
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-[#f9fafb]'} transition-colors duration-300`}>
      {/* Close Button - Desktop Only */}
      <div className="p-4 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#1a1a1a] transition-all rounded-xl"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1.5 mt-2">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] ring-1 ring-gray-200 dark:ring-white/10"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`} />
              <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / App Version in Sidebar */}
      <div className="p-5 mt-auto border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-[0.1em] px-1 uppercase opacity-80">
          <SettingsIcon className="w-3 h-3" />
          <span>AEGIS VERSION 3.2.1</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[880px] h-[85vh] sm:h-[620px] p-0 gap-0 bg-white dark:bg-[#151515] border-gray-200/50 dark:border-white/10 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[2rem] ring-1 ring-black/5 dark:ring-white/5 transition-all">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your application preferences and settings
        </DialogDescription>

        <div className="flex h-full w-full">
          {/* Left Sidebar Navigation - Desktop Only */}
          <div className="hidden md:flex w-[260px] border-r border-gray-100 dark:border-white/5 flex-col shrink-0">
            <NavigationSidebar />
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden ${theme === 'dark' ? 'bg-[#151515]' : 'bg-white'}`}>
            {/* Section Title with Mobile Menu */}
            <div className={`px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#151515]/90' : 'bg-white/90'} backdrop-blur-xl`}>
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden h-10 w-10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-[#0f0f0f] border-r border-gray-100 dark:border-white/5">
                    <NavigationSidebar />
                  </SheetContent>
                </Sheet>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {activeSection === "general" ? "General" : "Notifications"}
                </h2>
              </div>

              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content Container */}
            <div className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${theme === 'dark' ? 'bg-[#151515]' : 'bg-white'}`}>
              <div className="max-w-2xl mx-auto px-10 py-10">
                {activeSection === "general" ? (
                  <div className="space-y-3 sm:space-y-4 max-w-2xl">
                    {/* App updates */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">App updates</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          Current version: 3.2.1
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 w-full sm:w-auto h-9 px-4 rounded-xl text-sm font-medium transition-all"
                        onClick={handleCheckUpdates}
                      >
                        Check for updates
                      </Button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    {/* Launch at Login */}
                    <div className="flex items-center justify-between py-3 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Launch at Login</div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-500 font-medium font-mono uppercase tracking-tight">
                          {launchAtLogin ? "On" : "Off"}
                        </span>
                        <Switch
                          checked={launchAtLogin}
                          onCheckedChange={(checked: boolean) => {
                            setLaunchAtLogin(checked);
                            toast.success(`Launch at login ${checked ? "enabled" : "disabled"}`);
                          }}
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <ExternalLink className="w-4 h-4 text-gray-300 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/40 cursor-pointer transition-colors" />
                      </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    {/* Companion window hotkey */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Companion window hotkey</div>
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 w-fit">
                        Option + Space
                      </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Appearance</div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[120px]"
                        onClick={() => {
                          const newTheme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
                          setTheme(newTheme);
                          toast.success(`Theme changed to ${newTheme}`);
                        }}
                      >
                        <span className="text-sm capitalize font-medium">{theme}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Accent color</div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[120px]"
                        onClick={() => {
                          const colors = ["default", "purple", "green", "orange"];
                          const currentIndex = colors.indexOf(accentColor);
                          const nextColor = colors[(currentIndex + 1) % colors.length];
                          setAccentColor(nextColor);
                          toast.success(`Accent color changed to ${nextColor}`);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                          <span className="text-sm capitalize font-medium">{accentColor}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Text size</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                          onClick={handleTextSizeDecrease}
                          disabled={textSize <= 80}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                          onClick={handleTextSizeIncrease}
                          disabled={textSize >= 150}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 h-9 px-4 rounded-xl text-sm font-medium transition-all ml-1"
                          onClick={handleTextSizeReset}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Language</div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[120px]"
                        onClick={() => {
                          const languages = ["auto", "en", "es", "fr", "de", "ja", "zh"];
                          const currentIndex = languages.indexOf(language);
                          const nextLang = languages[(currentIndex + 1) % languages.length];
                          setLanguage(nextLang);
                          toast.success(`Language changed to ${nextLang === "auto" ? "auto-detect" : nextLang}`);
                        }}
                      >
                        <span className="text-sm font-medium">{language === "auto" ? "Auto-detect" : language.toUpperCase()}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col gap-3 py-3">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">Spoken language</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                          For best results, select the language you mainly speak. If it's not listed, it may
                          still be supported via auto-detection.
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[120px]"
                        onClick={() => {
                          const languages = ["auto", "en", "es", "fr", "de", "ja", "zh"];
                          const currentIndex = languages.indexOf(spokenLanguage);
                          const nextLang = languages[(currentIndex + 1) % languages.length];
                          setSpokenLanguage(nextLang);
                          toast.success(`Spoken language changed to ${nextLang === "auto" ? "auto-detect" : nextLang}`);
                        }}
                      >
                        <span className="text-sm font-medium">{spokenLanguage === "auto" ? "Auto-detect" : spokenLanguage.toUpperCase()}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                      <div className="text-gray-900 dark:text-white text-[15px] font-medium">Voice</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 h-9 px-4 rounded-xl text-sm font-medium transition-all"
                          onClick={handlePlayVoice}
                        >
                          <Play className="w-4 h-4 mr-2 text-blue-500" />
                          Preview
                        </Button>
                        <button
                          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all min-w-[100px] justify-between"
                          onClick={() => {
                            const voices = ["sol", "luna", "nova", "echo"];
                            const currentIndex = voices.indexOf(voice);
                            const nextVoice = voices[(currentIndex + 1) % voices.length];
                            setVoice(nextVoice);
                            toast.success(`Voice changed to ${nextVoice}`);
                          }}
                        >
                          <span className="text-sm font-medium capitalize">{voice}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 max-w-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">Responses</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                          Get notified when AegisAI responds to requests that take time, like research or file processing.
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[140px] flex-shrink-0"
                        onClick={() => {
                          const options = ["push", "email", "push-email", "off"];
                          const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                          const currentIndex = options.indexOf(responsesNotif);
                          const nextOption = options[(currentIndex + 1) % options.length];
                          setResponsesNotif(nextOption);
                          toast.success(`Responses notifications: ${labels[nextOption as keyof typeof labels]}`);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {responsesNotif === "push" ? "Push" : responsesNotif === "email" ? "Email" : responsesNotif === "push-email" ? "Push, Email" : "Off"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">Tasks</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                          Get notified when tasks you've created have updates.
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[140px] flex-shrink-0"
                        onClick={() => {
                          const options = ["push", "email", "push-email", "off"];
                          const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                          const currentIndex = options.indexOf(tasksNotif);
                          const nextOption = options[(currentIndex + 1) % options.length];
                          setTasksNotif(nextOption);
                          toast.success(`Tasks notifications: ${labels[nextOption as keyof typeof labels]}`);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {tasksNotif === "push" ? "Push" : tasksNotif === "email" ? "Email" : tasksNotif === "push-email" ? "Push, Email" : "Off"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">Projects</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                          Get notified when you receive an email invitation to a shared project.
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[140px] flex-shrink-0"
                        onClick={() => {
                          const options = ["push", "email", "push-email", "off"];
                          const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                          const currentIndex = options.indexOf(projectsNotif);
                          const nextOption = options[(currentIndex + 1) % options.length];
                          setProjectsNotif(nextOption);
                          toast.success(`Projects notifications: ${labels[nextOption as keyof typeof labels]}`);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {projectsNotif === "push" ? "Push" : projectsNotif === "email" ? "Email" : projectsNotif === "push-email" ? "Push, Email" : "Off"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-800" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-white text-[15px] font-medium">Recommendations</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                          Stay in the loop on new tools, tips, and features from AegisAI.
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-all w-full sm:w-auto justify-between sm:justify-start min-w-[140px] flex-shrink-0"
                        onClick={() => {
                          const options = ["push", "email", "push-email", "off"];
                          const labels = { push: "Push", email: "Email", "push-email": "Push, Email", off: "Off" };
                          const currentIndex = options.indexOf(recommendationsNotif);
                          const nextOption = options[(currentIndex + 1) % options.length];
                          setRecommendationsNotif(nextOption);
                          toast.success(`Recommendations notifications: ${labels[nextOption as keyof typeof labels]}`);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {recommendationsNotif === "push" ? "Push" : recommendationsNotif === "email" ? "Email" : recommendationsNotif === "push-email" ? "Push, Email" : "Off"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
