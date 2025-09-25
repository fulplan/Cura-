import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminLayout from "@/components/AdminLayout";
import Dashboard from "@/components/Dashboard";
import AllPostsPage from "@/components/AllPostsPage";
import NewPostPage from "@/components/NewPostPage";
import CategoriesPage from "@/components/CategoriesPage";
import MediaLibraryPage from "@/components/MediaLibraryPage";
import UploadPage from "@/components/UploadPage";
import SchedulingPage from "@/components/SchedulingPage";
import TrashPage from "@/components/TrashPage";
import LayoutManager from "@/components/LayoutManager";
import UsersManager from "@/components/UsersManager";
import NotFound from "@/pages/not-found";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroBuilderPage from "@/components/HeroBuilderPage";
import WidgetsManagerPage from "@/components/WidgetsManagerPage";

function Router() {
  const [location] = useLocation();

  // Debug logging for route changes
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
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
          <AllPostsPage 
            onCreatePost={() => console.log("Create new post")}
            onEditPost={(id) => console.log("Edit post:", id)}
            onPreviewPost={(id) => console.log("Preview post:", id)}
            onDeletePost={(id) => console.log("Delete post:", id)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/posts/new">
        <AdminLayout currentPage={getCurrentPage()}>
          <NewPostPage 
            onSave={(data) => console.log("Save post:", data)}
            onPublish={(data) => console.log("Publish post:", data)}
            onPreview={(data) => console.log("Preview post:", data)}
          />
        </AdminLayout>
      </Route>
      
      {/* Media Routes */}
      <Route path="/media">
        <AdminLayout currentPage={getCurrentPage()}>
          <MediaLibraryPage 
            onUpload={() => console.log("Upload files")}
            onSelect={(file) => console.log("Selected file:", file)}
            onDelete={(ids) => console.log("Delete files:", ids)}
            onDownload={(ids) => console.log("Download files:", ids)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/media/upload">
        <AdminLayout currentPage={getCurrentPage()}>
          <UploadPage 
            onUpload={(files, destination) => console.log("Upload files:", files, "to:", destination)}
            onCancel={(fileId) => console.log("Cancel upload:", fileId)}
            onRetry={(fileId) => console.log("Retry upload:", fileId)}
          />
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
          <HeroBuilderPage 
            onSave={(data) => console.log("Save hero:", data)}
            onPreview={(data) => console.log("Preview hero:", data)}
          />
        </AdminLayout>
      </Route>
      
      <Route path="/layout/widgets">
        <AdminLayout currentPage={getCurrentPage()}>
          <WidgetsManagerPage 
            onSave={(data) => console.log("Save widgets:", data)}
            onPreview={(data) => console.log("Preview widgets:", data)}
          />
        </AdminLayout>
      </Route>
      
      {/* System Routes */}
      <Route path="/categories">
        <AdminLayout currentPage={getCurrentPage()}>
          <CategoriesPage 
            onCreateCategory={(data) => console.log("Create category:", data)}
            onEditCategory={(id, data) => console.log("Edit category:", id, data)}
            onDeleteCategory={(id) => console.log("Delete category:", id)}
            onCreateTag={(data) => console.log("Create tag:", data)}
            onEditTag={(id, data) => console.log("Edit tag:", id, data)}
            onDeleteTag={(id) => console.log("Delete tag:", id)}
          />
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
          <SchedulingPage 
            onCreateSchedule={() => console.log("Create schedule")}
            onEditSchedule={(id) => console.log("Edit schedule:", id)}
            onDeleteSchedule={(id) => console.log("Delete schedule:", id)}
            onPublishNow={(id) => console.log("Publish now:", id)}
          />
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
          <TrashPage 
            onRestore={(ids) => console.log("Restore items:", ids)}
            onPermanentDelete={(ids) => console.log("Permanently delete:", ids)}
            onEmptyTrash={() => console.log("Empty trash")}
          />
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
    if (import.meta.env.MODE === 'development') {
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