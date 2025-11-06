import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import VirtualLab from "./pages/VirtualLab";
import AssistantDashboard from "./pages/AssistantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthWrapper } from "./components/auth/AuthComponents";
import { useState, useEffect } from "react";
import { SignedIn, SignIn, SignUp } from "@clerk/clerk-react";
import { useGlobalErrorHandler } from "./hooks/use-global-error-handler";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "./hooks/useUserProfile";
import { useToast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isWhiteboardPage = location.pathname === '/whiteboard';
  const { isSignedIn, user } = useUser();
  const { user: dbUser, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  
  // Initialize global error handler
  useGlobalErrorHandler();

  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      const { from, to } = event.detail;
      console.log('Role changed in App:', from, 'to', to);
      
      const currentPath = location.pathname;
      
      if (currentPath === '/admin' && to !== 'admin') {
        navigate('/');
        toast({
          title: "Access Revoked",
          description: "Your admin access has been revoked. Redirecting to home.",
          variant: "destructive",
        });
      } else if (currentPath === '/assistant' && to === 'user') {
        navigate('/');
        toast({
          title: "Access Revoked",
          description: "Your assistant access has been revoked. Redirecting to home.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('roleChanged', handleRoleChange as EventListener);
    
    return () => {
      window.removeEventListener('roleChanged', handleRoleChange as EventListener);
    };
  }, [location.pathname, navigate, toast]);

  useEffect(() => {
    if (isSignedIn && user && dbUser && !profileLoading) {
      const hasShownWelcomeThisSession = sessionStorage.getItem('hasShownWelcome');
      
      if (!hasShownWelcomeThisSession) {
        const roleText = dbUser.role === 'admin' ? ' (Admin)' : 
                        dbUser.role === 'assistant' ? ' (Assistant)' : '';
        
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${dbUser.email}${roleText}!`,
          duration: 10000, // 10 seconds
        });
        sessionStorage.setItem('hasShownWelcome', 'true');
      }
    }
    
    // Clear the flag when user signs out
    if (!isSignedIn) {
      sessionStorage.removeItem('hasShownWelcome');
    }
  }, [isSignedIn, user, dbUser, profileLoading, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isWhiteboardPage && <Navbar />}
      <main className={isWhiteboardPage ? "h-screen" : "flex-1"}>
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />

          {/* Rute Terproteksi (Semua Role) */}
          <Route 
            path="/virtual-lab" 
            element={
              <AuthWrapper>
                <VirtualLab />
              </AuthWrapper>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <AuthWrapper>
                <ProfilePage />
              </AuthWrapper>
            } 
          />

          {/* Rute Terproteksi (Hanya Asisten) */}
          <Route 
            path="/assistant" 
            element={
              <AuthWrapper requireRole="assistant">
                <AssistantDashboard />
              </AuthWrapper>
            } 
          />

          {/* Rute Terproteksi (Hanya Admin) */}
          <Route 
            path="/admin" 
            element={
              <AuthWrapper requireRole="admin">
                <AdminDashboard />
              </AuthWrapper>
            } 
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isWhiteboardPage && <Footer />}
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;