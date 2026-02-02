import { useParams, Link } from 'react-router-dom';

export default function TaskDetailPage({ tasks }) {
    const { taskId } = useParams();

    const task = tasks.find((t) => t.id === parseInt(taskId));

    if (!task) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold">Task not found</h2>
                <Link to="/" className="text-blue-500 hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <>
            <div className="p-6">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <p className="mt-2 text-gray-600">{task.description}</p>

                <p className='mt-4'>
                    Status:{" "}
                    <span className='font-semibold'>
                        {task.completed ? "Completed" : "In Progress"}
                    </span>
                </p>
                
                <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">Back to Dashboard</Link>
            </div>
        </>
    )
};