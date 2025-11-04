import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/watch-modal.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { XpProvider } from "@/context/XpContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { DropdownProvider } from "@/contexts/DropdownContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ServiceBlockedAlert } from "@/components/ui/ServiceBlockedAlert";
import { MainLayout } from "./components/layouts/MainLayout";
import { lazy, Suspense, useEffect } from 'react';
import authSingleton from './lib/authSingleton';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './lib/firebase'; // Initialize Firebase
import AppLoader from './components/AppLoader';
import PageWrapper from './components/PageWrapper';

// ========================================
// LAZY LOADED PAGES (Code Splitting)
// ========================================

// Public pages (no sidebar)
const Index = lazy(() => import("./pages/Index"));
const HomepageV2 = lazy(() => import("./pages/HomepageV2"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
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
const CreatorStudio = lazy(() => import("./components/wiz/CreatorStudio").then(m => ({ default: m.CreatorStudio })));
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
            <DropdownProvider>
              <ChatProvider>
                <TooltipProvider>
                <AppLoader />
                <ServiceBlockedAlert />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                  {/* ========================================
                      PUBLIC ROUTES (No Sidebar)
                      ======================================== */}

                  <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                  <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
                  <Route path="/terms" element={<PageWrapper><TermsOfService /></PageWrapper>} />
                  <Route path="/watch/:videoId" element={<PageWrapper><Watch /></PageWrapper>} />
                  <Route path="/shorts" element={<PageWrapper><Shorts /></PageWrapper>} />
                  <Route path="/shorts/:shortId" element={<PageWrapper><Shorts /></PageWrapper>} />
                  <Route path="/admin/anti-cheat" element={<PageWrapper><AntiCheatDashboard /></PageWrapper>} />
                  <Route path="/test/anti-cheat" element={<PageWrapper><AntiCheatTest /></PageWrapper>} />
                  <Route path="/demo/community-welcome" element={<PageWrapper><CommunityWelcomeDemo /></PageWrapper>} />
                  <Route path="/demo/community-v4" element={<PageWrapper><CommunityProfileDemoPage /></PageWrapper>} />

                  {/* Homepage V2 - New Premium Design */}
                  <Route path="/home-v2" element={<PageWrapper><HomepageV2 /></PageWrapper>} />

                  {/* Homepage - No sidebar (handles auth state internally) */}
                  <Route path="/" element={<PageWrapper><HomepageV2 /></PageWrapper>} />

                  {/* Creator Profile - Standalone */}
                  <Route path="/creator/:username" element={<PageWrapper><CreatorProfile /></PageWrapper>} />
                  <Route path="/c/:username" element={<PageWrapper><CreatorProfile /></PageWrapper>} />
                  <Route path="/creator/id/:creatorId" element={<PageWrapper><CreatorProfile /></PageWrapper>} />

                  {/* ========================================
                      DASHBOARD ROUTES (Persistent Sidebar)
                      ======================================== */}

                  <Route element={<MainLayout />}>
                    {/* Discover - Main feed */}
                    <Route path="/discover" element={<PageWrapper><DiscoverPage /></PageWrapper>} />

                    {/* Communities */}
                    <Route path="/community" element={<PageWrapper><CommunityPage /></PageWrapper>} />
                    <Route path="/community/:id" element={<PageWrapper><CommunityDashboardPageV2 /></PageWrapper>} />

                    {/* Messages - Real-time chat */}
                    <Route path="/messages" element={<PageWrapper><MessagesPage /></PageWrapper>} />

                    {/* Leaderboard - Top creators */}
                    <Route path="/leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />

                    {/* Premiere - Premium content */}
                    <Route path="/premiere" element={<PageWrapper><PremierePage /></PageWrapper>} />

                    {/* Profile - User profile & settings */}
                    <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />

                    {/* Create - Content creation hub */}
                    <Route path="/create" element={<PageWrapper><CreatorStudio /></PageWrapper>} />
                    <Route path="/creator-studio" element={<PageWrapper><CreatorStudio /></PageWrapper>} />
                    <Route path="/create-v3" element={<PageWrapper><WizCreatePageV3 /></PageWrapper>} />
                    <Route path="/create-v2" element={<PageWrapper><WizCreatePageV2 /></PageWrapper>} />
                    <Route path="/create-v1" element={<PageWrapper><WizCreatePage /></PageWrapper>} />

                    {/* Rewards & Claiming */}
                    <Route path="/claim" element={<PageWrapper><Claim /></PageWrapper>} />
                    <Route path="/rewards" element={<PageWrapper><ZapRewardsHub /></PageWrapper>} />
                    <Route path="/community-rewards" element={<PageWrapper><RewardsPage /></PageWrapper>} />
                  </Route>

                  {/* ========================================
                      404 NOT FOUND
                      ======================================== */}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </DropdownProvider>
      </LayoutProvider>
    </XpProvider>
  </ThemeProvider>
</QueryClientProvider>
  );
};

export default App;
