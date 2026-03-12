import { useState } from "react";
import { motion } from "framer-motion";
import { GlassInput, GlassTextarea, GlassSelect } from "./ui/GlassInput";
import { GlassButton } from "./ui/GlassButton";

const defaultForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  assigneeId: "",
};

export default function AddTaskForm({ onAddTask, onCancel, members = [] }) {
  const [form, setForm] = useState(defaultForm);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    const formData = new FormData();


    setLoading(true);
    try {
      formData.append("title", form.title.trim());
      formData.append("priority", form.priority);
      formData.append("status", form.status);

      if (form.description.trim()) {
        formData.append("description", form.description.trim());
      }

      if (form.dueDate) {
        formData.append("dueDate", form.dueDate);
      }

      if (form.assigneeId) {
        formData.append("assigneeId", parseInt(form.assigneeId));
      }

      if (file) {
        formData.append("file", file);
      }

      await onAddTask(formData);
      // await onAddTask({
      //   ...form,
      //   title: form.title.trim(),
      //   description: form.description.trim() || undefined,
      //   dueDate: form.dueDate || undefined,
      //   assigneeId: form.assigneeId ? parseInt(form.assigneeId) : undefined,
      // });
      setForm(defaultForm);
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass-card p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          New Task
        </h2>
        <button
          onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <GlassInput
          name="title"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
          error={error}
          autoFocus
        />
        <GlassTextarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          rows={2}
        />
        <div className="grid grid-cols-3 gap-3">
          <GlassSelect name="priority" value={form.priority} onChange={handleChange} label="Priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </GlassSelect>
          <GlassSelect name="status" value={form.status} onChange={handleChange} label="Status">
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </GlassSelect>
          <GlassInput
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            label="Due date"
          />
        </div>
        {members.length > 0 && (
          <GlassSelect name="assigneeId" value={form.assigneeId} onChange={handleChange} label="Assign to">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </GlassSelect>
        )}
        <div className="flex gap-2 mt-1">
          <GlassInput
            type="file"
            label="Attachment"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              📎 {file.name}
            </p>
          )}
          <GlassButton type="submit" variant="primary" loading={loading} className="flex-1">
            Add task
          </GlassButton>
          <GlassButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </GlassButton>
        </div>
      </form>
    </motion.div>
  );
}
