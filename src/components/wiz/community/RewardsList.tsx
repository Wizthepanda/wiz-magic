import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Zap, Download, Trophy, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Reward } from "@/types/community";

interface RewardsListProps {
  communityId: string;
}

export function RewardsList({ communityId }: RewardsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  // Mock rewards - replace with real data from Firestore
  const rewards: Reward[] = [
    {
      id: "r1",
      title: "Exclusive Resource Pack",
      description: "Premium templates, guides, and tools to accelerate your learning",
      zaps: 50,
      type: "download",
      claimed: false,
      available: true
    },
    {
      id: "r2",
      title: "1:1 AMA Session",
      description: "Personal 30-minute session with the creator",
      zaps: 500,
      type: "event",
      claimed: false,
      available: true
    },
    {
      id: "r3",
      title: "Master Certificate",
      description: "Complete all modules to unlock this achievement",
      zaps: 1000,
      type: "badge",
      claimed: false,
      available: false
    },
    {
      id: "r4",
      title: "Advanced Course Access",
      description: "Unlock the next level of training",
      zaps: 750,
      type: "access",
      claimed: false,
      available: true
    }
  ];

  const handleClaimReward = async (reward: Reward) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to claim rewards",
        variant: "destructive"
      });
      return;
    }

    if (!reward.available) {
      toast({
        title: "Reward locked",
        description: "Complete prerequisites to unlock this reward",
        variant: "destructive"
      });
      return;
    }

    setClaiming(reward.id);

    try {
      // TODO: Implement actual claim logic with Firestore and ZAP deduction
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Reward claimed! 🎉",
        description: `You've unlocked ${reward.title}`,
      });
    } catch (error) {
      toast({
        title: "Claim failed",
        description: "Unable to claim reward. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (type?: string) => {
    switch (type) {
      case 'download':
        return <Download className="w-5 h-5" />;
      case 'event':
        return <Gift className="w-5 h-5" />;
      case 'badge':
        return <Trophy className="w-5 h-5" />;
      case 'access':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  if (rewards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 bg-white/70 backdrop-blur-sm shadow-sm text-center"
      >
        <Gift className="w-16 h-16 mx-auto text-slate-300 mb-3" />
        <h4 className="text-lg font-semibold text-slate-700">No rewards yet</h4>
        <p className="text-sm text-slate-500 mt-2">
          Check back soon for exclusive community rewards!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">
              Earn ZAPs, Unlock Rewards
            </h4>
            <p className="text-sm text-amber-700">
              Complete lessons and engage with the community to earn ZAPs. Use them to unlock exclusive rewards below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {rewards.map((reward, idx) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              rounded-2xl p-6 bg-white/70 backdrop-blur-sm shadow-sm 
              hover:shadow-md transition-all
              ${!reward.available ? 'opacity-60' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${reward.available 
                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white' 
                    : 'bg-slate-200 text-slate-400'
                  }
                `}>
                  {reward.available ? getRewardIcon(reward.type) : <Lock className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900">
                      {reward.title}
                    </h4>
                    {reward.claimed && (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Claimed
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3">
                    {reward.description}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                      ${reward.available 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-500'
                      }
                    `}>
                      <Zap className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-sm">{reward.zaps} ZAPs</span>
                    </div>

                    {reward.type && (
                      <Badge variant="outline" className="capitalize text-xs">
                        {reward.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => handleClaimReward(reward)}
                  disabled={!reward.available || reward.claimed || claiming === reward.id}
                  className={`
                    ${reward.available && !reward.claimed
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:shadow-md' 
                      : 'bg-slate-200 text-slate-500'
                    }
                  `}
                >
                  {claiming === reward.id ? (
                    <>Claiming...</>
                  ) : reward.claimed ? (
                    <>Claimed</>
                  ) : !reward.available ? (
                    <>Locked</>
                  ) : (
                    <>Claim</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

