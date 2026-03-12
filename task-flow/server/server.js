require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");
const teamsRouter = require("./routes/teams");
const activityRouter = require("./routes/activity");
const adminRouter = require("./routes/admin");

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);
app.use("/users", usersRouter);
app.use("/teams", teamsRouter);
app.use("/activity", activityRouter);
app.use("/admin", adminRouter);
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.json({ message: "TaskFlow Pro API", status: "running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
