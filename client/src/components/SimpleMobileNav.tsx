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
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SimpleMobileNavProps {
  activeItem?: string;
  onNavigate?: () => void;
}

export default function SimpleMobileNav({ activeItem = "dashboard", onNavigate }: SimpleMobileNavProps) {
  const [location] = useLocation();

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

  const renderMenuSection = (items: any[], title?: string) => (
    <div className="px-4 py-2">
      {title && (
        <h4 className="type-caption font-medium mb-2 px-2">
          {title}
        </h4>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            onClick={() => {
              if (import.meta.env.DEV) {
                console.log('🔗 [MOBILE NAV] Navigation clicked:', {
                  from: location,
                  to: item.url,
                  title: item.title,
                  timestamp: new Date().toISOString()
                });
              }
              onNavigate?.();
            }}
            className={cn(
              "flex items-center gap-3 px-2 py-2 text-sm rounded-md interactive hover:bg-accent hover:text-accent-foreground focus-ring mobile-touch-target",
              isActiveRoute(item.url) 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-foreground"
            )}
            data-testid={`mobile-nav-${item.url.replace(/\//g, '-').replace(/^-/, '')}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {renderMenuSection(menuItems)}
      {renderMenuSection(contentItems, "Content")}
      {renderMenuSection(layoutItems, "Layout Manager")}
      {renderMenuSection(mediaItems, "Media Library")}
      {renderMenuSection(systemItems, "System")}
    </div>
  );
}