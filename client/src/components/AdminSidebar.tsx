import {
  Home,
  FileText,
  Plus,
  Tag,
  Layout,
  Image,
  Upload,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Trash2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

interface AdminSidebarProps {
  activeItem?: string;
  collapsed?: boolean;
}

export default function AdminSidebar({ activeItem = "dashboard", collapsed = false }: AdminSidebarProps) {
  const [location] = useLocation();

  // Debug logging for sidebar navigation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 [SIDEBAR] Active item changed:', {
        activeItem,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }, [activeItem, location]);
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
  ];

  const contentItems = [
    {
      title: "All Posts",
      url: "/posts",
      icon: FileText,
      badge: "124",
    },
    {
      title: "New Post",
      url: "/posts/new",
      icon: Plus,
    },
    {
      title: "Categories / Tags",
      url: "/categories",
      icon: Tag,
    },
  ];

  const layoutItems = [
    {
      title: "Sections Board",
      url: "/layout/sections",
      icon: Layout,
    },
    {
      title: "Hero / Featured",
      url: "/layout/hero",
      icon: Layout,
    },
    {
      title: "Sidebars & Widgets",
      url: "/layout/widgets",
      icon: Layout,
    },
  ];

  const mediaItems = [
    {
      title: "Media Library",
      url: "/media",
      icon: Image,
      badge: "2.1k",
    },
    {
      title: "Upload",
      url: "/media/upload",
      icon: Upload,
    },
  ];

  const systemItems = [
    {
      title: "Scheduling",
      url: "/schedule",
      icon: Calendar,
    },
    {
      title: "Users & Roles",
      url: "/users",
      icon: Users,
    },
    {
      title: "Analytics & Reports",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Trash / Archived",
      url: "/trash",
      icon: Trash2,
    },
  ];

  const isActiveRoute = (url: string) => {
    if (url === "/" && location === "/") return true;
    if (url !== "/" && location.startsWith(url)) return true;
    return false;
  };

  const renderMenuItems = (items: any[], groupTitle?: string) => (
    <SidebarGroup>
      {groupTitle && <SidebarGroupLabel>{groupTitle}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton 
                asChild
                isActive={isActiveRoute(item.url)}
                data-testid={`sidebar-${item.url.replace(/\//g, '-').replace(/^-/, '')}`}
                className="w-full justify-start"
              >
                <Link 
                  href={item.url}
                  onClick={() => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('🔗 [SIDEBAR] Navigation clicked:', {
                        from: location,
                        to: item.url,
                        title: item.title,
                        timestamp: new Date().toISOString()
                      });
                    }
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {!collapsed && (
                    <>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarContent>
        {renderMenuItems(menuItems)}
        {renderMenuItems(contentItems, "Content")}
        {renderMenuItems(layoutItems, "Layout Manager")}
        {renderMenuItems(mediaItems, "Media Library")}
        {renderMenuItems(systemItems, "System")}
      </SidebarContent>
    </Sidebar>
  );
}