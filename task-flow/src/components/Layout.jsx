import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout(){
    return(
        <>
        <div>
            <Header />
            <main className="p-6">
                <Outlet />
            </main>
        </div>
        </>
    )
}