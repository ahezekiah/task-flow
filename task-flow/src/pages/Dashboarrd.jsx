import AddTaskForm from "../components/AddTaskForm";
import TaskList from "../components/TaskList";

export default function Dashboard({ tasks, addTask, toggleTask }){
    return(
        <>
            <div>
                <AddTaskForm onAddTask={addTask} />
                <TaskList tasks={tasks} onToggleTask={toggleTask} />
            </div>
        </>
    )
}