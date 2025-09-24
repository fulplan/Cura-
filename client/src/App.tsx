import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminLayout from "@/components/AdminLayout";
import Dashboard from "@/components/Dashboard";
import PostsList from "@/components/PostsList";
import MediaLibrary from "@/components/MediaLibrary";
import LayoutManager from "@/components/LayoutManager";
import UsersManager from "@/components/UsersManager";
import NotFound from "@/pages/not-found";
import ErrorBoundary from "@/components/ErrorBoundary";

function Router() {
  const [location] = useLocation();

  // Debug logging for route changes
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 [ROUTER] Route changed:', {
        location,
        timestamp: new Date().toISOString(),
        currentPage: getCurrentPage()
      });
    }
  }, [location]);

  const getCurrentPage = () => {
    if (location === '/' || location === '/dashboard') return 'dashboard';
    if (location.startsWith('/posts')) return 'posts';
    if (location.startsWith('/media')) return 'media';
    if (location.startsWith('/layout')) return location.replace('/', '');
    if (location.startsWith('/users')) return 'users';
    if (location.startsWith('/categories')) return 'categories';
    if (location.startsWith('/schedule')) return 'schedule';
    if (location.startsWith('/analytics')) return 'analytics';
    if (location.startsWith('/settings')) return 'settings';
    if (location.startsWith('/trash')) return 'trash';
    return location.replace('/', '');
  };

  return (
    <Switch>
      {/* Dashboard Routes */}
      <Route path="/">
        <AdminLayout currentPage={getCurrentPage()}>
          <Dashboard onQuickAction={(action) => console.log("Quick action:", action)} />
        </AdminLayout>
      </Route>
      
      <Route path="/dashboard">
        <AdminLayout currentPage={getCurrentPage()}>
          <Dashboard onQuickAction={(action) => console.log("Quick action:", action)} />
        </AdminLayout>
      </Route>
      
      {/* Posts Routes */}
      <Route path="/posts">
        <AdminLayout currentPage={getCurrentPage()}>
          <PostsList 
            onCreatePost={() => console.log("Create new post")}
            onEditPost={(id) => console.log("Edit post:", id)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/posts/new">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Create New Post</h1>
            <p className="text-muted-foreground">
              Post creation feature coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      {/* Media Routes */}
      <Route path="/media">
        <AdminLayout currentPage={getCurrentPage()}>
          <MediaLibrary 
            onUpload={() => console.log("Upload files")}
            onSelectFile={(file) => console.log("Selected file:", file)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/media/upload">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Upload Media</h1>
            <p className="text-muted-foreground">
              Media upload feature coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      {/* Layout Routes */}
      <Route path="/layout/sections">
        <AdminLayout currentPage={getCurrentPage()}>
          <LayoutManager 
            onAddSection={(type) => console.log("Add section:", type)}
            onEditSection={(id) => console.log("Edit section:", id)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/layout/hero">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Hero Section</h1>
            <p className="text-muted-foreground">
              Hero section management coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      <Route path="/layout/widgets">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Widgets & Sidebars</h1>
            <p className="text-muted-foreground">
              Widget management coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      {/* System Routes */}
      <Route path="/categories">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Categories & Tags</h1>
            <p className="text-muted-foreground">
              Categories management coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      <Route path="/users">
        <AdminLayout currentPage={getCurrentPage()}>
          <UsersManager 
            onCreateUser={() => console.log("Create new user")}
            onEditUser={(id) => console.log("Edit user:", id)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/schedule">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Scheduling</h1>
            <p className="text-muted-foreground">
              Scheduling feature coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      <Route path="/analytics">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Analytics dashboard coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      <Route path="/settings">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Settings panel coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      <Route path="/trash">
        <AdminLayout currentPage={getCurrentPage()}>
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Trash & Archived</h1>
            <p className="text-muted-foreground">
              Trash management coming soon.
            </p>
          </div>
        </AdminLayout>
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Development mode logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🚀 [APP] Penkora CMS starting...', {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: import.meta.env.MODE
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="penkora-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;