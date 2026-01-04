import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Loader2, Edit, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  useGetUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/use-api";
import { User as UserType } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const RoleBadge = ({ role }: { role: string }) => {
  if (role === "ADMIN") {
    return (
      <Badge variant="destructive" className="capitalize">
        Admin
      </Badge>
    );
  }
  if (role === "ASSISTANT") {
    return (
      <Badge variant="secondary" className="capitalize">
        Assistant
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize">
      User
    </Badge>
  );
};

const EditUserDialog = ({ user }: { user: UserType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const queryClient = useQueryClient();

  const handleSave = () => {
    updateUserMutation.mutate(
      { id: user._id, data: { email, role, version: user.version ?? 0 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ADMIN"] });
          toast({ title: "Success", description: "User updated successfully. Role sync with Clerk in progress." });
          setIsOpen(false);
          
          window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
            detail: { 
              userId: user._id, 
              newRole: role 
            } 
          }));
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to update user: ${err.message}`,
            duration: 20000,
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserType['role'])}>
              <SelectTrigger id="role" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ASSISTANT">Assistant</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Clerk ID (Read-only)</Label>
            <Input value={user.clerkId} readOnly disabled className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteUserAlert = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ADMIN"] });
        toast({ title: "Success", description: "User deleted." });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete user: ${err.message}`,
          duration: 20000, 
        });
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            from your database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteUserMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const AdminDashboard = () => {
  const { data: users, isLoading, error } = useGetUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load user data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4 text-primary">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage all users and their roles in the system.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Clerk ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.clerkId}
                      </TableCell>
                      <TableCell className="text-right">
                        <EditUserDialog user={user} />
                        <DeleteUserAlert userId={user._id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;