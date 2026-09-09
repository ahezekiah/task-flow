import "dotenv/config";
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";
import usersRouter from "./routes/users.js";
import teamsRouter from "./routes/teams.js";
import activityRouter from "./routes/activity.js";
import adminRouter from "./routes/admin.js";

const app = express();

const PORT = process.env.PORT || 5050;

const allowedOrigins = [
  "http://localhost:5173",
  'https://task-flow-nine-liard.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);
app.use("/users", usersRouter);
app.use("/teams", teamsRouter);
app.use("/activity", activityRouter);
app.use("/admin", adminRouter);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow Pro API",
    status: "running"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "Something went wrong on the server."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});