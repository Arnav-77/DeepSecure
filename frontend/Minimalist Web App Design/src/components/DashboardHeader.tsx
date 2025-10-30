import { Sun, Moon, Monitor, ChevronDown, Zap, User, CreditCard, LogOut, KeyRound } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

interface DashboardHeaderProps {
  title?: string;
  onNavigateToProfile?: (tab?: "profile" | "account" | "billing") => void;
  isSidebarCollapsed?: boolean;
}

export function DashboardHeader({ title = "Dashboard", onNavigateToProfile, isSidebarCollapsed = false }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="w-5 h-5" />;
    if (theme === "light") return <Sun className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <header className={`h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 right-0 z-10 transition-all duration-300 ease-in ${isSidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-gray-900 dark:text-gray-100">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                  SS
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">Saransh Sabharwal</span>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-gray-900 dark:text-gray-100">Saransh Sabharwal</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    sabharwalsaransh@gmail.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToProfile?.("profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToProfile?.("account")}>
                <KeyRound className="w-4 h-4 mr-2" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToProfile?.("billing")}>
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                {getThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
