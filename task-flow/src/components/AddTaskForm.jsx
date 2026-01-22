//note to self:
//how to: prevent refresh on form submit?
//disable linting for this file?


import { useState } from "react";

const PRIORITIES = ["Low", "Medium", "High"];

export default function AddTaskForm({ onAddTask }){
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(PRIORITIES[0]);
    const [dueDate, setDueDate] = useState("");

    function handleSubmit(e) {
        e.preventDefault(); // preventing refresh

        if (!title.trim()) return;

        onAddTask({
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate,
        });

        setTitle("");
        setDescription("");
        setPriority(PRIORITIES[0]);
        setDueDate("");
    }
    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
                <span className="text-sm text-slate-300">Title</span>
                <input value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Finish TaskFlow UI"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-500"
                />
            </label>

            <label className="block">
                <span className="text-sm text-slate-300">Description</span>
                <textarea value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What needs to happen?"
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-500"
                />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-300">Priority</span>
                        <select value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                        >
                            {PRIORITIES.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                </label>

                <label className="block">
                    <span className="text-sm text-slate-300">Due Date</span>
                        <input type="date" value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                        />
                </label>
            </div>
            
            <button type="submit"
                className="w-full rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-950 hover:bg-white active:scale-[0.99]">
                    Add Task
                </button>
        </form>
    )
}
