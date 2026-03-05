import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { GlassBadge } from "../components/ui/GlassBadge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), outside: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), outside: true });
  }

  return cells;
}

export default function CalendarPage() {
  const toast = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get("/tasks")
      .then(setTasks)
      .catch(() => toast("Failed to load tasks", "error"))
      .finally(() => setLoading(false));
  }, []);

  const tasksWithDueDate = useMemo(
    () => tasks.filter((t) => t.dueDate),
    [tasks]
  );

  function tasksForDay(date) {
    return tasksWithDueDate.filter((t) => isSameDay(new Date(t.dueDate), date));
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelected(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelected(null);
  }

  const cells = useMemo(() => buildCalendarDays(year, month), [year, month]);
  const selectedTasks = selected ? tasksForDay(selected) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Calendar
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Tasks with due dates
        </p>
      </div>

      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", cursor: "pointer" }}
          >
            ←
          </button>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", cursor: "pointer" }}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {DAYS.map((d) => (
            <div key={d} className="text-center pb-2">
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{d}</span>
            </div>
          ))}

          {cells.map((cell, i) => {
            const dayTasks = tasksForDay(cell.date);
            const isToday = isSameDay(cell.date, today);
            const isSelected = selected && isSameDay(cell.date, selected);

            return (
              <motion.button
                key={i}
                onClick={() => setSelected(isSelected ? null : cell.date)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-lg p-1.5 flex flex-col items-center gap-1 min-h-12 transition-colors"
                style={{
                  background: isSelected
                    ? "rgba(255,255,255,0.1)"
                    : isToday
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                  border: isSelected
                    ? "1px solid rgba(255,255,255,0.2)"
                    : isToday
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  opacity: cell.outside ? 0.25 : 1,
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: isToday ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {cell.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: t.priority === "HIGH"
                            ? "rgba(255,255,255,0.7)"
                            : t.priority === "MEDIUM"
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex flex-col gap-3"
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>

            {selectedTasks.length === 0 ? (
              <div className="glass-card p-5 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No tasks due on this day.</p>
              </div>
            ) : (
              selectedTasks.map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    className="glass-card glass-card-hover p-4 flex items-center justify-between gap-4"
                    whileHover={{ y: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color: "var(--text-primary)",
                          textDecoration: task.status === "DONE" ? "line-through" : "none",
                          opacity: task.status === "DONE" ? 0.5 : 1,
                        }}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <GlassBadge type={task.priority?.toLowerCase()} />
                      <GlassBadge type={task.status?.toLowerCase().replace("_", "-")} />
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
