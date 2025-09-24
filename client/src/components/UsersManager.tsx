import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  User,
  Crown
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

interface UsersManagerProps {
  onCreateUser?: () => void;
  onEditUser?: (id: string) => void;
}

export default function UsersManager({ onCreateUser, onEditUser }: UsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // TODO: Remove mock data
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      status: "active",
      lastActive: "2024-01-15",
      postsCount: 45,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com", 
      role: "editor",
      status: "active",
      lastActive: "2024-01-14",
      postsCount: 23,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "author",
      status: "active", 
      lastActive: "2024-01-10",
      postsCount: 12,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "editor",
      status: "inactive",
      lastActive: "2023-12-20", 
      postsCount: 8,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Users & Roles</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage user accounts and permissions</p>
        </div>
        <Button onClick={onCreateUser} data-testid="button-create-user" size="sm" className="shrink-0">
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
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          const statusBadge = getStatusBadge(user.status);
          
          return (
            <Card key={user.id} className="hover-elevate" data-testid={`user-card-${user.id}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge 
                          variant={statusBadge.variant}
                          className="text-xs capitalize"
                        >
                          {user.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                      
                      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <RoleIcon className={`w-4 h-4 ${getRoleColor(user.role)}`} />
                          <span className="capitalize">{user.role}</span>
                        </div>
                        <span>•</span>
                        <span>{user.postsCount} posts</span>
                        <span>•</span>
                        <span>Active {new Date(user.lastActive).toLocaleDateString()}</span>
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
                        onClick={() => {
                          onEditUser?.(user.id);
                          console.log(`Edit user: ${user.id}`);
                        }}
                        data-testid={`menu-edit-${user.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`menu-permissions-${user.id}`}>
                        <Shield className="w-4 h-4 mr-2" />
                        Permissions
                      </DropdownMenuItem>
                      {user.role !== "admin" && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          data-testid={`menu-delete-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
              <Button onClick={onCreateUser} data-testid="button-create-first-user">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}