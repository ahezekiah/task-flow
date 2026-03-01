import { motion } from "framer-motion";

export function GlassButton({
  children,
  className = "",
  variant = "default",
  onClick,
  type = "button",
  disabled = false,
  loading = false,
}) {
  const variantMap = {
    default: "",
    primary: "glass-button-primary",
    danger: "glass-button-danger",
    ghost: "glass-button-ghost",
  };

  return (
    <motion.button
      type={type}
      className={`glass-button ${variantMap[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -1 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
