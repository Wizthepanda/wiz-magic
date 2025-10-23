import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/watch-modal.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { XpProvider } from "@/context/XpContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { ServiceBlockedAlert } from "@/components/ui/ServiceBlockedAlert";
import { MainLayout } from "./components/layouts/MainLayout";
import { lazy, Suspense, useEffect } from 'react';
import authSingleton from './lib/authSingleton';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './lib/firebase'; // Initialize Firebase

// ========================================
// LAZY LOADED PAGES (Code Splitting)
// ========================================

// Public pages (no sidebar)
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const Watch = lazy(() => import("./pages/Watch"));
const Shorts = lazy(() => import("./pages/Shorts"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AntiCheatTest = lazy(() => import("./pages/AntiCheatTest"));
const CommunityWelcomeDemo = lazy(() => import("./pages/CommunityWelcomeDemo"));
const CommunityProfileDemoPage = lazy(() => import("./pages/CommunityProfileDemoPage"));
const AntiCheatDashboard = lazy(() => import("./components/admin/AntiCheatDashboard").then(m => ({ default: m.AntiCheatDashboard })));

// Dashboard pages (with persistent sidebar)
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CommunityDashboardPageV2 = lazy(() => import("./pages/CommunityDashboardPageV2"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const PremierePage = lazy(() => import("./pages/PremierePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Claim = lazy(() => import("./pages/Claim"));
const ZapRewardsHub = lazy(() => import("./pages/ZapRewardsHub"));
const RewardsPage = lazy(() => import("./pages/rewards/RewardsPage").then(m => ({ default: m.RewardsPage })));

// Create pages
const WizCreatePageV3 = lazy(() => import("./components/wiz/WizCreatePageV3").then(m => ({ default: m.WizCreatePageV3 })));
const WizCreatePageV2 = lazy(() => import("./components/wiz/WizCreatePageV2").then(m => ({ default: m.WizCreatePageV2 })));
const WizCreatePage = lazy(() => import("./components/wiz/WizCreatePage").then(m => ({ default: m.WizCreatePage })));

// ========================================
// LOADING FALLBACK COMPONENT
// ========================================

const LoadingFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, #F6F0FF 0%, #FFFFFF 100%)',
    }}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: '#C29FFF',
            borderRightColor: '#A78BFA',
            borderBottomColor: '#8B5CF6',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
          </motion.div>
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-lg font-medium text-gray-700"
      >
        Loading...
      </motion.p>
    </motion.div>
  </motion.div>
);

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
          <LayoutProvider>
            <TooltipProvider>
              <ServiceBlockedAlert />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                  {/* ========================================
                      PUBLIC ROUTES (No Sidebar)
                      ======================================== */}

                  <Route path="/about" element={<About />} />
                  <Route path="/watch/:videoId" element={<Watch />} />
                  <Route path="/shorts" element={<Shorts />} />
                  <Route path="/shorts/:shortId" element={<Shorts />} />
                  <Route path="/admin/anti-cheat" element={<AntiCheatDashboard />} />
                  <Route path="/test/anti-cheat" element={<AntiCheatTest />} />
                  <Route path="/demo/community-welcome" element={<CommunityWelcomeDemo />} />
                  <Route path="/demo/community-v4" element={<CommunityProfileDemoPage />} />

                  {/* Homepage - No sidebar (handles auth state internally) */}
                  <Route path="/" element={<Index />} />

                  {/* Creator Profile - Standalone */}
                  <Route path="/creator/:username" element={<CreatorProfile />} />
                  <Route path="/c/:username" element={<CreatorProfile />} />
                  <Route path="/creator/id/:creatorId" element={<CreatorProfile />} />

                  {/* ========================================
                      DASHBOARD ROUTES (Persistent Sidebar)
                      ======================================== */}

                  <Route element={<MainLayout />}>
                    {/* Discover - Main feed */}
                    <Route path="/discover" element={<DiscoverPage />} />

                    {/* Communities */}
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/community/:id" element={<CommunityDashboardPageV2 />} />

                    {/* Messages - Real-time chat */}
                    <Route path="/messages" element={<MessagesPage />} />

                    {/* Leaderboard - Top creators */}
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    {/* Premiere - Premium content */}
                    <Route path="/premiere" element={<PremierePage />} />

                    {/* Profile - User profile & settings */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Create - Content creation hub */}
                    <Route path="/create" element={<WizCreatePageV3 />} />
                    <Route path="/create-v2" element={<WizCreatePageV2 />} />
                    <Route path="/create-old" element={<WizCreatePage />} />

                    {/* Rewards & Claiming */}
                    <Route path="/claim" element={<Claim />} />
                    <Route path="/rewards" element={<ZapRewardsHub />} />
                    <Route path="/community-rewards" element={<RewardsPage />} />
                  </Route>

                  {/* ========================================
                      404 NOT FOUND
                      ======================================== */}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LayoutProvider>
      </XpProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
