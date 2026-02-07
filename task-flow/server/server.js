const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//some hardcoded data for our "database"
let tasks = [
    //Update tasks to whatever ^^
    {id: 1, title: "Sketch and art piece", description: "Make a sketch and start basic shading", priority: "low", dueDate: "2026-02-08", completed: false},
    {id: 1, title: "Clean desk", description: "Organize desk, throw away trash, wipe surface", priority: "Medium", dueDate: "2026-02-06", completed: true},
    {id: 1, title: "Update Discord pfp", description: "Change banner and make it a new style", priority: "Low", dueDate: "2026-02-09", completed: false}
];

//GET all the tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

//POST 'create' the task
app.post("/api/task", (req, res) => {
    const newT = {

    };
});

//PUT toggle if tasks if completed
app.put("/api/tasks/:id", (req, res) => {

});

//DELETE the task
app.delete("/api/tasks/:id", (req, res) => {

});

app.get("/", (req, res) => {
    res.send("API is running!!!");
});

app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`);
});
