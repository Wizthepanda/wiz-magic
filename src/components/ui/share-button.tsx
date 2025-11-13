import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Gift, Plus } from 'lucide-react';
import { Button } from './button';
import { useWizXPSystem } from '@/hooks/useWizXPSystem';
import { useAuth } from '@/hooks/useAuth';

interface ShareButtonProps {
  videoId: string;
  videoTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showXPReward?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  videoId,
  videoTitle = 'Check out this video on WIZ!',
  className = '',
  variant = 'outline',
  size = 'md',
  showXPReward = true
}) => {
  const { user } = useAuth();
  const { awardShareXP } = useWizXPSystem();
  const [isSharing, setIsSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const handleShare = async () => {
    if (!user || isSharing) return;

    try {
      setIsSharing(true);
      
      // Use Web Share API if available, otherwise copy to clipboard
      const shareUrl = `${window.location.origin}/video/${videoId}`;
      const shareData = {
        title: videoTitle,
        text: 'Check out this amazing video on WIZ!',
        url: shareUrl
      };

      let shared = false;
      
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        shared = true;
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        shared = true;
      }
      
      if (shared) {
        // Award XP for sharing (+20 XP per share)
        const shareXP = await awardShareXP(videoId);
        
        if (shareXP > 0) {
          setXpEarned(shareXP);
          setJustShared(true);
          
          // Reset after animation
          setTimeout(() => {
            setJustShared(false);
            setXpEarned(0);
          }, 3000);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing video:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing}
        className={`transition-all duration-200 ${className} ${
          justShared ? 'ring-2 ring-green-500/50 bg-green-500/10' : ''
        }`}
      >
        <motion.div
          className="flex items-center space-x-2"
          animate={justShared ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isSharing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Share2 className={iconSizes[size]} />
            </motion.div>
          ) : justShared ? (
            <Check className={`${iconSizes[size]} text-green-500`} />
          ) : (
            <Share2 className={iconSizes[size]} />
          )}
          
          <span>
            {isSharing ? 'Sharing...' : justShared ? 'Shared!' : 'Share'}
          </span>
          
          {showXPReward && !justShared && (
            <span className="text-xs text-green-400 font-medium">+20 XP</span>
          )}
        </motion.div>
      </Button>

      {/* XP Reward Animation */}
      {justShared && xpEarned > 0 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
          initial={{ scale: 0, y: 0 }}
          animate={{ 
            scale: [0, 1.2, 1], 
            y: [-10, -20, -30],
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.1, 1],
            ease: "easeOut"
          }}
        >
          +{xpEarned} XP
        </motion.div>
      )}
    </div>
  );
};

// Referral Link Component
interface ReferralLinkProps {
  className?: string;
}

export const ReferralLink: React.FC<ReferralLinkProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { awardReferralXP } = useWizXPSystem();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Generate referral code from user ID
  React.useEffect(() => {
    if (user) {
      const code = btoa(user.uid).substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
      setReferralCode(code);
    }
  }, [user?.uid]);

  // Check for referral on page load
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && user) {
      // Award XP to the referrer when new user signs up
      // This would typically be handled server-side in a real app
      console.log('User signed up with referral code:', refCode);
    }
  }, [user?.uid, awardReferralXP]);

  const copyReferralLink = async () => {
    if (!referralCode) return;

    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  if (!user || !referralCode) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-300 flex items-center space-x-2">
        <Gift className="w-4 h-4 text-yellow-500" />
        <span>Invite Friends (+50 XP per signup)</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-sm font-mono">
          wiz-magic.com?ref={referralCode}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyReferralLink}
          className="min-w-[80px]"
        >
          <motion.div
            className="flex items-center space-x-1"
            animate={copied ? { scale: [1, 1.05, 1] } : {}}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </motion.div>
        </Button>
      </div>
      
      <div className="text-xs text-gray-500">
        Share this link to earn XP when friends sign up!
      </div>
    </div>
  );
};