import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "default") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const typeStyles = {
    default: { border: "rgba(255,255,255,0.15)", color: "var(--text-primary)" },
    success: { border: "rgba(16,185,129,0.3)", color: "rgba(110,231,183,0.9)" },
    error: { border: "rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" },
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = typeStyles[toast.type] || typeStyles.default;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="glass-card px-4 py-3 text-sm font-medium max-w-xs pointer-events-auto"
                style={{ borderColor: style.border, color: style.color }}
              >
                {toast.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
