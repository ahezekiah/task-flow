const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.get("/", async (req, res) => {
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 50;

  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = memberships.map((m) => m.teamId);

  const [tasks, comments] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { teamId: { in: teamIds } }],
      },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.comment.findMany({
      where: {
        OR: [
          { userId },
          { task: { teamId: { in: teamIds } } },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, teamId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const events = [];

  tasks.forEach((task) => {
    events.push({
      id: `task-created-${task.id}`,
      type: task.teamId ? "team_task" : "task_created",
      task: { id: task.id, title: task.title, teamId: task.teamId },
      user: task.creator,
      date: task.createdAt,
      comment: null,
    });

    if (
      task.status === "DONE" &&
      Math.abs(new Date(task.updatedAt) - new Date(task.createdAt)) > 1000
    ) {
      events.push({
        id: `task-done-${task.id}`,
        type: "task_done",
        task: { id: task.id, title: task.title, teamId: task.teamId },
        user: task.creator,
        date: task.updatedAt,
        comment: null,
      });
    }
  });

  comments.forEach((comment) => {
    events.push({
      id: `comment-${comment.id}`,
      type: "comment",
      task: comment.task,
      user: comment.user,
      date: comment.createdAt,
      comment: { id: comment.id, content: comment.content },
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(events.slice(0, limit));
});

module.exports = router;
