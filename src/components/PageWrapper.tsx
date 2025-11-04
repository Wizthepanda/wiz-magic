import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

/**
 * PageWrapper - Universal wrapper for all routes
 * Provides consistent fade-in/fade-out transitions
 * Optimized for GPU compositing and smooth rendering
 */
export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen"
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

