/**
 * FAB — Floating Action Button for adding medicines.
 * Animated entrance with spring + tap scale feedback.
 */

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FABProps {
  to?: string;
  onClick?: () => void;
}

export function FAB({ to = "/medicines/add", onClick }: FABProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(to);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.3 }}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      className="absolute bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30"
      aria-label="Add medicine"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </motion.button>
  );
}
