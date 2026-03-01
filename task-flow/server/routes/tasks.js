const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.get("/", async (req, res) => {
  const { teamId } = req.query;

  const where = teamId
    ? { teamId: parseInt(teamId) }
    : { creatorId: req.user.userId, teamId: null };

  const tasks = await prisma.task.findMany({
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
  const task = await prisma.task.findUnique({
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

  const task = await prisma.task.create({
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
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) return res.status(404).json({ message: "Task not found." });

  if (existing.creatorId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN" && req.user.role !== "TEAM_ADMIN") {
    return res.status(403).json({ message: "You can only edit your own tasks." });
  }

  const { title, description, priority, status, dueDate, completed, assigneeId } = req.body;

  const task = await prisma.task.update({
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
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) return res.status(404).json({ message: "Task not found." });

  if (existing.creatorId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN" && req.user.role !== "TEAM_ADMIN") {
    return res.status(403).json({ message: "You can only delete your own tasks." });
  }

  await prisma.task.delete({ where: { id } });
  res.json({ message: "Task deleted." });
});

router.post("/:id/comments", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Comment content is required." });

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: req.user.userId,
      taskId: parseInt(req.params.id),
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json(comment);
});

module.exports = router;
