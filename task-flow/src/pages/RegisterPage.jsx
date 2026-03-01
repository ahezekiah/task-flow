import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassInput } from "../components/ui/GlassInput";
import { useToast } from "../components/ui/Toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
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
      await register(form.name, form.email, form.password);
      toast("Account created. Welcome!", "success");
      navigate("/");
    } catch (err) {
      toast(err.message || "Registration failed", "error");
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
            Create account
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Start managing your tasks
          </p>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <GlassInput
              label="Name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
            />
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
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <GlassInput
              label="Confirm password"
              name="confirm"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-1"
            >
              Create account
            </GlassButton>
          </form>

          <div className="divider my-5" />

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
