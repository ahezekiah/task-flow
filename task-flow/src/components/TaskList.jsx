import TaskCard from "./TaskCard";

export default function TaskList({ tasks, onDeleteTask, onToggleTask }) {
    if (tasks.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-slate-400">
                No tasks available. Add one on the left.
            </div>
        );
    }
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id} //key prop
                    task={task}
                    onDelete={() => onDeleteTask(task.id)}
                    onToggle={() => onToggleTask(task.id)}
                />
            ))}
        </div>
    );

}