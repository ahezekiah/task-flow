import { Router } from "express";
const router = Router();
// import { teamMember, task as _task, comment as _comment } from "../lib/prisma";
import { verifyToken } from "../middleware/auth.js";

import prisma from "../lib/prisma.js";

const _task = prisma.task;
const _comment = prisma.comment;
const teamMember = prisma.teamMember

router.use(verifyToken);

router.get("/", async (req, res) => {
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 50;

  const memberships = await teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = memberships.map((m) => m.teamId);

  const [tasks, comments] = await Promise.all([
    _task.findMany({
      where: {
        OR: [{ creatorId: userId }, { teamId: { in: teamIds } }],
      },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    _comment.findMany({
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

export default router;
