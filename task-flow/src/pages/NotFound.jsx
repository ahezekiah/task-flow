import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="p-10 text-center">
            <h1 className="text-4xl font-semibold">
                404 - Page Not Found

                <Link to="/" className="ml-4 text-blue-500 hover:underline">Go Back Home</Link>
            </h1>
        </div>
    )
};