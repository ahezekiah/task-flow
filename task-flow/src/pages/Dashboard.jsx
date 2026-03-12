import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { GlassButton } from "../components/ui/GlassButton";
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

function greeting(name) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] ?? "";
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    api
      .get("/tasks")
      .then(setTasks)
      .catch(() => toast("Failed to load tasks", "error"))
      .finally(() => setLoading(false));
  }, []);

  // async function handleAddTask(data) {
  //   try {
  //     const task = await api.post("/tasks", data);
  //     setTasks((prev) => [task, ...prev]);
  //     setShowForm(false);
  //     toast("Task created", "success");
  //   } catch (err) {
  //     toast(err.message || "Failed to create task", "error");
  //     throw err;
  //   }
  // }

  async function handleAddTask(data, file) {
    try {
      // let file = null;

      if (data instanceof FormData) {
        file = data.get("file");
        data.delete("file");
      }

      // create task
      const taskData = data instanceof FormData
      ? {
          title: data.get("title"),
          description: data.get("description") || undefined,
          priority: data.get("priority"),
          status: data.get("status"),
          dueDate: data.get("dueDate") || undefined,
          assigneeId: data.get("assigneeId")
            ? parseInt(data.get("assigneeId"))
            : undefined,
        }
      : data;

      const task = await api.post("/tasks", taskData);
      
      // immediately show task in UI
      setTasks((prev) => [task, ...prev]);

      // upload file if present
      if (file) {
        console.log("Uploading file:", file);
        const uploadData = new FormData();
        uploadData.append("file", file);

        await api.post(`/tasks/${task.id}/attachment`, uploadData);
      }
      // if (file instanceof File) {
      //     const uploadData = new FormData();
      //     uploadData.append("file", file);

      //     await api.post(`/tasks/${task.id}/attachment`, uploadData);
      //   }
        
      // get updated task with attachment
      const updated = await api.get(`/tasks/${task.id}`);

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {greeting(user?.name)}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {tasks.length === 0
              ? "No tasks yet"
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} · ${completedCount} completed`}
          </p>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ New task"}
        </GlassButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <AddTaskForm
            onAddTask={handleAddTask}
            onCancel={() => setShowForm(false)}
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
    </div>
  );
}
