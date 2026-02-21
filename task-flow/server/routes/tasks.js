const express = require("express");
const router = express.Router();

//GET all the tasks
router.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

//POST 'create' the task
router.post("/api/task", (req, res) => {
    const newT = {

    };
});

//PUT toggle if tasks if completed
router.put("/api/tasks/:id", (req, res) => {

});

//DELETE the task
router.delete("/api/tasks/:id", (req, res) => {

});

module.exports = router;