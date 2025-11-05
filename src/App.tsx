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
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import { AuthWrapper } from "./components/auth/AuthComponents";
import { useState } from "react";
import { SignedIn, SignIn, SignUp } from "@clerk/clerk-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isWhiteboardPage = location.pathname === '/whiteboard';

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;