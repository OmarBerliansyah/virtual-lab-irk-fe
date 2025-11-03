import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import VirtualLab from "./pages/VirtualLab";
import AssistantDashboard from "./pages/AssistantDashboard";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import { AuthWrapper } from "./components/auth/AuthComponents";
import { useLocation } from "react-router-dom";
import { useState } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isWhiteboardPage = location.pathname === '/whiteboard';

  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        {!isWhiteboardPage && <Navbar />}
        <main className={isWhiteboardPage ? "h-screen" : "flex-1"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/virtual-lab" element={<VirtualLab />} />
            <Route 
              path="/assistant" 
              element={
                <AuthWrapper requireRole="assistant">
                  <AssistantDashboard />
                </AuthWrapper>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isWhiteboardPage && <Footer />}
      </div>
    </AuthWrapper>
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
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};
export default App;
