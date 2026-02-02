import AddTaskForm from "../components/AddTaskForm";
import TaskList from "../components/TaskList";

export default function Dashboard({ tasks, onAddTask, onDeleteTask, onToggleTask }) {
    return(
        <>
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Add New Task</h2>
                <p className="mt-1 text-sm text-slate-400">
                Keep it simeple: Title, Description, Priority, & Due Date.
                </p>
                <div className="mt-4">
                <AddTaskForm onAddTask={onAddTask} />
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
                    onDeleteTask={onDeleteTask} 
                    onToggleTask={onToggleTask} 
                />
                </div>
            </section>
        </div>
        </>
    )
}