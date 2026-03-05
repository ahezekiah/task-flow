import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { GlassBadge } from "./ui/GlassBadge";
import { useToast } from "./ui/Toast";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  function handleLogout() {
    logout();
    toast("Signed out.", "default");
    navigate("/login");
  }

  function navStyle(path) {
    const active = location.pathname === path || location.pathname.startsWith(path + "/");
    return {
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: active ? 500 : 400,
      transition: "color 0.15s",
    };
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
        <div className="flex items-center gap-6">
          <Link to="/" style={{ textDecoration: "none" }} className="flex items-center gap-3">
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
            <span className="text-sm font-semibold hidden sm:block" style={{ color: "var(--text-primary)" }}>
              TaskFlow Pro
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/" style={navStyle("/")}>My Tasks</Link>
              <Link to="/teams" style={navStyle("/teams")}>Teams</Link>
              <Link to="/kanban" style={navStyle("/kanban")}>Kanban</Link>
              <Link to="/activity" style={navStyle("/activity")}>Activity</Link>
              <Link to="/calendar" style={navStyle("/calendar")}>Calendar</Link>
              {user.role === "SYSTEM_ADMIN" && (
                <Link to="/admin" style={navStyle("/admin")}>Admin</Link>
              )}
            </nav>
          )}
        </div>

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
