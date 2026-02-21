const express = require("express");
const router = express.Router();

//some hardcoded data for our "database"
let tasks = [
    //Update tasks to whatever ^^
    {id: 1, title: "Sketch and art piece", description: "Make a sketch and start basic shading", priority: "low", dueDate: "2026-02-08", completed: false},
    {id: 1, title: "Clean desk", description: "Organize desk, throw away trash, wipe surface", priority: "Medium", dueDate: "2026-02-06", completed: true},
    {id: 1, title: "Update Discord pfp", description: "Change banner and make it a new style", priority: "Low", dueDate: "2026-02-09", completed: false}
];

//GET all the tasks
router.get("/", (req, res) => {
    res.json(tasks);
});

//POST 'create' the task
router.post("/", (req, res) => {
    const newT = {

    };
});

//PUT toggle if tasks if completed
router.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    if(!task){
        return res.status(404).json({ message: "This task was not found" });
    }
    task.completed = !task.completed;
    res.json(task);
});

//DELETE the task
router.delete("/tasks/:id", (req, res) => {
    
});

module.exports = router;