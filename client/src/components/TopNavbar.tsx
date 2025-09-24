import { Search, Bell, User, Settings, LogOut, Menu, X } from "lucide-react";
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
import MobileNavigation from "./MobileNavigation";

interface TopNavbarProps {
  onSearch?: (query: string) => void;
  currentPage?: string;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function TopNavbar({ onSearch, currentPage, onToggleSidebar, sidebarCollapsed }: TopNavbarProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch?.(query);
    console.log("Search triggered:", query);
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 border-b bg-card">
      <div className="flex items-center gap-3 md:gap-6 flex-1">
        {/* Mobile Navigation */}
        <MobileNavigation currentPage={currentPage} />
        
        {/* Desktop Sidebar Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden lg:flex"
          onClick={onToggleSidebar}
          data-testid="button-sidebar-toggle"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            Penkora
          </h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative hidden sm:block flex-1 max-w-md">
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
        <Button variant="ghost" size="icon" className="sm:hidden" data-testid="button-mobile-search">
          <Search className="w-5 h-5" />
        </Button>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
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
            <Button variant="ghost" size="icon" data-testid="button-user-profile">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem data-testid="menu-item-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-item-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}