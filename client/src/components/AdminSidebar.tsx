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

interface AdminSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export default function AdminSidebar({ activeItem = "dashboard", onItemClick }: AdminSidebarProps) {
  const menuItems = [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: Home,
    },
  ];

  const contentItems = [
    {
      title: "All Posts",
      url: "posts",
      icon: FileText,
      badge: "124",
    },
    {
      title: "New Post",
      url: "posts/new",
      icon: Plus,
    },
    {
      title: "Categories / Tags",
      url: "categories",
      icon: Tag,
    },
  ];

  const layoutItems = [
    {
      title: "Sections Board",
      url: "layout/sections",
      icon: Layout,
    },
    {
      title: "Hero / Featured",
      url: "layout/hero",
      icon: Layout,
    },
    {
      title: "Sidebars & Widgets",
      url: "layout/widgets",
      icon: Layout,
    },
  ];

  const mediaItems = [
    {
      title: "Media Library",
      url: "media",
      icon: Image,
      badge: "2.1k",
    },
    {
      title: "Upload",
      url: "media/upload",
      icon: Upload,
    },
  ];

  const systemItems = [
    {
      title: "Scheduling",
      url: "schedule",
      icon: Calendar,
    },
    {
      title: "Users & Roles",
      url: "users",
      icon: Users,
    },
    {
      title: "Analytics & Reports",
      url: "analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "settings",
      icon: Settings,
    },
    {
      title: "Trash / Archived",
      url: "trash",
      icon: Trash2,
    },
  ];

  const renderMenuItems = (items: any[], groupTitle?: string) => (
    <SidebarGroup>
      {groupTitle && <SidebarGroupLabel>{groupTitle}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton 
                isActive={activeItem === item.url}
                onClick={() => {
                  onItemClick?.(item.url);
                  console.log(`Navigate to: ${item.url}`);
                }}
                data-testid={`sidebar-${item.url.replace('/', '-')}`}
                className="w-full justify-start"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
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