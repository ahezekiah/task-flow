
function TaskCard({task}){
    return(
        <div>
            <h1>Title: {task.title}</h1>
            <p>Description: {task.description}</p>
            <p>Priority: {task.priority}</p>
            <p>Due Date: {task.dueDate}</p>
            <p>Completed: {task.isCompleted ? "Yes" : "No"}</p>
        </div>
    )
}

export default TaskCard