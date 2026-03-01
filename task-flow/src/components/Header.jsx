import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { GlassBadge } from "./ui/GlassBadge";
import { useToast } from "./ui/Toast";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  function handleLogout() {
    logout();
    toast("Signed out.", "default");
    navigate("/login");
  }

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold"
            style={{
              background: "var(--glass-strong)",
              border: "1px solid var(--glass-border-hover)",
              color: "var(--text-primary)",
              letterSpacing: "0.05em",
            }}
          >
            TF
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            TaskFlow Pro
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <GlassBadge type={user.role} />
              <span className="text-sm hidden sm:block" style={{ color: "var(--text-secondary)" }}>
                {user.name}
              </span>
              <div className="divider" style={{ width: 1, height: 20 }} />
              <motion.button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
                whileHover={{ color: "var(--text-primary)" }}
                whileTap={{ scale: 0.96 }}
              >
                Sign out
              </motion.button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
