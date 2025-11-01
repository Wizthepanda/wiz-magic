/**
 * Liquid Glass ZAP Reward Tiers UI (Live Data + Readability Fix)
 * Matches WIZUP dashboard aesthetic with soft translucent surfaces
 * Glassy blur, purple energy glow, minimal gradients
 * Enhanced readability with better text hierarchy and contrast
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Zap } from "lucide-react";

interface ZapReward {
  id: string;
  title: string;
  description: string;
  zapAmount: number;
  type: string;
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
        const q = query(
          collection(db, "communities", communityId, "zapRewards"),
          orderBy("zapAmount", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ZapReward[];

        // Use Firebase data if available, otherwise fall back to defaults
        setRewards(data.length > 0 ? data : defaultRewards);
      } catch (err) {
        console.error("🔥 Error fetching ZAP rewards:", err);
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

  return (
    <section className="relative w-full">
      {/* Background shimmer layer for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-pink-500/10 blur-2xl opacity-60 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            ⚡ ZAP Reward Tiers
          </h2>
          <span className="text-sm font-medium text-gray-300 tracking-wide">
            {loading ? "Loading..." : `${rewards.length} Active Tier${rewards.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Loader */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="h-44 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* No Rewards */}
        {!loading && rewards.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg">
            <Zap className="h-8 w-8 text-purple-400 mb-3" />
            <p className="text-gray-200 font-semibold">
              No reward tiers yet — creators haven't added any ZAPs.
            </p>
          </div>
        )}

        {/* Reward Grid */}
        {!loading && rewards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{
                  scale: 1.03,
                  y: -3,
                  boxShadow: "0 0 30px rgba(168,85,247,0.4)",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="
                  relative overflow-hidden rounded-2xl p-6
                  bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15]
                  shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_40px_rgba(0,0,0,0.25)]
                  text-white
                "
              >
                {/* Glow border sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ backgroundSize: "200% 100%" }}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold leading-tight drop-shadow-md">
                        {reward.title}
                      </h3>
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 border border-purple-300/40">
                        <Zap className="h-5 w-5 text-purple-300" />
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed max-w-xs">
                      {reward.description}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between mt-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold tracking-wide shadow-lg"
                    >
                      +{reward.zapAmount} ZAPs
                    </motion.div>
                    <span className="text-xs uppercase tracking-widest text-gray-300">
                      {reward.type}
                    </span>
                  </div>
                </div>

                {/* Ambient ring glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 opacity-80 rounded-b-2xl" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ZapRewardTiersNextGen;
