import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activityIcon(type) {
  const icons = {
    task_created: "○",
    task_done: "●",
    task_updated: "◐",
    comment: "◇",
    team_task: "⬡",
  };
  return icons[type] || "○";
}

function activityLabel(event) {
  const name = event.user?.name || "Someone";
  switch (event.type) {
    case "task_created":
      return `${name} created`;
    case "task_done":
      return `${name} completed`;
    case "task_updated":
      return `${name} updated`;
    case "comment":
      return `${name} commented on`;
    case "team_task":
      return `${name} created team task`;
    default:
      return `${name} acted on`;
  }
}

function buildEvents(tasks, currentUserId) {
  const events = [];

  tasks.forEach((task) => {
    events.push({
      id: `task-created-${task.id}`,
      type: task.teamId ? "team_task" : "task_created",
      task,
      user: task.creator,
      date: task.createdAt,
    });

    if (task.status === "DONE" && task.updatedAt !== task.createdAt) {
      events.push({
        id: `task-done-${task.id}`,
        type: "task_done",
        task,
        user: task.creator,
        date: task.updatedAt,
      });
    }

    (task.comments || []).forEach((comment) => {
      events.push({
        id: `comment-${comment.id}`,
        type: "comment",
        task,
        user: comment.user,
        comment,
        date: comment.createdAt,
      });
    });
  });

  return events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
}

export default function ActivityPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const personalTasks = await api.get("/tasks");
        const teams = await api.get("/teams");

        const teamTaskArrays = await Promise.all(
          teams.map((t) => api.get(`/tasks?teamId=${t.id}`).catch(() => []))
        );
        const teamTasks = teamTaskArrays.flat();

        const allTasks = [
          ...personalTasks,
          ...teamTasks.filter((t) => !personalTasks.find((p) => p.id === t.id)),
        ];

        setEvents(buildEvents(allTasks, user?.id));
      } catch {
        toast("Failed to load activity", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Activity Feed
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Recent actions across your tasks and teams
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card p-4 h-14 skeleton" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No activity yet. Create tasks to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 28 }}
              className="flex gap-4 relative"
            >
              {i < events.length - 1 && (
                <div
                  className="absolute left-[11px] top-7 bottom-0 w-px"
                  style={{ background: "var(--glass-border)" }}
                />
              )}

              <div
                className="mt-3 h-6 w-6 shrink-0 grid place-items-center rounded-full text-xs z-10"
                style={{
                  background: "var(--glass)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-muted)",
                }}
              >
                {activityIcon(event.type)}
              </div>

              <div className="pb-5 pt-2 flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {activityLabel(event)}
                  </span>
                  <Link
                    to={`/tasks/${event.task.id}`}
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)", textDecoration: "none" }}
                  >
                    {event.task.title}
                  </Link>
                </div>

                {event.comment && (
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: "var(--text-muted)", fontStyle: "italic" }}
                  >
                    "{event.comment.content}"
                  </p>
                )}

                <span className="text-xs mt-0.5 block" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                  {timeAgo(event.date)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}