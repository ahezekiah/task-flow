const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");

app.use(cors());
app.use(express.json());

app.use("/tasks", tasksRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
    res.send("API is running!!!");
});

app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`);
});
