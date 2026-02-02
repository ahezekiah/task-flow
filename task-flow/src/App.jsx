//Advanced Web Scripting MTM 320 
//Project : Task Flow - A Task Management Application (React Fundementals)
//Learning Objectivges: 
// Create and structure React functional components
// Use props to pass data between components
// Implement component composition and reusability
// Apply Tailwind CSS for responsive styling
// Follow professional Git workflow with meaningful commits
//===========================================================
//Part Two :: Revised Leanring Objectives :: Make the TaskFlow application data persistent across browser sessions using LocalStorage
// 1. Load from localStorage
// 2. Save to localStorage
// 3. Implement a loading state that is active during the initial data load. 

import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Header from "./components/Header";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import Dashboard from "./pages/Dashboard";
import TaskDetailPage from "./pages/TaskDetailPage";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

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
  // STATE INITIALIZATION
  // isLoading = true means "we're currently loading data from localStorage"
  // Start with true so we show loading UI immediately, then flip to false when done
  const [isLoading, setIsLoading] = useState(true);

  // tasks starts EMPTY (not from localStorage!)
  // The useEffect below will populate it AFTER the first render
  // This is because we want to load data as a SIDE EFFECT, not during render
  const [tasks, setTasks] = useState([]);

  // EFFECT 1: LOAD FROM LOCALSTORAGE (Run on Mount Pattern)
  // Pattern 2 from class: useEffect with [] = runs ONCE when component mounts
  //
  // WHY empty array []?
  // - Makes it ACYCLIC (no infinite loop)
  // - Only runs when App first appears (mounts)
  // - Perfect for one-time setup like reading from storage/API
  //
  // TIMELINE: User sees UI → THIS runs → updates state → re-render
  useEffect(() => {
    // SIDE EFFECT: Reading from browser storage (outside React's bubble)
    const saved = localStorage.getItem("tasks");

    if (saved) {
      // Found saved data! Parse JSON string → JS array and update state
      // This triggers a re-render with the loaded data
      setTasks(JSON.parse(saved));
    } else {
      // First time user opens app (nothing in localStorage)
      // Use the default tasks above as starting data
      setTasks(initialTasks);
    }

    // Data is loaded, turn off the loading spinner
    // This triggers another re-render to show the actual app
    setIsLoading(false);
  }, []); // ← EMPTY ARRAY is the key! "Run once on mount only"

  // EFFECT 2: SAVE TO LOCALSTORAGE (Watch State Pattern)
  // Pattern 3 from class: useEffect with [tasks] = runs when tasks changes
  //
  // WHY [tasks, isLoading] in the array?
  // - React watches these values
  // - When EITHER changes, this effect runs
  // - This is how we auto-save whenever user modifies tasks
  //
  // WHY check !isLoading?
  // - First render: tasks=[], isLoading=true
  // - Without this check, we'd save empty [] to localStorage
  // - The check ensures we only save AFTER loading is complete
  useEffect(() => {
    // Don't save during initial load (would overwrite with empty array)
    if (!isLoading) {
      // SIDE EFFECT: Writing to browser storage
      // JSON.stringify converts JS array → string for storage
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoading]); // ← Watch these values, run when they change

  // makes unique-ish IDs even if you delete stuff (no collisions)
  const nextId = useMemo(() => {
    const max = tasks.reduce((acc, t) => Math.max(acc, t.id), 0);
    return max + 1;
  }, [tasks]);


  // EVENT HANDLERS (passed down to child components)

  // Called when user submits the AddTaskForm
  // Creates a new task object and adds it to the tasks array
  function handleAddTask (newTaskData) {
    const newTask = {
      id: nextId,                              
      ...newTaskData,                          // Spread form data (title, description, etc.)
      completed: false,                        // New tasks start incomplete
    };
    // immutablity: read and write only; cant change it 
    // IMMUTABILITY: Don't modify existing array, create new one with spread
    // setTasks(prev => ...) ensures we're using the most recent state
    setTasks((prev) => [...prev, newTask]);
  }

  // Called when user clicks delete button on a task
  // Removes the task by filtering it out of the array
  function handleDeleteTask(taskIdToDelete) {
    // FILTER: Creates new array with only tasks that DON'T match the ID
    // The task with taskIdToDelete gets excluded (removed)
    setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
  }

  // Called when user clicks the checkbox/toggle on a task
  // Flips the completed status: true → false, false → true
  function handleToggleTask(taskIdToToggle) {
    // MAP: Creates new array, updates ONLY the matching task
    // SPREAD: ...t copies all existing properties
    // Then we override just the 'completed' property with !t.completed (flipped value)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskIdToToggle ? { ...t, completed: !t.completed } : t
      )
    );
  }

  // LOADING UI (Conditional Rendering)
  // Early return pattern: if loading, show spinner and exit
  // This prevents the rest of the component from rendering while loading
  //
  // WHY early return?
  // - Cleaner than wrapping everything in {isLoading ? ... : ...}
  // - Makes the flow obvious: loading OR app, never both
  // - Common React pattern for loading states
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          {/* little spinner animation */}
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="text-lg">Loading tasks...</p>
        </div>
      </div>
    );
  }
  // If we reach here, isLoading is false and tasks are loaded
  // Continue to render the actual app below

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index 
        element={<Dashboard 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onDeleteTask={handleDeleteTask} 
            onToggleTask={handleToggleTask} />} />


        <Route path="tasks/:taskId" 
            element={<TaskDetailPage tasks={tasks} />} />

        <Route path="about" element={<About />} />

        <Route path="*" element={<NotFound />} />
      </Route>



    </Routes>
  );
}
