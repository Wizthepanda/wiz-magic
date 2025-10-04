import React from "react";
import { motion } from "framer-motion";

interface CreatorDashboardProps {
  creations: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  creations,
  onEdit,
  onDelete
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-white mb-2">Your Creations</h3>
        <p className="text-gray-400">Manage your communities, courses, and products</p>
      </div>
    </motion.div>
  );
};

export default CreatorDashboard;
