import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/AdminLayout";
import Dashboard from "@/components/Dashboard";
import PostsList from "@/components/PostsList";
import MediaLibrary from "@/components/MediaLibrary";
import LayoutManager from "@/components/LayoutManager";
import UsersManager from "@/components/UsersManager";
import NotFound from "@/pages/not-found";

function Router() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onQuickAction={(action) => console.log("Quick action:", action)} />;
      case "posts":
        return (
          <PostsList 
            onCreatePost={() => console.log("Create new post")}
            onEditPost={(id) => console.log("Edit post:", id)}
          />
        );
      case "media":
        return (
          <MediaLibrary 
            onUpload={() => console.log("Upload files")}
            onSelectFile={(file) => console.log("Selected file:", file)}
          />
        );
      case "layout/sections":
        return (
          <LayoutManager 
            onAddSection={(type) => console.log("Add section:", type)}
            onEditSection={(id) => console.log("Edit section:", id)}
          />
        );
      case "users":
        return (
          <UsersManager 
            onCreateUser={() => console.log("Create new user")}
            onEditUser={(id) => console.log("Edit user:", id)}
          />
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-semibold mb-2">Coming Soon</h1>
            <p className="text-muted-foreground">
              The {currentPage} page is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <Switch>
      <Route path="/">
        <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;