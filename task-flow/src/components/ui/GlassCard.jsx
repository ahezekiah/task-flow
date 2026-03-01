import { motion } from "framer-motion";

export function GlassCard({ children, className = "", hover = false, onClick, animate = true }) {
  const hoverClass = hover ? "glass-card-hover cursor-pointer" : "";

  if (!animate) {
    return (
      <div className={`glass-card ${hoverClass} ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-card ${hoverClass} ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
