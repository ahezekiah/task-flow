import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassInput } from "../components/ui/GlassInput";
import AddTaskForm from "../components/AddTaskForm";
import TaskList from "../components/TaskList";

const STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const PRIORITY_FILTERS = [
  { label: "Any priority", value: "ALL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const isAdmin = team?.admin?.id === user?.id || user?.role === "SYSTEM_ADMIN";

  useEffect(() => {
    const id = parseInt(teamId);
    Promise.all([
      api.get(`/teams/${id}/members`),
      api.get(`/tasks?teamId=${id}`),
      api.get("/teams"),
    ])
      .then(([membersData, tasksData, teamsData]) => {
        setMembers(membersData);
        setTasks(tasksData);
        const found = teamsData.find((t) => t.id === id);
        if (found) setTeam(found);
      })
      .catch(() => toast("Failed to load team", "error"))
      .finally(() => setLoading(false));
  }, [teamId]);

  async function handleAddTask(data) {
    try {
      const task = await api.post("/tasks", { ...data, teamId: parseInt(teamId) });
      setTasks((prev) => [task, ...prev]);
      setShowForm(false);
      toast("Task created", "success");
    } catch (err) {
      toast(err.message || "Failed to create task", "error");
      throw err;
    }
  }

  async function handleToggle(id) {
    const task = tasks.find((t) => t.id === id);
    const isDone = task.completed || task.status === "DONE";
    try {
      const updated = await api.put(`/tasks/${id}`, {
        completed: !isDone,
        status: !isDone ? "DONE" : "TODO",
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      toast("Failed to update task", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast("Task deleted", "default");
    } catch {
      toast("Failed to delete task", "error");
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await api.post(`/teams/${teamId}/invite`, { email: inviteEmail.trim() });
      toast(result.message || "Member invited", "success");
      setInviteEmail("");
      setShowInvite(false);
      const updated = await api.get(`/teams/${parseInt(teamId)}/members`);
      setMembers(updated);
    } catch (err) {
      toast(err.message || "Failed to invite member", "error");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId) {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      toast("Member removed", "default");
    } catch (err) {
      toast(err.message || "Failed to remove member", "error");
    }
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const statusOk = statusFilter === "ALL" || t.status === statusFilter;
      const priorityOk = priorityFilter === "ALL" || t.priority === priorityFilter;
      return statusOk && priorityOk;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const completedCount = tasks.filter((t) => t.completed || t.status === "DONE").length;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/teams"
        className="text-sm w-fit"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        ← Teams
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {team?.name ?? "Team"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {tasks.length === 0
              ? "No tasks yet"
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} · ${completedCount} completed`}
          </p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New task"}
        </GlassButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <AddTaskForm
            onAddTask={handleAddTask}
            onCancel={() => setShowForm(false)}
            members={members}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: statusFilter === f.value ? "rgba(255,255,255,0.1)" : "transparent",
                border: statusFilter === f.value ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                color: statusFilter === f.value ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="glass-input glass-select text-xs px-3 py-1.5"
          style={{ width: "auto", backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          {PRIORITY_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <TaskList
        tasks={filtered}
        loading={loading}
        onDeleteTask={handleDelete}
        onToggleTask={handleToggle}
        onNewTask={() => setShowForm(true)}
      />

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Members
          </h2>
          {isAdmin && (
            <GlassButton variant="ghost" onClick={() => setShowInvite((v) => !v)}>
              {showInvite ? "Cancel" : "+ Invite"}
            </GlassButton>
          )}
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.form
              onSubmit={handleInvite}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 mb-4 overflow-hidden"
            >
              <div className="flex-1">
                <GlassInput
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  autoFocus
                />
              </div>
              <GlassButton type="submit" variant="primary" loading={inviting}>
                Invite
              </GlassButton>
            </motion.form>
          )}
        </AnimatePresence>

        {members.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No members yet. Invite someone to collaborate.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {member.name}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                    {member.email}
                  </span>
                </div>
                {isAdmin && member.id !== user?.id && (
                  <GlassButton variant="danger" onClick={() => handleRemove(member.id)}>
                    Remove
                  </GlassButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
