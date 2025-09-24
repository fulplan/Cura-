import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import AdminSidebar from "./AdminSidebar";

interface MobileNavigationProps {
  currentPage?: string;
}

export default function MobileNavigation({ currentPage = "dashboard" }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 [MOBILE NAV] Route changed, closing mobile menu:', {
          newLocation: location,
          timestamp: new Date().toISOString()
        });
      }
      setIsOpen(false);
    }
  }, [location]); // Removed isOpen from dependencies to prevent immediate closing

  // Debug logging for mobile menu state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [MOBILE NAV] Menu state changed:', {
        isOpen,
        currentPage,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }, [isOpen, currentPage, location]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left font-bold text-foreground">
            Penkora
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full">
          <SidebarProvider style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties}>
            <AdminSidebar 
              activeItem={currentPage}
            />
          </SidebarProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
}