import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import SimpleMobileNav from "./SimpleMobileNav";

interface MobileNavigationProps {
  currentPage?: string;
}

export default function MobileNavigation({ currentPage = "dashboard" }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen) {
      if (import.meta.env.MODE === 'development') {
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
    if (import.meta.env.MODE === 'development') {
      console.log('📱 [MOBILE NAV] Menu state changed:', {
        isOpen,
        currentPage,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }, [isOpen, currentPage, location]);

  return (
    <>
      {/* Custom hamburger button with proper icon state */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-[min(20rem,90vw)] h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          data-testid="sheet-mobile-nav"
          aria-describedby="mobile-nav-description"
        >
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left font-bold text-foreground">
              Penkora
            </SheetTitle>
            <SheetDescription id="mobile-nav-description" className="sr-only">
              Navigation menu for Penkora CMS with content management options
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1">
            <SimpleMobileNav 
              activeItem={currentPage}
              onNavigate={() => setIsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}