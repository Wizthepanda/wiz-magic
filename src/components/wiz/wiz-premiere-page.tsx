import { useState } from 'react';
import { Crown, Star, Zap, Video, Users, Gift, Lock, CheckCircle, Play, Sparkles, Award, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { FloatingParticles } from '@/components/ui/floating-particles';

export const WizPremierePage = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const isEligible = user && user.level >= 5;
  const currentLevel = user?.level || 1;
  const progressToLevel5 = Math.min((currentLevel / 5) * 100, 100);

  const premiereFeatures = [
    {
      icon: Crown,
      title: 'VIP Creator Access',
      description: 'Exclusive content from top creators before public release',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Zap,
      title: '2x XP Multiplier',
      description: 'Double XP earnings on all content consumption',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Video,
      title: 'Premium Content Library',
      description: 'Access to premium educational content and masterclasses',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Creator Direct Line',
      description: 'Direct messaging and priority responses from creators',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Gift,
      title: 'Exclusive Rewards',
      description: 'Premium rewards store with limited edition items',
      color: 'from-red-400 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Ad-Free Experience',
      description: 'Enjoy uninterrupted learning without any advertisements',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 9.99,
      period: 'month',
      savings: null,
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 99.99,
      period: 'year',
      savings: 'Save 17%',
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 299.99,
      period: 'one-time',
      savings: 'Best Value',
      popular: false
    }
  ];

  const exclusiveContent = [
    {
      title: 'AI Mastery Bootcamp',
      creator: 'AIGuru42',
      duration: '4h 30m',
      category: 'AI',
      thumbnail: '🤖',
      xpValue: '2,500 XP',
      exclusive: true
    },
    {
      title: 'Crypto Trading Secrets',
      creator: 'CryptoKing',
      duration: '3h 15m',
      category: 'Finance',
      thumbnail: '💎',
      xpValue: '2,000 XP',
      exclusive: true
    },
    {
      title: 'Advanced React Patterns',
      creator: 'CodeMaster',
      duration: '5h 45m',
      category: 'Tech',
      thumbnail: '⚛️',
      xpValue: '3,200 XP',
      exclusive: true
    }
  ];

  return (
    <div className="relative min-h-full">
      <FloatingParticles />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Premium Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-purple-500/20 to-yellow-400/20 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 flex items-center justify-center shadow-2xl animate-pulse">
              <Crown className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent mt-4">
              WIZ Premiere
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
              A Hollywood-level AI animation brought to life by 6 visionary animators
            </p>
          </div>
        </div>

        {/* Premiere Trailer */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-yellow-400/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <Card className="border-0 shadow-2xl overflow-hidden relative" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            border: '2px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2">
                <Video className="w-4 h-4 mr-2" />
                PREMIERE TRAILER
              </Badge>
            </div>
            
            <CardContent className="p-0">
              <div className="aspect-video relative group cursor-pointer" onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                {!isVideoPlaying ? (
                  <>
                    {/* Panda Thumbnail */}
                    <div 
                      className="w-full h-full bg-cover bg-center rounded-t-3xl"
                      style={{
                        backgroundImage: 'url("/wiz-premiere-panda.svg")',
                        borderRadius: '24px 24px 0 0'
                      }}
                    >
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all duration-300 rounded-t-3xl">
                        <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                          <Play className="w-10 h-10 text-black ml-1" />
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                          2:45
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/2M4asXviuoo?autoplay=1&enablejsapi=1&origin=wizxp.com&rel=0&showinfo=0&modestbranding=1"
                    title="WIZ Premiere Trailer - The Future of AI Animation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-t-3xl"
                    style={{
                      border: 'none',
                      borderRadius: '24px 24px 0 0'
                    }}
                  />
                )}
              </div>
              
              <div className="p-6 space-y-4" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">The Future of AI Animation</h3>
                    <p className="text-gray-300">Witness stunning AI-generated visuals and Hollywood-level storytelling</p>
                  </div>
                  <div className="flex items-center space-x-3 text-yellow-400">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">4.9</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                      <Crown className="w-4 h-4" />
                      <span className="font-semibold">Premium</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>2.1M views</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4" />
                    <span>4K Ultra HD</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Award Winning</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eligibility Status */}
        <Card className={`border-0 shadow-xl ${isEligible ? 'border-green-200' : 'border-orange-200'}`} style={{
          background: isEligible 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          border: isEligible ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(249, 115, 22, 0.2)'
        }}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isEligible 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-orange-400 to-yellow-500'
                }`}>
                  {isEligible ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {isEligible ? 'You\'re Eligible!' : 'Level 5 Required'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isEligible 
                      ? 'You can now upgrade to WIZ Premiere' 
                      : `Reach Level 5 to unlock WIZ Premiere (Currently Level ${currentLevel})`
                    }
                  </p>
                </div>
              </div>
              
              {!isEligible && (
                <div className="text-right space-y-2">
                  <div className="text-sm font-medium">Progress to Level 5</div>
                  <div className="w-48">
                    <Progress value={progressToLevel5} className="h-3" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentLevel}/5 Levels
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Grid */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-wiz-primary to-wiz-secondary bg-clip-text text-transparent">
            Premiere Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiereFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px'
              }}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  {!isEligible && (
                    <Badge variant="outline" className="mt-2">
                      <Lock className="w-3 h-3 mr-1" />
                      Level 5 Required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        {isEligible && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-wiz-primary to-wiz-secondary bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer relative ${
                    selectedPlan === plan.id ? 'ring-2 ring-wiz-primary scale-105' : 'hover:scale-105'
                  } ${plan.popular ? 'border-wiz-primary' : ''}`}
                  style={{
                    background: plan.popular 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    border: plan.popular ? '2px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-8 text-center space-y-4">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-wiz-primary">
                        ${plan.price}
                      </div>
                      <div className="text-muted-foreground">
                        {plan.period === 'one-time' ? 'One-time payment' : `per ${plan.period}`}
                      </div>
                      {plan.savings && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 hover:from-yellow-500 hover:via-purple-600 hover:to-yellow-500 text-white font-bold px-12 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                style={{ borderRadius: '15px' }}
              >
                <Crown className="w-6 h-6 mr-2" />
                Upgrade to Premiere
              </Button>
            </div>
          </div>
        )}

        {/* Exclusive Content Preview */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-wiz-primary to-wiz-secondary bg-clip-text text-transparent">
            Exclusive Content Preview
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {exclusiveContent.map((content, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                {/* Premium Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                    <Crown className="w-3 h-3 mr-1" />
                    PREMIERE
                  </Badge>
                </div>

                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl">
                    {content.thumbnail}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        {isEligible ? (
                          <Play className="w-8 h-8 text-black ml-1" />
                        ) : (
                          <Lock className="w-8 h-8 text-black" />
                        )}
                      </div>
                    </div>

                    {/* XP Badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-400/90 text-black text-sm font-bold">
                        <Zap className="w-4 h-4" />
                        <span>{content.xpValue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-white">{content.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>{content.creator}</span>
                      <span>{content.duration}</span>
                    </div>
                    <Badge variant="outline" className="border-yellow-400/30 text-yellow-400">
                      {content.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade CTA for non-eligible users */}
        {!isEligible && (
          <Card className="border-0 shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-wiz-primary to-wiz-secondary flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Keep Learning to Unlock Premiere</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Continue watching content and earning XP to reach Level 5. Once you're there, you'll unlock access to WIZ Premiere and all its exclusive features.
              </p>
              <div className="space-y-4">
                <div className="text-sm font-medium">Progress to Level 5</div>
                <Progress value={progressToLevel5} className="h-4 max-w-md mx-auto" />
                <div className="text-sm text-muted-foreground">
                  Level {currentLevel} of 5 ({Math.floor(progressToLevel5)}% complete)
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary text-white font-semibold px-8 py-3"
                style={{ borderRadius: '12px' }}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Watching Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};