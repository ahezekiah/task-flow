import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassBadge } from "./ui/GlassBadge";
import { GlassButton } from "./ui/GlassButton";

function isOverdue(task) {
  if (!task.dueDate || task.completed || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task, onDelete, onToggle, index = 0 }) {
  const overdue = isOverdue(task);
  const done = task.completed || task.status === "DONE";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      className="glass-card p-4 flex flex-col gap-3"
      style={{
        opacity: done ? 0.6 : 1,
        borderColor: overdue ? "rgba(239, 68, 68, 0.25)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <Link
            to={`/tasks/${task.id}`}
            className="text-sm font-semibold leading-snug hover:opacity-70 transition-opacity truncate"
            style={{
              color: "var(--text-primary)",
              textDecoration: "none",
              textDecorationLine: done ? "line-through" : "none",
            }}
          >
            {task.title}
          </Link>
          {task.description && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: "var(--text-muted)" }}
            >
              {task.description}
            </p>
          )}
        </div>
        <GlassBadge type={task.priority} className="shrink-0" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <GlassBadge type={task.status} />
        {task.dueDate && (
          <span
            className="text-xs"
            style={{ color: overdue ? "rgba(252, 165, 165, 0.8)" : "var(--text-muted)" }}
          >
            {overdue ? "Overdue · " : "Due · "}
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignee && (
          <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
            → {task.assignee.name}
          </span>
        )}
      </div>
      {/* ATTACHMENT PREVIEW */}
      {task.attachment && (
        <div className="mt-1">
          {task.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={`http://localhost:5050/${task.attachment}`}
              alt="attachment"
              className="rounded-md max-h-28 object-cover"
            />
          ) : (
            <a
              href={`http://localhost:5050/${task.attachment}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
              style={{ color: "var(--text-secondary)" }}
            >
              📎 View Attachment
            </a>
          )}
        </div>
      )}


      <div className="divider" />

      <div className="flex items-center justify-between gap-2">
        <motion.label
          className="flex items-center gap-2 cursor-pointer select-none"
          whileTap={{ scale: 0.95 }}
        >
          <input
            type="checkbox"
            checked={done}
            onChange={onToggle}
            className="h-4 w-4 rounded"
            style={{ accentColor: "rgba(255,255,255,0.8)", cursor: "pointer" }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {done ? "Completed" : "Mark done"}
          </span>
        </motion.label>

        <GlassButton variant="danger" className="text-xs px-2.5 py-1.5" onClick={onDelete}>
          Delete
        </GlassButton>
      </div>
    </motion.article>
  );
}
