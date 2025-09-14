import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Filter, Crown, BookOpen, Users, Wrench, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RewardCard, RewardData } from '@/components/ui/reward-card';
import { EnhancedClaimModal } from '@/components/ui/enhanced-claim-modal';
import { ClaimProfileCard } from '@/components/ui/claim-profile-card';
import { XPBalanceCard } from '@/components/ui/xp-balance-card';
import { ProfileXPDropdown } from '@/components/ui/profile-xp-dropdown';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { WizSidebar } from '@/components/wiz/wiz-sidebar';
import { WizUserProfile } from '@/components/wiz/wiz-user-profile';
import { WizMobileMenu } from '@/components/wiz/WizMobileMenu';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { cn } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockRewards: RewardData[] = [
  {
    id: 'ai-mastery-1',
    title: 'AI Mastery Bootcamp',
    provider: { name: 'Skool Instructor Network', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 80,
    usdCost: 59,
    originalPrice: 299,
    discount: 80,
    category: 'courses',
    availability: { total: 50, remaining: 12 },
    isFeatured: true,
    description: 'Master the fundamentals of AI and machine learning in this comprehensive bootcamp.'
  },
  {
    id: 'digital-storytelling-2',
    title: 'Masterclass in Digital Storytelling',
    provider: { name: 'Creative Academy', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 150,
    usdCost: 49,
    originalPrice: 199,
    discount: 75,
    category: 'courses'
  },
  {
    id: 'business-coaching-3',
    title: '1-on-1 Business Coaching Session',
    provider: { name: 'Business Mentors Pro', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 200,
    usdCost: 89,
    originalPrice: 199,
    discount: 55,
    category: 'coaching',
    availability: { total: 20, remaining: 5 }
  },
  {
    id: 'exclusive-community-4',
    title: 'Exclusive Creator Community Access',
    provider: { name: 'Creator Hub', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 120,
    usdCost: 29,
    originalPrice: 99,
    discount: 70,
    category: 'communities'
  },
  {
    id: 'design-tools-5',
    title: 'Professional Design Tools Bundle',
    provider: { name: 'DesignCorp', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 180,
    usdCost: 79,
    originalPrice: 249,
    discount: 68,
    category: 'tools'
  },
  {
    id: 'web-dev-course-6',
    title: 'Full-Stack Web Development Course',
    provider: { name: 'CodeAcademy Plus', avatar: '/api/placeholder/40/40' },
    image: '/api/placeholder/400/225',
    xpCost: 220,
    usdCost: 99,
    originalPrice: 399,
    discount: 75,
    category: 'courses'
  },
  {
    id: 'premium-masterclass-7',
    title: 'Premium Design Masterclass',
    provider: { name: 'Design Institute', avatar: '/api/placeholder/40/40' },
    image: '', // Show placeholder
    xpCost: 350,
    usdCost: 149,
    originalPrice: 499,
    discount: 70,
    category: 'courses',
    availability: { total: 30, remaining: 18 }
  },
  {
    id: 'elite-coaching-8',
    title: 'Elite Business Coaching Program',
    provider: { name: 'Success Mentors', avatar: '/api/placeholder/40/40' },
    image: '', // Show placeholder
    xpCost: 400,
    usdCost: 199,
    originalPrice: 799,
    discount: 75,
    category: 'coaching',
    availability: { total: 15, remaining: 3 }
  }
];

const categoryIcons = {
  courses: BookOpen,
  coaching: Users,
  communities: Crown,
  tools: Wrench
};

export default function Claim() {
  const [selectedReward, setSelectedReward] = useState<RewardData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSection, setActiveSection] = useState('claim');
  const { user, loading } = useAuth();
  const navigate = useSafeNavigate();
  const isMobile = useIsMobile();
  const userXP = 250; // Mock XP - replace with actual user XP

  const featuredRewards = mockRewards.filter(r => r.isFeatured);
  const filteredRewards = selectedCategory === 'all' 
    ? mockRewards 
    : mockRewards.filter(r => r.category === selectedCategory);

  const handleClaimReward = (reward: RewardData) => {
    setSelectedReward(reward);
  };

  const handleSectionChange = (section: string) => {
    // For internal navigation, redirect to main dashboard with the section
    navigate(`/?section=${section}`);
  };

  // Redirect if not authenticated
  if (!user && !loading) {
    window.location.href = '/';
    return null;
  }

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-sm opacity-75">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated Glassmorphic Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(230, 230, 250, 0.4) 0%, 
                rgba(221, 214, 254, 0.3) 25%,
                rgba(196, 181, 253, 0.3) 50%,
                rgba(167, 139, 250, 0.2) 75%,
                rgba(139, 92, 246, 0.1) 100%
              )
            `
          }}
        />

        {/* Floating Magical Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Glassmorphic Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
            filter: 'blur(40px)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute bottom-32 right-32 w-24 h-24 rounded-full opacity-15"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
            filter: 'blur(30px)'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <WizSidebar 
          activeSection="claim" 
          onSectionChange={handleSectionChange} 
        />
      )}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile Header Only */}
        {isMobile && (
          <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl">
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)
                `,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="flex-shrink-0">
                <WizMobileMenu 
                  activeSection={activeSection} 
                  onSectionChange={setActiveSection} 
                />
              </div>
              
              <div className="flex-1 text-center">
                <h1 className="text-lg font-bold text-gray-800">🎁 Claim</h1>
              </div>
              
              <div className="flex-shrink-0">
                <WizUserProfile />
              </div>
            </div>
          </header>
        )}


        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="relative">
            {/* Glassmorphic Header Section */}
            <div className="container mx-auto px-6 pt-8 lg:pt-12 pb-8">
              {/* Header with Title, Subtitle & XP Balance */}
              <motion.div
                className="relative max-w-6xl mx-auto mb-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Profile + XP Balance - Top Right */}
                <div className="absolute top-0 right-0 z-20">
                  <ProfileXPDropdown userXP={userXP} />
                </div>

                {/* Main Title */}
                <motion.h1
                  className="text-4xl lg:text-6xl font-bold mb-4 leading-tight"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        rgba(192, 192, 192, 1) 0%,
                        rgba(169, 169, 169, 0.9) 35%,
                        rgba(0, 191, 255, 0.8) 70%,
                        rgba(64, 224, 208, 0.9) 100%
                      )
                    `,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  XP Marketplace
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Get insider-only deals on online courses, coaching, and digital products — unlocked with XP.
                </motion.p>
              </motion.div>
            </div>

          {/* Featured Reward Hero Card */}
          <AnimatePresence>
            {featuredRewards.length > 0 && (
              <motion.div
                className="container mx-auto px-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {/* Hero Card - Wide Full Row */}
                <motion.div
                  className="relative max-w-6xl mx-auto rounded-3xl overflow-hidden group cursor-pointer"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        rgba(255, 255, 255, 0.7) 0%,
                        rgba(248, 250, 252, 0.6) 100%
                      )
                    `,
                    backdropFilter: 'blur(25px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: `
                      0 20px 50px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.5)
                    `
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  whileHover={{
                    y: -8,
                    scale: 1.01,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                  onClick={() => {
                    if (userXP >= featuredRewards[0].xpCost) {
                      handleClaimReward(featuredRewards[0]);
                    }
                  }}
                >
                  {/* Background Image with Overlay */}
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    {featuredRewards[0].image && featuredRewards[0].image !== '/api/placeholder/400/225' ? (
                      <motion.img
                        src={featuredRewards[0].image}
                        alt={featuredRewards[0].title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : (
                      // Hero Placeholder
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)'
                        }}
                      >
                        <div className="text-center space-y-4 text-white">
                          <Package className="w-20 h-20 mx-auto opacity-60" />
                          <p className="text-lg font-medium opacity-80">Featured Image Coming Soon</p>
                        </div>
                      </div>
                    )}
                    {/* Soft Gradient Overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%)'
                      }}
                    />
                  </div>

                  {/* Content Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-end justify-between">
                      {/* Left Side - Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                          {featuredRewards[0].title}
                        </h3>
                        <p className="text-white/80 font-medium text-sm mb-4">
                          {featuredRewards[0].provider.name}
                        </p>
                      </div>

                      {/* Right Side - Pricing Pill */}
                      <div className="flex-shrink-0">
                        <motion.div
                          className="px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/20"
                          style={{
                            background: `
                              linear-gradient(135deg,
                                rgba(255, 255, 255, 0.9) 0%,
                                rgba(248, 250, 252, 0.8) 100%
                              )
                            `,
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <div className="text-center">
                            <div className="text-sm text-gray-400 line-through mb-1">
                              ${featuredRewards[0].originalPrice}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-600 font-bold text-lg">
                                {featuredRewards[0].xpCost} XP
                              </span>
                              <span className="text-gray-400">+</span>
                              <span className="text-green-600 font-bold text-xl">
                                ${featuredRewards[0].usdCost}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      className="mt-6 px-8 py-3 rounded-2xl font-bold text-white backdrop-blur-xl border border-white/20"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(139, 92, 246, 0.9) 0%,
                            rgba(99, 102, 241, 0.9) 100%
                          )
                        `,
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Claim Deal →
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter Tabs */}
          <motion.div
            className="container mx-auto px-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList
                className="grid grid-cols-5 lg:grid-cols-5 gap-2 p-2 rounded-2xl"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.7) 0%,
                      rgba(248, 250, 252, 0.6) 100%
                    )
                  `,
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                }}
              >
                <TabsTrigger
                  value="all"
                  className="flex items-center space-x-2 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="flex items-center space-x-2 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline capitalize">{category}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* 3-Column Reward Grid */}
          <div className="container mx-auto px-6">
            {!isMobile ? (
              // Desktop Grid - 3 Columns
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <AnimatePresence mode="wait">
                  {filteredRewards.map((reward, index) => (
                    <motion.div
                      key={reward.id}
                      layout
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      <RewardCard
                        reward={reward}
                        userXP={userXP}
                        onClaim={handleClaimReward}
                        variant={reward.isFeatured ? 'featured' : 'default'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Mobile: Single Column Stacked Cards
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                {filteredRewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <RewardCard
                      reward={reward}
                      userXP={userXP}
                      onClaim={handleClaimReward}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          </div>
        </div>
      </main>

      {/* Enhanced Claim Modal */}
      <EnhancedClaimModal
        reward={selectedReward}
        userXP={userXP}
        isOpen={!!selectedReward}
        onClose={() => setSelectedReward(null)}
      />
    </div>
    </TooltipProvider>
  );
}