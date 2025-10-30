import { Settings, ExternalLink, Play, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { useTheme } from "./ThemeProvider";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [accentColor, setAccentColor] = useState("default");
  const [textSize, setTextSize] = useState(100);
  const [language, setLanguage] = useState("auto");
  const [spokenLanguage, setSpokenLanguage] = useState("auto");
  const [voice, setVoice] = useState("sol");

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

  return (
    <div className="h-full flex flex-col">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manage your application preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Section */}
          <div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-6">General</h3>
            
            <div className="space-y-6">
              {/* App updates */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-900 dark:text-gray-100">App updates</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Current version: 3.2.1
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  onClick={handleCheckUpdates}
                >
                  Check for updates
                </Button>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Launch at Login */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Launch at Login</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {launchAtLogin ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={launchAtLogin}
                    onCheckedChange={(checked) => {
                      setLaunchAtLogin(checked);
                      toast.success(`Launch at login ${checked ? "enabled" : "disabled"}`);
                    }}
                  />
                  <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Companion window hotkey */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Companion window hotkey</Label>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  Alt + SPACE
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Appearance */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Appearance</Label>
                <Select value={theme} onValueChange={(value) => {
                  setTheme(value as "light" | "dark" | "system");
                  toast.success(`Theme changed to ${value}`);
                }}>
                  <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Accent color */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Accent color</Label>
                <Select value={accentColor} onValueChange={(value) => {
                  setAccentColor(value);
                  toast.success(`Accent color changed to ${value}`);
                }}>
                  <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Default
                      </div>
                    </SelectItem>
                    <SelectItem value="purple">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        Purple
                      </div>
                    </SelectItem>
                    <SelectItem value="green">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Green
                      </div>
                    </SelectItem>
                    <SelectItem value="orange">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        Orange
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Text size */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Text size</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    onClick={handleTextSizeDecrease}
                    disabled={textSize <= 80}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    onClick={handleTextSizeIncrease}
                    disabled={textSize >= 150}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    onClick={handleTextSizeReset}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Language */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Language</Label>
                <Select value={language} onValueChange={(value) => {
                  setLanguage(value);
                  toast.success(`Language changed to ${value === "auto" ? "auto-detect" : value}`);
                }}>
                  <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Spoken language */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label className="text-gray-900 dark:text-gray-100">Spoken language</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    For best results, select the language you mainly speak. If it's not listed, it may
                    still be supported via auto-detection.
                  </p>
                </div>
                <Select value={spokenLanguage} onValueChange={(value) => {
                  setSpokenLanguage(value);
                  toast.success(`Spoken language changed to ${value === "auto" ? "auto-detect" : value}`);
                }}>
                  <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ml-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Voice */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Voice</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    onClick={handlePlayVoice}
                  >
                    <Play className="w-3 h-3 mr-2" />
                    Play
                  </Button>
                  <Select value={voice} onValueChange={(value) => {
                    setVoice(value);
                    toast.success(`Voice changed to ${value}`);
                  }}>
                    <SelectTrigger className="w-[140px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sol">Sol</SelectItem>
                      <SelectItem value="luna">Luna</SelectItem>
                      <SelectItem value="nova">Nova</SelectItem>
                      <SelectItem value="echo">Echo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
