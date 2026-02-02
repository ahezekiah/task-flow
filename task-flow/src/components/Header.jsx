import { Link } from "react-router-dom";

export default function Header(){
    return(
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-950 font-black">
                        TF
                    </div>
                    <div>
                        <h1 className="text-base font-semibold leading-tight">Task Flow</h1>
                        <p className="text-xs text-slate-400">React Fundamentals Build</p>
                    </div>
                </div>
                <nav className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                    <Link to="/about" className="rounded-full border border-slate-800 px-3 py-1 hover:bg-slate-800/30">
                        About
                    </Link>
                    <span className="rounded-full border border-slate-800 px-3 py-1">
                        Components
                    </span>
                    <span className="rounded-full border border-slate-800 px-3 py-1">
                        Props
                    </span>
                    <span className="rounded-full border border-slate-800 px-3 py-1">
                        State
                    </span>
                </nav>
            </div>
        </header>
    );
}