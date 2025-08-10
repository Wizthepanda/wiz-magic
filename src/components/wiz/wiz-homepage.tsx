import { useState } from 'react';
import { Play, Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface WizHomepageProps {
  onEnterPlatform: () => void;
}

export const WizHomepage = ({ onEnterPlatform }: WizHomepageProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { user, signInWithGoogle } = useAuth();

  const handleEnterPlatform = () => {
    if (user) {
      onEnterPlatform();
    } else {
      // Allow entry without authentication for demo purposes
      // Try to sign in, but if it fails, still enter the platform
      signInWithGoogle().catch(() => {
        console.log('Authentication not configured, entering as demo user');
        onEnterPlatform();
      });
    }
  };

  const stats = [
    { icon: Users, label: 'Active Wizards', value: '12.5K+' },
    { icon: TrendingUp, label: 'XP Earned Today', value: '2.3M+' },
    { icon: Star, label: 'Featured Creators', value: '150+' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-wiz-primary to-wiz-secondary flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary bg-clip-text text-transparent">
            WIZ
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Hero Title */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-wiz-primary via-wiz-secondary to-wiz-magic bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              WIZ
            </motion.h1>
            <motion.h2 
              className="text-2xl md:text-3xl font-semibold text-foreground/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Watch YouTube, Earn Rewards
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Wiz turns your watch time into XP & cash - just keep watching what you love
            </motion.p>
          </motion.div>

          {/* Play Button */}
          <motion.div 
            className="flex justify-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleEnterPlatform}
                className="wiz-play-button h-20 w-20 rounded-full p-0 relative overflow-hidden group"
              >
                <Play 
                  className={`w-8 h-8 text-white transition-transform duration-300 ${
                    isHovering ? 'scale-125' : 'scale-100'
                  }`} 
                  fill="currentColor"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-wiz-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="glass-card border-card-border">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-wiz-primary" />
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Start your magical learning journey today
        </p>
      </footer>
    </div>
  );
};