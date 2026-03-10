import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DndContext, useDroppable, useDraggable, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { GlassBadge } from "../components/ui/GlassBadge";
import './styling/kanban.css';

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

function KanbanCard({ task, isDragOverlay = false }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      className="glass-card p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
      style={{
        opacity: isDragOverlay ? 0.95 : 1,
        boxShadow: isDragOverlay ? "0 20px 60px rgba(0,0,0,0.5)" : undefined,
        transform: isDragOverlay ? "rotate(2deg)" : undefined,
      }}
    >
      <p
        className={`text-sm font-medium leading-snug kanban-card-title ${
          task.status === "DONE" ? "done" : ""
        }`}
      >
        {task.title}
      </p>
      {task.description && (
        <p
          className="text-xs line-clamp-2 kanban-card-desc"
        >
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
        <GlassBadge type={task.priority?.toLowerCase()} />
        {task.dueDate && (
          <span
            className={`text-xs kanban-due ${isOverdue ? "overdue" : ""}`}
          >
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
      {task.assignee && (
        <p className="text-xs kanban-assignee">
          → {task.assignee.name}
        </p>
      )}
    </div>
  );
}

function DraggableCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? undefined : "opacity 0.15s",
  };

  return (
    <Link to={`/tasks/${task.id}`} style={{ textDecoration: "none" }} onClick={(e) => { if (transform) e.preventDefault(); }}>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <KanbanCard task={task} />
      </div>
    </Link>
  );
}

function KanbanColumn({ id, label, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase kanban-column-title">
          {label}
        </h2>
        <span
          className="text-xs kanban-column-count"
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`kanban-column flex flex-col gap-2 ${isOver ? "drag-over" : ""}`}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs kanban-empty">
              Drop tasks here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    api
      .get("/tasks")
      .then(setTasks)
      .catch(() => toast("Failed to load tasks", "error"))
      .finally(() => setLoading(false));
  }, []);

  function getColumn(status) {
    return tasks.filter((t) => t.status === status);
  }

  function handleDragStart({ active }) {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  }

  async function handleDragEnd({ active, over }) {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, completed: newStatus === "DONE" } : t))
    );

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus, completed: newStatus === "DONE" });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status, completed: task.completed } : t)));
      toast("Failed to update task", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-1 flex flex-col gap-3">
            <div className="h-4 w-16 skeleton rounded" />
            <div className="glass-card p-2 min-h-48 skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight kanban-title">
          Kanban Board
        </h1>
        <p className="text-sm mt-0.5 kanban-subtitle">
          Drag tasks between columns to update their status
        </p>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.id} id={col.id} label={col.label} tasks={getColumn(col.status || col.id)} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}