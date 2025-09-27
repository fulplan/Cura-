import { Search, Bell, User, Settings, LogOut, PanelLeft, PanelLeftOpen, Menu, FileText, Folder, Image, ArrowRight } from "lucide-react";
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
import { useGlobalSearch } from "@/hooks/useSearch";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TopNavbarProps {
  onSearch?: (query: string) => void;
  currentPage?: string;
}

export default function TopNavbar({ onSearch, currentPage }: TopNavbarProps) {
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: searchData, isLoading: isSearching } = useGlobalSearch(searchQuery);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query.trim()) {
      setSearchQuery(query.trim());
      setShowResults(true);
      onSearch?.(query);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);
  };
  
  const handleResultClick = (result: any) => {
    setShowResults(false);
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    
    // Navigate based on result type
    switch (result.type) {
      case 'post':
        setLocation(`/posts/${result.id}`);
        break;
      case 'category':
        setLocation(`/categories/${result.id}`);
        break;
      case 'media':
        setLocation(`/media`);
        break;
      default:
        break;
    }
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'category': return <Folder className="h-4 w-4" />;
      case 'media': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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
        
        <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              name="search"
              placeholder="Search posts, categories, media..."
              className="pl-10 w-full"
              data-testid="input-global-search"
              onChange={handleInputChange}
              onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
            />
          </form>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : searchData?.results?.length ? (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    {searchData.total} result{searchData.total !== 1 ? 's' : ''} found
                  </div>
                  {searchData.results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none transition-colors flex items-start gap-3"
                    >
                      <div className="mt-0.5 text-muted-foreground">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.excerpt && (
                          <div className="text-sm text-muted-foreground truncate">
                            {result.excerpt}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-1.5 py-0.5 bg-secondary rounded capitalize">
                            {result.type}
                          </span>
                          {result.authorName && (
                            <span className="text-xs text-muted-foreground">
                              by {result.authorName}
                            </span>
                          )}
                          {result.categoryName && (
                            <span className="text-xs text-muted-foreground">
                              in {result.categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length > 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try different keywords or check your spelling</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
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