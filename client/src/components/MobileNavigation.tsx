import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

interface MobileNavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function MobileNavigation({ currentPage = "dashboard", onNavigate }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    setIsOpen(false); // Close mobile menu after navigation
  };

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
          <AdminSidebar 
            activeItem={currentPage}
            onItemClick={handleNavigate}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}