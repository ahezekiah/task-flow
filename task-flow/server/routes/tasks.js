import { Router } from "express";
const router = Router();
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

import prisma from "../lib/prisma.js";

const _task = prisma.task;
const _comment = prisma.comment;

router.use(verifyToken);

router.get("/", async (req, res) => {
  const { teamId } = req.query;

  const isAdminAll = req.query.all === "true" && req.user.role === "SYSTEM_ADMIN";

  const where = isAdminAll
    ? {}
    : teamId
    ? { teamId: parseInt(teamId) }
    : { creatorId: req.user.userId, teamId: null };

  const tasks = await _task.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
});

router.get("/:id", async (req, res) => {
  const task = await _task.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) return res.status(404).json({ message: "Task not found." });

  res.json(task);
});

router.post("/", async (req, res) => {
  const { title, description, priority, status, dueDate, teamId, assigneeId } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  const task = await _task.create({
    data: {
      title,
      description: description || null,
      priority: priority || "MEDIUM",
      status: status || "TODO",
      dueDate: dueDate ? new Date(dueDate) : null,
      creatorId: req.user.userId,
      teamId: teamId ? parseInt(teamId) : null,
      assigneeId: assigneeId ? parseInt(assigneeId) : null,
    },
    include: {
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await _task.findUnique({ where: { id } });

  if (!existing) return res.status(404).json({ message: "Task not found." });

  if (existing.creatorId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN" && req.user.role !== "TEAM_ADMIN") {
    return res.status(403).json({ message: "You can only edit your own tasks." });
  }

  const { title, description, priority, status, dueDate, completed, assigneeId } = req.body;

  const task = await _task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(completed !== undefined && { completed }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null }),
    },
    include: {
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await _task.findUnique({ where: { id } });

  if (!existing) return res.status(404).json({ message: "Task not found." });

  if (existing.creatorId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN" && req.user.role !== "TEAM_ADMIN") {
    return res.status(403).json({ message: "You can only delete your own tasks." });
  }

  await _task.delete({ where: { id } });
  res.json({ message: "Task deleted." });
});

router.post("/:id/comments", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Comment content is required." });

  const comment = await _comment.create({
    data: {
      content,
      userId: req.user.userId,
      taskId: parseInt(req.params.id),
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json(comment);
});


// BONUS: File Attachments: Let users attach files or images to tasks.
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

router.post("/:id/attachment", upload.single("file"), async (req, res) => {
  const id = parseInt(req.params.id);

  if (!req.file) {
    return res.json({ message: "No attachment provided." });
  }

  const attachmentPath = `uploads/${req.file.filename}`;

  const task = await _task.update({
    where: { id },
    data: {
      attachment: attachmentPath,
    },
    include: {
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  res.json(task);
});

export default router;
