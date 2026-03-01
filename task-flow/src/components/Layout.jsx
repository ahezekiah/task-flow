import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
