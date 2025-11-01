/**
 * Liquid Glass ZAP Reward Tiers UI
 * Matches WIZUP dashboard aesthetic with soft translucent surfaces
 * Glassy blur, purple energy glow, minimal gradients
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZapReward {
  id: string;
  title: string;
  description: string;
  type: string;
  zapAmount: number;
}

interface ZapRewardTiersNextGenProps {
  communityId: string;
}

// Default fallback rewards matching liquid glass design
const defaultRewards: ZapReward[] = [
  {
    id: "welcome-bonus",
    title: "Welcome Bonus",
    description: "Join the community and get instant rewards to kickstart your journey",
    type: "Join Bonus",
    zapAmount: 50,
  },
  {
    id: "milestone-reward",
    title: "First Milestone",
    description: "Complete your first course module and unlock exclusive content access",
    type: "Milestone",
    zapAmount: 100,
  },
  {
    id: "community-champion",
    title: "Community Champion",
    description: "Reach level 30 and become a recognized leader in the community",
    type: "Achievement",
    zapAmount: 250,
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

  // Loading skeleton - liquid glass style
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
          />
        ))}
      </div>
    );
  }

  // Empty state - liquid glass style
  if (rewards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg"
      >
        <Zap className="h-7 w-7 text-purple-400 mb-3" />
        <p className="text-gray-200 font-medium">No reward tiers added yet</p>
        <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90 transition-all rounded-xl">
          + Add Reward Tier
        </Button>
      </motion.div>
    );
  }

  // Main render - liquid glass cards
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">ZAP Reward Tiers</h2>
        <span className="text-sm text-gray-400">
          {rewards.length} {rewards.length === 1 ? "Tier" : "Tiers"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward, idx) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{
              scale: 1.03,
              y: -3,
              boxShadow: "0 0 25px rgba(168,85,247,0.4)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="
              relative overflow-hidden rounded-2xl p-6
              bg-white/[0.05] border border-white/[0.1]
              backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.2)]
            "
          >
            {/* Subtle gradient light sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {reward.title}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {reward.description}
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-400/30 shadow-inner">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-md"
              >
                +{reward.zapAmount} ZAPs
              </motion.div>
              <span className="text-xs uppercase tracking-wide text-gray-400">
                {reward.type}
              </span>
            </div>

            {/* Subtle glass ring glow at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 opacity-60 rounded-b-2xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ZapRewardTiersNextGen;
