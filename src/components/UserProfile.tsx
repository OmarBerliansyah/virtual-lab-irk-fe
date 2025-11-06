import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { UserIcon, MailIcon, ShieldCheckIcon, CalendarIcon, RefreshCwIcon } from 'lucide-react';

export function UserProfile() {
  const { user, loading, error, fetchProfile, updateProfile, isAdmin, isAssistant } = useUserProfile();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [email, setEmail] = useState('');

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ email });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setEmail('');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'assistant': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'assistant': return <UserIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchProfile} className="w-full">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>Unable to load user profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchProfile} className="w-full">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Reload Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            View and manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Email Address
              </Label>
              <div className="p-3 bg-muted rounded-md">
                {user.email}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {getRoleIcon(user.role)}
                Role
              </Label>
              <div>
                <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                  {getRoleIcon(user.role)}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Member Since
              </Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                User ID
              </Label>
              <div className="p-3 bg-muted rounded-md text-sm font-mono">
                {user.id}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Virtual Lab Access</Badge>
              {isAssistant && <Badge variant="outline">Assistant Dashboard</Badge>}
              {isAdmin && <Badge variant="outline">Admin Dashboard</Badge>}
              {isAdmin && <Badge variant="outline">User Management</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">New Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter new email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleUpdateEmail} 
            disabled={isUpdating || !email.trim()}
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <>
                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Email'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}