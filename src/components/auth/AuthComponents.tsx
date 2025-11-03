import { SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireRole?: 'assistant' | 'admin';
}

export function AuthWrapper({ children, requireRole }: AuthWrapperProps) {
  const { isSignedIn, user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

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
  const { isSignedIn } = useUser();
  
  if (!isSignedIn) {
    return null;
  }

  return (
    <UserButton 
      appearance={{
        elements: {
          avatarBox: "h-8 w-8"
        }
      }}
      showName
    />
  );
}