import { AnimatePresence, motion } from "framer-motion";
import TaskCard from "./TaskCard";
import { GlassButton } from "./ui/GlassButton";
import { PageSkeleton } from "./ui/Skeleton";

export default function TaskList({ tasks, loading, onDeleteTask, onToggleTask, onNewTask }) {
  if (loading) {
    return <PageSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card flex flex-col items-center justify-center gap-4 py-20 text-center"
      >
        <div
          className="text-4xl font-thin"
          style={{ color: "var(--text-muted)", letterSpacing: "-0.02em" }}
        >
          ○
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            No tasks here
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Create your first task to get started
          </p>
        </div>
        <GlassButton variant="primary" onClick={onNewTask}>
          + New task
        </GlassButton>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={i}
            onDelete={() => onDeleteTask(task.id)}
            onToggle={() => onToggleTask(task.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
