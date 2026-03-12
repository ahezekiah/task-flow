import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassBadge } from "../components/ui/GlassBadge";

const ROLES = ["PERSONAL", "TEAM_MEMBER", "TEAM_ADMIN", "SYSTEM_ADMIN"];

function StatCard({ label, value }) {
  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <span className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </motion.div>
  );
}

export default function AdminPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/users"), api.get("/tasks?all=true"), api.get("/admin/analytics")])
      .then(([usersData, tasksData, analyticsData]) => {
        setUsers(usersData);
        setTasks(tasksData);
        setAnalytics(analyticsData);
      })
      .catch(() => toast("Failed to load admin data", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId, role) {
    setUpdatingId(userId);
    try {
      const updated = await api.put(`/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      toast("Role updated", "success");
    } catch (err) {
      toast(err.message || "Failed to update role", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeactivate(userId) {
    setUpdatingId(userId);
    try {
      await api.put(`/users/${userId}/deactivate`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
      toast("User deactivated", "default");
    } catch (err) {
      toast(err.message || "Failed to deactivate user", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const doneTasks = tasks.filter((t) => t.status === "DONE" || t.completed).length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          System overview and user management
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 h-20 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={users.length} />
          <StatCard label="Active users" value={activeUsers} />
          <StatCard label="Total tasks" value={tasks.length} />
          <StatCard label="Completed tasks" value={doneTasks} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {!loading && (
          <>
            <div
              className="glass-card p-4 flex flex-col gap-1"
              style={{ borderLeft: "2px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {tasks.filter((t) => t.status === "TODO").length}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>To Do</span>
            </div>
            <div
              className="glass-card p-4 flex flex-col gap-1"
              style={{ borderLeft: "2px solid rgba(255,255,255,0.3)" }}
            >
              <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {inProgressTasks}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>In Progress</span>
            </div>
            <div
              className="glass-card p-4 flex flex-col gap-1"
              style={{ borderLeft: "2px solid rgba(255,255,255,0.6)" }}
            >
              <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {doneTasks}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Done</span>
            </div>
          </>
        )}
      </div>

      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Completion Rate
              </span>
              {analytics.overdueTasks > 0 && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {analytics.overdueTasks} overdue
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {analytics.completionRate}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full" style={{ background: "var(--glass-border)" }}>
              <motion.div
                className="h-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.5)" }}
                initial={{ width: 0 }}
                animate={{ width: `${analytics.completionRate}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col gap-3">
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              By Priority
            </span>
            {[
              { label: "High", key: "HIGH", opacity: 0.7 },
              { label: "Medium", key: "MEDIUM", opacity: 0.45 },
              { label: "Low", key: "LOW", opacity: 0.25 },
            ].map(({ label, key, opacity }) => {
              const count = analytics.priorityBreakdown[key] || 0;
              const total = Object.values(analytics.priorityBreakdown).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs w-12 shrink-0" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: "var(--glass-border)" }}>
                    <motion.div
                      className="h-1 rounded-full"
                      style={{ background: `rgba(255,255,255,${opacity})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right shrink-0" style={{ color: "var(--text-muted)" }}>{count}</span>
                </div>
              );
            })}
          </div>

          {analytics.topContributors.length > 0 && (
            <div className="glass-card p-5 flex flex-col gap-3">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Top Contributors
              </span>
              <div className="flex flex-col gap-2">
                {analytics.topContributors.map((c, i) => (
                  <motion.div
                    key={c.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                  >
                    <span className="text-xs w-4 shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                    <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.doneTasks} done</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {analytics.teamBreakdown.length > 0 && (
            <div className="glass-card p-5 flex flex-col gap-3">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Teams
              </span>
              <div className="flex flex-col gap-3">
                {analytics.teamBreakdown.map((team) => {
                  const pct = team.total > 0 ? (team.done / team.total) * 100 : 0;
                  return (
                    <div key={team.id} className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{team.name}</span>
                        <span className="text-xs shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{team.done}/{team.total}</span>
                      </div>
                      <div className="h-1 w-full rounded-full" style={{ background: "var(--glass-border)" }}>
                        <motion.div
                          className="h-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.4)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          User Management
        </h2>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 h-14 skeleton" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No users found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <motion.div
                key={u.id}
                className="glass-card p-4 flex items-center gap-4 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {u.name}
                    </span>
                    {u.isActive === false && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        Deactivated
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {u.email} · {u._count?.createdTasks ?? 0} tasks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    disabled={updatingId === u.id || u.isActive === false}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="glass-input glass-select text-xs px-3 py-1.5"
                    style={{ width: "auto", backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>

                  {u.isActive !== false && (
                    <GlassButton
                      variant="danger"
                      disabled={updatingId === u.id}
                      loading={updatingId === u.id}
                      onClick={() => handleDeactivate(u.id)}
                    >
                      Deactivate
                    </GlassButton>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          All Tasks
        </h2>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 h-14 skeleton" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No tasks in the system.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="glass-card p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: t.status === "DONE" ? "line-through" : "none",
                      opacity: t.status === "DONE" ? 0.5 : 1,
                    }}
                  >
                    {t.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    by {t.creator?.name}
                    {t.assignee && ` · assigned to ${t.assignee.name}`}
                    {t.team && ` · team task`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GlassBadge type={t.priority?.toLowerCase()} />
                  <GlassBadge type={t.status?.toLowerCase().replace("_", "-")} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
