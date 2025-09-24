import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import TopNavbar from "./TopNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function AdminLayout({ children, currentPage = "dashboard", onNavigate }: AdminLayoutProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <SidebarProvider style={style as React.CSSProperties}>
          <AdminSidebar 
            activeItem={currentPage}
            onItemClick={onNavigate}
          />
        </SidebarProvider>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavbar 
          onSearch={(query) => console.log("Global search:", query)} 
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}