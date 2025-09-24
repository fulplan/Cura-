import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import TopNavbar from "./TopNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function AdminLayout({ children, currentPage = "dashboard" }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const style = {
    "--sidebar-width": sidebarCollapsed ? "3rem" : "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden lg:block transition-all duration-200 ${sidebarCollapsed ? 'w-12' : 'w-64'}`}>
        <SidebarProvider style={style}>
          <AdminSidebar 
            activeItem={currentPage}
            collapsed={sidebarCollapsed}
          />
        </SidebarProvider>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavbar 
          onSearch={(query) => console.log("Global search:", query)} 
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}