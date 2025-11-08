import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { useFeaturedCreators } from '@/hooks/useFeaturedCreators';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Featured Creators Section - Soft Pastel Bloom Aesthetic
 * 
 * Design Philosophy:
 * - Bright, breathable, non-cluttered layout
 * - Soft gradient backgrounds (pastel bloom)
 * - Rounded corners (24px)
 * - Gentle hover elevation
 * - Visual calm and friendly presence
 * - Hero creator feels approachable and smiling
 */
export function FeaturedCreators() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Fetch featured creators (real + placeholder fallback)
  const { data: creators = [], isLoading, error } = useFeaturedCreators();

  const handleViewCreator = async (creatorId: string, username?: string) => {
    if (!user) {
      setIsAuthenticating(true);
      try {
        await signInWithGoogleAndRedirect(navigate);
      } catch (err) {
        console.error('Sign in failed:', err);
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      // Use username if available, otherwise use creatorId
      if (username) {
        navigate(`/creator/${username}`);
      } else {
        navigate(`/creator/id/${creatorId}`);
      }
    }
  };

  // Error state
  if (error) {
    console.error('❌ Error loading featured creators:', error);
  }

  return (
    <section 
      id="creators" 
      className="relative py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background - Soft Lavender Bloom */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#F8F6FF] to-white" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              The Creators Shaping What's Next
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Building worlds. Sharing knowledge. Growing together.
          </p>
        </motion.div>

        {/* Grid Container - 2 rows × 3 columns */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <Skeleton className="md:row-span-2 h-[480px] sm:h-[520px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
            <Skeleton className="h-[240px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
            <Skeleton className="h-[240px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
            <Skeleton className="h-[240px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
            <Skeleton className="h-[240px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
            <Skeleton className="h-[240px] rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50" />
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto p-10 rounded-3xl bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] border border-gray-100">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Featured Creators Yet
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Check back soon for inspiring creator profiles!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Hero Creator Card (Large, Row-Span-2) */}
            {creators[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:row-span-2 group cursor-pointer"
                onClick={() => handleViewCreator(creators[0].id, creators[0].username)}
              >
                <div className="relative h-full min-h-[480px] sm:min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                  {/* Portrait Image */}
                  {creators[0].bannerImageURL || creators[0].profileImageURL ? (
                    <img
                      src={creators[0].bannerImageURL || creators[0].profileImageURL}
                      alt={creators[0].displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6FF] via-[#F1ECFF] to-[#E8F6FF]" />
                  )}
                  
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/85" />
                  
                  {/* Content - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    {/* XP Badge (optional) */}
                    {creators[0].subscribersCount && creators[0].subscribersCount > 0 && (
                      <div className="mb-3 inline-block">
                        <div className="px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-sm inline-block border border-white/60 shadow-sm">
                          <span className="text-gray-700 font-semibold text-sm">
                            {creators[0].subscribersCount.toLocaleString()} ZAPs
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Creator Name */}
                    <h3 className="text-gray-900 font-bold text-2xl sm:text-3xl mb-2 leading-tight">
                      {creators[0].displayName}
                    </h3>
                    
                    {/* Category Tag */}
                    <div className="inline-block">
                      <div className="px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <span className="text-gray-600 font-medium text-sm">
                          {creators[0].category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top Row - 2 Creator Cards */}
            {creators.slice(1, 3).map((creator, idx) => (
                <motion.div
                  key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx + 1) * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleViewCreator(creator.id, creator.username)}
              >
                <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                  {/* Portrait Image */}
                  {creator.bannerImageURL || creator.profileImageURL ? (
                    <img
                      src={creator.bannerImageURL || creator.profileImageURL}
                      alt={creator.displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6FF] via-[#F1ECFF] to-[#E8F6FF]" />
                  )}
                  
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/85" />
                  
                  {/* Content - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {/* XP Badge (optional, smaller) */}
                    {creator.subscribersCount && creator.subscribersCount > 0 && (
                      <div className="mb-2 inline-block">
                        <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm inline-block border border-white/60 shadow-sm">
                          <span className="text-gray-700 font-semibold text-xs">
                            {creator.subscribersCount.toLocaleString()} ZAPs
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Creator Name */}
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5 leading-tight line-clamp-2">
                      {creator.displayName}
                    </h3>
                    
                    {/* Category Tag */}
                    <div className="inline-block">
                      <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <span className="text-gray-600 font-medium text-xs">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              ))}

            {/* Bottom Row: Creator + Stats Card + Creator */}
            
            {/* Bottom Left Creator */}
            {creators[3] && (
              <motion.div
                key={creators[3].id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="group cursor-pointer"
                onClick={() => handleViewCreator(creators[3].id, creators[3].username)}
              >
                <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                  {/* Portrait Image */}
                  {creators[3].bannerImageURL || creators[3].profileImageURL ? (
                    <img
                      src={creators[3].bannerImageURL || creators[3].profileImageURL}
                      alt={creators[3].displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6FF] via-[#F1ECFF] to-[#E8F6FF]" />
                  )}
                  
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/85" />
                  
                  {/* Content - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {creators[3].subscribersCount && creators[3].subscribersCount > 0 && (
                      <div className="mb-2 inline-block">
                        <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm inline-block border border-white/60 shadow-sm">
                          <span className="text-gray-700 font-semibold text-xs">
                            {creators[3].subscribersCount.toLocaleString()} ZAPs
                          </span>
            </div>
          </div>
                    )}
                    
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5 leading-tight line-clamp-2">
                      {creators[3].displayName}
                    </h3>
                    
                    <div className="inline-block">
                      <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <span className="text-gray-600 font-medium text-xs">
                          {creators[3].category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Card (Center Bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#E8F6FF] via-[#F3EDFF] to-[#F8F6FF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                  <div className="text-center">
                    <p className="text-gray-900 font-bold text-3xl sm:text-4xl mb-3 leading-tight">
                      25,000+
                    </p>
                    <p className="text-gray-700 font-semibold text-sm sm:text-base leading-relaxed max-w-[200px]">
                      People Are Learning Together On WIZUP
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right Creator */}
            {creators[4] && (
              <motion.div
                key={creators[4].id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="group cursor-pointer"
                onClick={() => handleViewCreator(creators[4].id, creators[4].username)}
              >
                <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                  {/* Portrait Image */}
                  {creators[4].bannerImageURL || creators[4].profileImageURL ? (
                    <img
                      src={creators[4].bannerImageURL || creators[4].profileImageURL}
                      alt={creators[4].displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6FF] via-[#F1ECFF] to-[#E8F6FF]" />
                  )}
                  
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/85" />
                  
                  {/* Content - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {creators[4].subscribersCount && creators[4].subscribersCount > 0 && (
                      <div className="mb-2 inline-block">
                        <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm inline-block border border-white/60 shadow-sm">
                          <span className="text-gray-700 font-semibold text-xs">
                            {creators[4].subscribersCount.toLocaleString()} ZAPs
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5 leading-tight line-clamp-2">
                      {creators[4].displayName}
                    </h3>
                    
                    <div className="inline-block">
                      <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <span className="text-gray-600 font-medium text-xs">
                          {creators[4].category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Additional Row - 3 More Creators */}
            {creators.slice(5, 8).map((creator, idx) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx + 7) * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleViewCreator(creator.id, creator.username)}
              >
                <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#F1ECFF] shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-white/60">
                  {/* Portrait Image */}
                  {creator.bannerImageURL || creator.profileImageURL ? (
                    <img
                      src={creator.bannerImageURL || creator.profileImageURL}
                      alt={creator.displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6FF] via-[#F1ECFF] to-[#E8F6FF]" />
                  )}
                  
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/85" />
                  
                  {/* Content - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {creator.subscribersCount && creator.subscribersCount > 0 && (
                      <div className="mb-2 inline-block">
                        <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm inline-block border border-white/60 shadow-sm">
                          <span className="text-gray-700 font-semibold text-xs">
                            {creator.subscribersCount.toLocaleString()} ZAPs
                          </span>
                        </div>
        </div>
                    )}
                    
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1.5 leading-tight line-clamp-2">
                      {creator.displayName}
                    </h3>
                    
                    <div className="inline-block">
                      <div className="px-2.5 py-1 rounded-lg bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <span className="text-gray-600 font-medium text-xs">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Button
            onClick={async () => {
              if (!user) {
                setIsAuthenticating(true);
                try {
                  await signInWithGoogleAndRedirect(navigate);
                } catch (err) {
                  console.error('Sign in failed:', err);
                } finally {
                  setIsAuthenticating(false);
                }
              } else {
                navigate('/discover');
              }
            }}
            disabled={isAuthenticating}
            size="lg"
            className="bg-gradient-to-r from-[#E8F6FF] to-[#F3EDFF] hover:from-[#F3EDFF] hover:to-[#E8F6FF] text-gray-900 rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-[0_8px_22px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-white/60"
          >
            {isAuthenticating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              'Explore All Creators'
            ) : (
              'Join the Community'
            )}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
