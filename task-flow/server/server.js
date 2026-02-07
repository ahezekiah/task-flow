const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//some data for our "database"
let tasks = [
    //Update tasks to whatever ^^
    {id: 1, title: "Sketch and art piece", description: "Make a sketch and start basic shading", priority: "low", dueDate: "2026-02-08", completed: false},
    {id: 1, title: "Clean desk", description: "Organize desk, throw away trash, wipe surface", priority: "Medium", dueDate: "2026-02-06", completed: true},
    {id: 1, title: "Update Discord pfp", description: "Change banner and make it a new style", priority: "Low", dueDate: "2026-02-09", completed: false}
];

app.get("/", (req, res) => {
    res.send("API is running!!!");
});

app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`);
});