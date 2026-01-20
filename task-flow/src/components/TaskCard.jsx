function priorityBadge(priority){
    const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

    if(priority === 'High') return `${base} border-rose-500/40 bg-rose-500/10 text-rose-200`;
    if(priority === 'Low') return `${base} border-emerald-500/40 bg-emerald-500/10 text-emearald-200`;
    return `${base} border-amber-500/40 bg-amber-500/10 text-amber-200`;
}


export default function TaskCard({ task, onDelete, onToggle}){
    return(
        <article className={["rounded-2xl border p-4 shadow-sm transition",
            task.completed ? "border-slate-800 bg-slate-950/30 opacity-80" : "border-slate-800 bg-slate-950/40 hover:border-slate-600",
        ].join(" ")}>

        </article>
    );
}

