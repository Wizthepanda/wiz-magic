import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/watch-modal.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { XpProvider } from "@/context/XpContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ServiceBlockedAlert } from "@/components/ui/ServiceBlockedAlert";
import { MainLayout } from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import CreatorProfile from "./pages/CreatorProfile";
import Watch from "./pages/Watch";
import Shorts from "./pages/Shorts";
import Claim from "./pages/Claim";
import ZapRewardsHub from "./pages/ZapRewardsHub";
import NotFound from "./pages/NotFound";
import AntiCheatTest from "./pages/AntiCheatTest";
import CommunityPage from "./pages/CommunityPage";
import CommunityDashboardPage from "./pages/CommunityDashboardPage";
import CommunityWelcomeDemo from "./pages/CommunityWelcomeDemo";
import { AntiCheatDashboard } from "./components/admin/AntiCheatDashboard";
import { WizCreatePage } from "./components/wiz/WizCreatePage";
import './lib/firebase'; // Initialize Firebase
import { useEffect } from 'react';
import authSingleton from './lib/authSingleton';
import { useAuth } from './hooks/useAuth';

// Configure React Query for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: 1, // Only retry once on failure
      refetchOnMount: false, // Don't refetch if data exists
    },
  },
});

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
                {/* Routes WITHOUT persistent sidebar (public/standalone pages) */}
                <Route path="/about" element={<About />} />
                <Route path="/watch/:videoId" element={<Watch />} />
                <Route path="/shorts" element={<Shorts />} />
                <Route path="/shorts/:shortId" element={<Shorts />} />
                <Route path="/admin/anti-cheat" element={<AntiCheatDashboard />} />
                <Route path="/test/anti-cheat" element={<AntiCheatTest />} />
                <Route path="/demo/community-welcome" element={<CommunityWelcomeDemo />} />

                {/* Homepage - No sidebar (handles auth state internally) */}
                <Route path="/" element={<Index />} />

                {/* Creator Profile - Standalone with Back to Discover button */}
                <Route path="/creator/:username" element={<CreatorProfile />} />
                <Route path="/c/:username" element={<CreatorProfile />} />
                <Route path="/creator/id/:creatorId" element={<CreatorProfile />} />

                {/* Routes WITH persistent sidebar (main app - authenticated only) */}
                <Route element={<MainLayout />}>
                  {/* Dashboard routes moved here if needed */}

                  {/* Community */}
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/:id" element={<CommunityDashboardPage />} />

                  {/* Other main app pages */}
                  <Route path="/claim" element={<Claim />} />
                  <Route path="/rewards" element={<ZapRewardsHub />} />
                  <Route path="/leaderboard" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Leaderboard Coming Soon</h2></div>} />
                  <Route path="/premiere" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">WIZ Premiere Coming Soon</h2></div>} />
                  <Route path="/profile" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Profile Coming Soon</h2></div>} />
                  <Route path="/create" element={<WizCreatePage />} />
                </Route>

                {/* Catch-all 404 */}
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
