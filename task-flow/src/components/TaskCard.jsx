function priorityBadge(priority){
    const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

    if(priority === 'High') return `${base} border-rose-500/40 bg-rose-500/10 text-rose-200`;
    if(priority === 'Low') return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-200`;
    return `${base} border-amber-500/40 bg-amber-500/10 text-amber-200`;
}


export default function TaskCard({ task, onDelete, onToggle}){
    return(
        <article className={["rounded-2xl border p-4 shadow-sm transition",
            task.completed ? "border-slate-800 bg-slate-950/30 opacity-80" : "border-slate-800 bg-slate-950/40 hover:border-slate-600",
        ].join(" ")}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className={[ "text-base font-semibold",
                        task.completed ? "line-through text-slate-400" : "text-slate-100",
                    ].join(" ")}>
                        {task.title}
                    </h3>
                    <p className={[ "mt-1 text-sm", 
                        task.completed ? "line-through text-slate-500" : "text-slate-400",
                    ].join(" ")}>
                        {task.description}
                    </p>
                </div>
                <span className={priorityBadge(task.priority)}>
                    {task.priority}
                </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Due:</span>{" "}
                    {task.dueDate}
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm text-slate-200">
                    <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={onToggle} //pass refernce, not call result
                        className="h-4 w-4 accent-slate-100"
                    />
                        Done
                    </label>

                    <button 
                        onClick={onDelete}
                        className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 hover:border-slate-600 hover:text-white"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

