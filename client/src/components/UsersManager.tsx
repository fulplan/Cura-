import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  User,
  Crown,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";
import UserFormDialog from "./UserFormDialog";

interface UsersManagerProps {
  onCreateUser?: () => void;
  onEditUser?: (id: string) => void;
}

export default function UsersManager({ onCreateUser, onEditUser }: UsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setDeleteUserId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = () => {
    setFormMode("create");
    setEditingUser(null);
    setUserFormOpen(true);
    onCreateUser?.();
  };

  const handleEditUser = (user: UserType) => {
    setFormMode("edit");
    setEditingUser(user);
    setUserFormOpen(true);
    onEditUser?.(user.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Crown;
      case "editor": return Shield;
      case "author": return User;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-500";
      case "editor": return "text-blue-500"; 
      case "author": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? { variant: "default" as const, color: "bg-green-500" }
      : { variant: "secondary" as const, color: "bg-gray-500" };
  };

  const filteredUsers = users.filter((user: UserType) => {
    const displayName = user.displayName || user.username;
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Users & Roles</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage user accounts and permissions</p>
          </div>
          <Button disabled size="sm" className="shrink-0">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New User</span>
          </Button>
        </div>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-[140px]" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                    <Skeleton className="h-3 w-[250px]" />
                  </div>
                  <Skeleton className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Users & Roles</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage user accounts and permissions</p>
          </div>
          <Button onClick={handleCreateUser} data-testid="button-create-user" size="sm" className="shrink-0">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New User</span>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load users</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the user list. Please try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Users & Roles</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleCreateUser} data-testid="button-create-user" size="sm" className="shrink-0">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">New User</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-users-search"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-role-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="author">Author</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user: UserType) => {
          const RoleIcon = getRoleIcon(user.role);
          const statusBadge = getStatusBadge("active");
          
          return (
            <Card key={user.id} className="hover-elevate" data-testid={`user-card-${user.id}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || undefined} alt={user.displayName || user.username} />
                      <AvatarFallback>
                        {(user.displayName || user.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{user.displayName || user.username}</h3>
                        <Badge 
                          variant="default"
                          className="text-xs capitalize"
                        >
                          active
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{user.email || 'No email'}</p>
                      
                      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <RoleIcon className={`w-4 h-4 ${getRoleColor(user.role)}`} />
                          <span className="capitalize">{user.role}</span>
                        </div>
                        <span>•</span>
                        <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-user-actions-${user.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditUser(user)}
                        data-testid={`menu-edit-${user.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "User permissions management will be available soon",
                          });
                        }}
                        data-testid={`menu-permissions-${user.id}`}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Permissions
                      </DropdownMenuItem>
                      {user.role !== "admin" && currentUser?.id !== user.id && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteUserId(user.id)}
                          disabled={deleteUserMutation.isPending}
                          data-testid={`menu-delete-${user.id}`}
                        >
                          {deleteUserMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || roleFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first user account"}
            </p>
            {!searchQuery && roleFilter === "all" && (
              <Button onClick={handleCreateUser} data-testid="button-create-first-user">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={editingUser}
        mode={formMode}
      />
    </div>
  );
}