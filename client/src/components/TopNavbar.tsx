import { Search, Bell, User, Settings, LogOut, PanelLeft, PanelLeftOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface TopNavbarProps {
  onSearch?: (query: string) => void;
  currentPage?: string;
}

export default function TopNavbar({ onSearch, currentPage }: TopNavbarProps) {
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch?.(query);
    console.log("Search triggered:", query);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettings = () => {
    setLocation("/settings");
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 border-b bg-card">
      <div className="flex items-center gap-3 md:gap-6 flex-1">
        {/* Unified Sidebar Toggle - Contextual icons for mobile/desktop */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="flex transition-transform duration-200 hover:scale-105"
                onClick={toggleSidebar}
                aria-pressed={isMobile ? openMobile : state === "expanded"}
                data-testid="button-sidebar-toggle"
              >
                {isMobile ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  state === "collapsed" ? 
                    <PanelLeft className="w-5 h-5" /> : 
                    <PanelLeftOpen className="w-5 h-5" />
                )}
                <span className="sr-only">
                  {isMobile ? "Open navigation menu" : (state === "collapsed" ? "Open sidebar" : "Close sidebar")}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isMobile ? "Open menu" : (state === "collapsed" ? "Open sidebar" : "Close sidebar")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <h1 className="type-heading font-bold text-foreground">
              Penkora
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="relative hidden md:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search posts, users, media..."
            className="pl-10 w-full"
            data-testid="input-global-search"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden interactive focus-ring mobile-touch-target" 
          onClick={() => {
            // Toggle mobile search (could expand to show search input)
            console.log('Mobile search clicked');
          }}
          data-testid="button-mobile-search"
        >
          <Search className="w-5 h-5" />
        </Button>
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative interactive focus-ring mobile-touch-target" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h4 className="font-medium mb-2">Notifications</h4>
              <div className="space-y-2">
                <div className="p-2 rounded hover-elevate">
                  <p className="text-sm">New post pending approval</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <div className="p-2 rounded hover-elevate">
                  <p className="text-sm">Scheduled post published</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <div className="p-2 rounded hover-elevate">
                  <p className="text-sm">New user registered</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="interactive focus-ring mobile-touch-target" data-testid="button-user-profile">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSettings} data-testid="menu-item-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}