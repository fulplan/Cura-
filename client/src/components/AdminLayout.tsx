import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import TopNavbar from "./TopNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function AdminLayout({ children, currentPage = "dashboard" }: AdminLayoutProps) {

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="mobile-full-height w-full flex">
        {/* Sidebar */}
        <AdminSidebar 
          activeItem={currentPage}
        />
        
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <TopNavbar 
            onSearch={(query) => console.log("Global search:", query)} 
            currentPage={currentPage}
          />
          
          <main className="flex-1 overflow-auto bg-background">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}