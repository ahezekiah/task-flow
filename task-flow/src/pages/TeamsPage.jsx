import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassInput } from "../components/ui/GlassInput";

export default function TeamsPage() {
  const toast = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get("/teams")
      .then(setTeams)
      .catch(() => toast("Failed to load teams", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const team = await api.post("/teams", { name: name.trim() });
      setTeams((prev) => [team, ...prev]);
      setName("");
      setShowForm(false);
      toast("Team created", "success");
    } catch (err) {
      toast(err.message || "Failed to create team", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Teams
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {loading ? "" : teams.length === 0 ? "No teams yet" : `${teams.length} team${teams.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New team"}
        </GlassButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass-card p-5"
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Create team
            </h2>
            <form onSubmit={handleCreate} className="flex gap-3">
              <div className="flex-1">
                <GlassInput
                  name="name"
                  placeholder="Team name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <GlassButton type="submit" variant="primary" loading={creating}>
                Create
              </GlassButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 h-28 skeleton" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No teams yet. Create one to start collaborating.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <motion.div
              key={team.id}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link to={`/teams/${team.id}`} style={{ textDecoration: "none" }}>
                <div className="glass-card glass-card-hover p-5 flex flex-col gap-3 cursor-pointer h-full">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {team.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Admin: {team.admin?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {team._count?.members ?? 0} member{team._count?.members !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {team._count?.tasks ?? 0} task{team._count?.tasks !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
