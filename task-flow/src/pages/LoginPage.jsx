import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassInput } from "../components/ui/GlassInput";
import { useToast } from "../components/ui/Toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast("Welcome back.", "success");
      navigate("/");
    } catch (err) {
      toast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            TaskFlow Pro
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Sign in to continue
          </p>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <GlassInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <GlassInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-1"
            >
              Sign in
            </GlassButton>
          </form>

          <div className="divider my-5" />

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No account?{" "}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
