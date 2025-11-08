import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedCommunities } from '@/hooks/useFeaturedCommunities';

export function CommunityHighlights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { data: communities = [], isLoading } = useFeaturedCommunities();

  return (
    <section id="communities" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Top Communities
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thriving communities of learners and creators
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No communities available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {communities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group cursor-pointer"
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
                    navigate(`/communities/${community.id}`);
                  }
                }}
              >
                <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100">
                    {community.banner ? (
                      <img
                        src={community.banner}
                        alt={community.name || 'Community'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-indigo-400 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {community.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                          {community.category}
                        </Badge>
                      </div>
                    )}
                    {index === 0 && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {community.name || 'Untitled Community'}
                    </h3>
                    {community.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{community.memberCount?.toLocaleString() || 0} members</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          setIsAuthenticating(true);
                          signInWithGoogleAndRedirect(navigate).catch(err => {
                            console.error('Sign in failed:', err);
                          }).finally(() => {
                            setIsAuthenticating(false);
                          });
                        } else {
                          navigate(`/communities/${community.id}`);
                        }
                      }}
                    >
                      {user ? 'View Community' : 'Sign In to View'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
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
                navigate('/communities');
              }
            }}
            disabled={isAuthenticating}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
          >
            {isAuthenticating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              'Explore All Communities'
            ) : (
              'Sign In to Explore Communities'
            )}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

