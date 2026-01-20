import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";

const initialTasks = [
  {
    id: 1,
    title: "Set up project repo",
    description: "Initialize React app and configure Tailwind.",
    priority: "High",
    dueDate: "2026-01-22",
    completed: false,
  },
  {
    id: 2,
    title: "Build Header component",
    description: "Create the top navigation bar with branding.",
    priority: "Medium",
    dueDate: "2026-01-23",
    completed: true,
  },
  {
    id: 3,
    title: "Create TaskCard UI",
    description: "Design a reusable card for task display.",
    priority: "High",
    dueDate: "2026-01-24",
    completed: false,
  },
  {
    id: 4,
    title: "Add AddTaskForm",
    description: "Controlled inputs for creating tasks.",
    priority: "Medium",
    dueDate: "2026-01-25",
    completed: false,
  },
  {
    id: 5,
    title: "Wire up delete + toggle",
    description: "Implement interactivity using state + handlers.",
    priority: "High",
    dueDate: "2026-01-26",
    completed: false,
  },
];


export default function App() {
  const [tasks, setTasks] = useState(initialTasks);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // makes unique-ish IDs even if you delete stuff (no collisions)
  const nextId = useMemo(() => {
    const max = tasks.reduce((acc, t) => Math.max(acc, t.id), 0);
    return max + 1;
  }, [tasks]);


function handleAddTask (newTaskData) {
  const newTask = {
    id: nextId,
    ...newTaskData,
    completed: false,
  };
  // no mutation
  setTasks((prev) => [...prev, newTask]);
}

function handleDeleteTask(taskIdToDelete) {
  // correct filter
  setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
}

function handleToggleTask(taskIdToToggle) {
  // correct map + immutability
  setTasks((prev) =>
    prev.map((t) =>
      t.id === taskIdToToggle ? { ...t, completed: !t.completed } : t
    )
  );
}
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header/>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Add New Task</h2>
            <p className="mt-1 text-sm text-slate-400">
              Keep it simeple: Title, Description, Priority, & Due Date.
            </p>
            <div className="mt-4">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Task List</h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage your tasks: Toggle completion or delete as needed.
              </p>
            </div>
            
            <div className="mt-4">
              <TaskList 
                tasks={tasks} 
                onDeleteTask={handleDeleteTask} 
                onToggleTask={handleToggleTask} 
              />
            </div>
          </section>
        </div>
      </main>
      
    </div>
  );
}
