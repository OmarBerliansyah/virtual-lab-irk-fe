import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import VirtualLab from "./pages/VirtualLab";
import AssistantDashboard from "./pages/AssistantDashboard";
import WhiteboardPage from "./pages/WhiteboardPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isWhiteboardPage = location.pathname === '/whiteboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!isWhiteboardPage && <Navbar />}
      <main className={isWhiteboardPage ? "h-screen" : "flex-1"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/virtual-lab" element={<VirtualLab />} />
          <Route path="/assistant" element={<AssistantDashboard />} />
          <Route path="/whiteboard" element={<WhiteboardPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isWhiteboardPage && <Footer />}
    </div>
  );
};

const App = () => (
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

export default App;
