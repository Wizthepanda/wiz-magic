import { motion } from "framer-motion";

interface SkeletonCardProps {
  className?: string;
  height?: string;
}

/**
 * SkeletonCard - Loading placeholder for async data
 * Provides smooth pulse animation while data loads
 * Optimized for GPU rendering
 */
export default function SkeletonCard({ 
  className = "", 
  height = "h-56" 
}: SkeletonCardProps) {
  return (
    <motion.div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl w-full ${height} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ willChange: "opacity" }}
    />
  );
}

/**
 * SkeletonGrid - Grid of skeleton cards
 * Useful for video grids, content lists, etc.
 */
export function SkeletonGrid({ 
  count = 6, 
  className = "" 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  );
}

