import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/watch-modal.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { XpProvider } from "@/context/XpContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ServiceBlockedAlert } from "@/components/ui/ServiceBlockedAlert";
import Index from "./pages/Index";
import About from "./pages/About";
import CreatorProfile from "./pages/CreatorProfile";
import Watch from "./pages/Watch";
import Shorts from "./pages/Shorts";
import Claim from "./pages/Claim";
import ZapRewardsHub from "./pages/ZapRewardsHub";
import NotFound from "./pages/NotFound";
import AntiCheatTest from "./pages/AntiCheatTest";
import { AntiCheatDashboard } from "./components/admin/AntiCheatDashboard";
import './lib/firebase'; // Initialize Firebase
import { useEffect } from 'react';
import authSingleton from './lib/authSingleton';

const queryClient = new QueryClient();

const App = () => {
  // Initialize auth singleton on app start
  useEffect(() => {
    console.log('🚀 Initializing auth singleton...');
    authSingleton.initialize().then(user => {
      console.log('✅ Auth singleton initialized:', user ? user.uid : 'no user');
    });
    
    return () => {
      authSingleton.destroy(); // Cleanup on app unmount
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <XpProvider>
          <TooltipProvider>
            <ServiceBlockedAlert />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/watch/:videoId" element={<Watch />} />
                <Route path="/shorts" element={<Shorts />} />
                <Route path="/shorts/:shortId" element={<Shorts />} />
                <Route path="/claim" element={<Claim />} />
                <Route path="/rewards" element={<ZapRewardsHub />} />
                <Route path="/creator/:channelId" element={<CreatorProfile />} />
                <Route path="/c/:handle" element={<CreatorProfile />} />
                <Route path="/admin/anti-cheat" element={<AntiCheatDashboard />} />
                <Route path="/test/anti-cheat" element={<AntiCheatTest />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </XpProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
