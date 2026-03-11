import dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(json());

import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";
import usersRouter from "./routes/users.js";
import teamsRouter from "./routes/teams.js";

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);
app.use("/users", usersRouter);
app.use("/teams", teamsRouter);
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
