/**
 * Next-Generation ZAP Reward Tiers UI
 * Ultra-premium, visually immersive, responsive, and gamified
 * AAA platform polish with interactive motion and glow effects
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Zap, Flame, Star, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZapReward {
  id: string;
  title: string;
  description: string;
  type: string;
  zapAmount: number;
  tier?: number; // Optional: 1 = Bronze, 2 = Silver, 3 = Gold, etc.
}

interface ZapRewardTiersNextGenProps {
  communityId: string;
}

const tierStyles = [
  {
    bg: "from-amber-50/80 via-yellow-50/70 to-orange-50/80",
    ring: "ring-amber-200",
    glow: "shadow-[0_0_40px_-10px_rgba(251,191,36,0.6)]",
    icon: <Trophy className="text-amber-500 h-6 w-6" />,
  },
  {
    bg: "from-indigo-50/80 via-blue-50/70 to-purple-50/80",
    ring: "ring-indigo-200",
    glow: "shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]",
    icon: <Star className="text-indigo-500 h-6 w-6" />,
  },
  {
    bg: "from-rose-50/80 via-pink-50/70 to-fuchsia-50/80",
    ring: "ring-pink-200",
    glow: "shadow-[0_0_40px_-10px_rgba(236,72,153,0.6)]",
    icon: <Sparkles className="text-pink-500 h-6 w-6" />,
  },
];

// Default fallback rewards matching premium design
const defaultRewards: ZapReward[] = [
  {
    id: "welcome-bonus",
    title: "Welcome Bonus",
    description: "Join the community and get instant rewards to kickstart your journey",
    type: "Join Bonus",
    zapAmount: 50,
    tier: 1,
  },
  {
    id: "milestone-reward",
    title: "First Milestone",
    description: "Complete your first course module and unlock exclusive content access",
    type: "Milestone",
    zapAmount: 100,
    tier: 2,
  },
  {
    id: "community-champion",
    title: "Community Champion",
    description: "Reach level 30 and become a recognized leader in the community",
    type: "Achievement",
    zapAmount: 250,
    tier: 3,
  },
];

export const ZapRewardTiersNextGen: React.FC<ZapRewardTiersNextGenProps> = ({ communityId }) => {
  const [rewards, setRewards] = useState<ZapReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "communities", communityId, "zapRewards")
        );
        const rewardData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ZapReward[];

        // Use Firebase data if available, otherwise fall back to defaults
        setRewards(rewardData.length > 0 ? rewardData : defaultRewards);
      } catch (err) {
        console.error("Error loading ZAP rewards:", err);
        // On error, use default rewards
        setRewards(defaultRewards);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchRewards();
    } else {
      setRewards(defaultRewards);
      setLoading(false);
    }
  }, [communityId]);

  if (loading) {
    return (
      <div className="grid gap-6 mt-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50"
          />
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white/50 backdrop-blur-sm"
      >
        <Zap className="text-purple-500 h-8 w-8 mb-3" />
        <p className="text-gray-700 font-medium">No reward tiers added yet</p>
        <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg">
          + Add Reward Tier
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ZAP Reward Tiers</h2>
        </div>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {rewards.length} {rewards.length === 1 ? "Tier" : "Tiers"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward, idx) => {
          const style = tierStyles[idx % tierStyles.length];
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${style.bg}
                ring-1 ${style.ring} ${style.glow} shadow-md backdrop-blur-md overflow-hidden`}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reward.title}
                    </h3>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-full bg-white/70 backdrop-blur-sm p-2 shadow-sm"
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                </div>

                <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                  {reward.description}
                </p>

                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    +{reward.zapAmount} ZAPs
                  </motion.div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {reward.type}
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 w-full h-[4px] rounded-b-2xl bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add more tiers CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-4"
      >
        <Button
          variant="outline"
          className="border-2 border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 rounded-xl transition-all duration-200"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Add More Tiers
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ZapRewardTiersNextGen;
