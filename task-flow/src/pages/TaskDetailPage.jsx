import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { GlassCard } from "../components/ui/GlassCard";
import { GlassBadge } from "../components/ui/GlassBadge";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassTextarea } from "../components/ui/GlassInput";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const toast = useToast();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/tasks/${taskId}`)
      .then(setTask)
      .catch(() => toast("Failed to load task", "error"))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await api.post(`/tasks/${taskId}/comments`, { content: comment.trim() });
      setTask((prev) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setComment("");
      toast("Comment added", "success");
    } catch {
      toast("Failed to add comment", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="glass-card p-8 text-center max-w-sm mx-auto mt-16">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Task not found</p>
        <Link to="/" className="text-xs mt-2 block" style={{ color: "var(--text-muted)" }}>
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const done = task.completed || task.status === "DONE";

  return (
    <motion.div
      className="flex flex-col gap-5 max-w-2xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      <Link
        to="/"
        className="text-xs w-fit"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        ← Dashboard
      </Link>

      <GlassCard animate={false} className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-lg font-semibold leading-snug"
            style={{
              color: "var(--text-primary)",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {task.title}
          </h1>
          <GlassBadge type={task.priority} />
        </div>

        {task.description && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <GlassBadge type={task.status} />
          {task.dueDate && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Due · {formatDate(task.dueDate)}
            </span>
          )}
          {task.creator && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Created by {task.creator.name}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Assigned to {task.assignee.name}
            </span>
          )}
        </div>
        {/* ATTACHMENT PREVIEW */}
        {task.attachment && (
          <div className="mt-2">
            {task.attachment?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={`http://localhost:5050/${task.attachment}`}
                alt="attachment"
                className="rounded-lg max-h-40 object-cover"
              />
            ) : (
              <a
                href={`http://localhost:5050/${task.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📎 View attachment
              </a>
            )}
        </div>
      )}
      </GlassCard>



      <GlassCard animate={false} className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Comments {task.comments?.length ? `· ${task.comments.length}` : ""}
        </h2>

        {task.comments?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {task.comments.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-1 p-3 rounded-xl"
                style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {c.user?.name ?? "Unknown"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No comments yet.
          </p>
        )}

        

        <div className="divider" />

        <form onSubmit={handleAddComment} className="flex flex-col gap-2">
          <GlassTextarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <GlassButton type="submit" variant="primary" loading={submitting} className="self-end">
            Post comment
          </GlassButton>
        </form>
      </GlassCard>
    </motion.div>
  );
}
