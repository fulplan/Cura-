import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import { Loader2, Crown, Shield, User as UserIcon } from "lucide-react";

// Form validation schema
const userFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// For editing, make password optional
const editUserFormSchema = insertUserSchema.partial({ password: true }).extend({
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // If provided, we're editing; if null/undefined, we're creating
  mode: "create" | "edit";
}

export default function UserFormDialog({ 
  open, 
  onOpenChange, 
  user, 
  mode 
}: UserFormDialogProps) {
  const { toast } = useToast();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  
  const isEditing = mode === "edit" && user;
  const schema = isEditing ? editUserFormSchema : userFormSchema;
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "author",
      displayName: "",
    },
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && isEditing && user) {
      form.reset({
        username: user.username,
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role,
        displayName: user.displayName || "",
      });
    } else if (open && !isEditing) {
      form.reset({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "author",
        displayName: "",
      });
    }
  }, [open, isEditing, user, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      const submitData = {
        username: data.username,
        email: data.email || undefined,
        role: data.role,
        displayName: data.displayName || undefined,
        ...(data.password && { password: data.password }), // Only include password if provided
      };

      if (isEditing && user) {
        await updateUserMutation.mutateAsync({ id: user.id, ...submitData });
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        if (!data.password) {
          throw new Error("Password is required for new users");
        }
        await createUserMutation.mutateAsync({ ...submitData, password: data.password });
        toast({
          title: "Success", 
          description: "User created successfully",
        });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} user`,
        variant: "destructive",
      });
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "admin":
        return { icon: Crown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" };
      case "editor":
        return { icon: Shield, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" };
      case "author":
        return { icon: UserIcon, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" };
      default:
        return { icon: UserIcon, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950" };
    }
  };

  const selectedRole = form.watch("role") || "author";
  const roleInfo = getRoleInfo(selectedRole);
  const RoleIcon = roleInfo.icon;

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit User: ${user?.displayName || user?.username}` : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update user information and permissions. Leave password fields empty to keep current password."
              : "Create a new user account with appropriate role and permissions."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        {...field}
                        disabled={isPending}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter display name" 
                        {...field}
                        value={field.value || ""}
                        disabled={isPending}
                        data-testid="input-display-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter email address" 
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger data-testid="select-user-role">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="author">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-green-500" />
                          <span>Author</span>
                          <Badge variant="secondary" className="text-xs">Can create posts</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>Editor</span>
                          <Badge variant="secondary" className="text-xs">Can edit all posts</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-red-500" />
                          <span>Admin</span>
                          <Badge variant="secondary" className="text-xs">Full access</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Preview */}
            <div className={`p-3 rounded-lg border ${roleInfo.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                <span className="font-medium capitalize">{selectedRole} Permissions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedRole === "admin" && "Full system access including user management, settings, and all content operations."}
                {selectedRole === "editor" && "Can create, edit, and manage all posts and content. Cannot manage users or system settings."}
                {selectedRole === "author" && "Can create and edit their own posts. Cannot edit others' content or access admin features."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {!isEditing && "*"}
                      {isEditing && <span className="text-xs text-muted-foreground">(leave empty to keep current)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={isEditing ? "New password (optional)" : "Enter password"} 
                        {...field}
                        disabled={isPending}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password {!isEditing && "*"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={isEditing ? "Confirm new password" : "Confirm password"} 
                        {...field}
                        disabled={isPending}
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel-user-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-submit-user-form"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update User" : "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}