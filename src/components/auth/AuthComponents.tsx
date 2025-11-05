import { SignedOut, SignedIn, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireRole?: 'assistant' | 'admin';
}

export function AuthWrapper({ children, requireRole }: AuthWrapperProps) {
  const { isSignedIn, user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const { toast } = useToast();

  // Check for access denied and show toast
  useEffect(() => {
    if (requireRole && isSignedIn && user) {
      const userRole = user?.publicMetadata?.role as string;
      if (userRole !== requireRole && userRole !== 'admin') {
        toast({
          title: "Akses Ditolak",
          description: `Anda memerlukan izin ${requireRole} untuk mengakses area ini. Role saat ini: ${userRole || 'user'}`,
          variant: "destructive",
          duration: 20000, 
        });
      }
    }
  }, [requireRole, isSignedIn, user, toast]);

  // Show login success toast
  useEffect(() => {
    if (isSignedIn && user) {
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${user.emailAddresses[0]?.emailAddress || 'User'}!`,
        duration: 20000, 
      });
    }
  }, [isSignedIn, user, toast]);

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

  // Check role if required
  if (requireRole) {
    const userRole = user?.publicMetadata?.role as string;
    
    if (userRole !== requireRole && userRole !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You need {requireRole} permissions to access this area.
            </p>
            <p className="text-sm text-muted-foreground">
              Current role: {userRole || 'user'}
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