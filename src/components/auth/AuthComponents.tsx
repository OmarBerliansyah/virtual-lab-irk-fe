import { SignedOut, SignedIn, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireRole?: 'assistant' | 'admin';
}

export function AuthWrapper({ children, requireRole }: AuthWrapperProps) {
  const { isSignedIn } = useUser();
  const { user: dbUser, loading: profileLoading, error: profileError, isAdmin, isAssistant } = useUserProfile();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const { toast } = useToast();

  // Check for access denied and show toast
  useEffect(() => {
    if (requireRole && isSignedIn && dbUser && !profileLoading) {
      const hasAccess = requireRole === 'admin' ? isAdmin : (isAdmin || isAssistant);
      
      if (!hasAccess) {
        toast({
          title: "Akses Ditolak",
          description: `Anda memerlukan izin ${requireRole} untuk mengakses area ini. Role saat ini: ${dbUser.role}`,
          variant: "destructive",
          duration: 20000, 
        });
      }
    }
  }, [requireRole, isSignedIn, dbUser, profileLoading, isAdmin, isAssistant, toast]);

  // Show profile error if any
  useEffect(() => {
    if (profileError) {
      toast({
        title: "Error Loading Profile",
        description: profileError,
        variant: "destructive",
      });
    }
  }, [profileError, toast]);

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Virtual Lab IRK</h2>
          <p className="text-muted-foreground">Please sign in to continue</p>
          
          <Dialog open={showAuth} onOpenChange={setShowAuth}>
            <div className="space-x-2">
              <DialogTrigger asChild>
                <Button onClick={() => setAuthMode('sign-in')}>
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setAuthMode('sign-up')}>
                  Sign Up
                </Button>
              </DialogTrigger>
            </div>
            
            <DialogContent className="sm:max-w-md">
              {authMode === 'sign-in' ? (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-none border-none"
                    }
                  }}
                />
              ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto", 
                      card: "shadow-none border-none"
                    }
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requireRole && dbUser) {
    const hasAccess = requireRole === 'admin' ? isAdmin : (isAdmin || isAssistant);
    
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You need {requireRole} permissions to access this area.
            </p>
            <p className="text-sm text-muted-foreground">
              Current role: {dbUser.role}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Email: {dbUser.email}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export function AuthUserButton() {
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (mode: 'sign-in' | 'sign-up') => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>
      <SignedOut>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="flex gap-2">
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => openModal('sign-in')}>
                Sign In
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button onClick={() => openModal('sign-up')}>
                Sign Up
              </Button>
            </DialogTrigger>
          </div>

          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">
              {authMode === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {authMode === 'sign-in' ? 'Sign in to your account' : 'Create a new account'}
            </DialogDescription>
            {authMode === 'sign-in' ? (
              <SignIn 
                appearance={{ elements: { card: "shadow-none border-none" } }}
              />
            ) : (
              <SignUp 
                appearance={{ elements: { card: "shadow-none border-none" } }}
              />
            )}
          </DialogContent>
        </Dialog>
      </SignedOut>

      <SignedIn>
        <UserButton 
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
          showName
        />
      </SignedIn>
    </>
  );
}