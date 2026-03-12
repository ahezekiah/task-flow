import { Router } from "express";
const router = Router();
// import { task as _task, team, user as _user } from "../lib/prisma";
import { verifyToken, requireRole } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const _user = prisma.user;
const _task = prisma.task;
const team = prisma.team;

router.use(verifyToken, requireRole("SYSTEM_ADMIN"));

router.get("/analytics", async (req, res) => {
  const [
    totalTasks,
    doneTasks,
    overdueTasks,
    priorityGroups,
    topContributorGroups,
    teams,
  ] = await Promise.all([
    _task.count(),
    _task.count({ where: { status: "DONE" } }),
    _task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { not: "DONE" },
      },
    }),
    _task.groupBy({
      by: ["priority"],
      _count: { _all: true },
    }),
    _task.groupBy({
      by: ["creatorId"],
      where: { status: "DONE" },
      _count: { _all: true },
      orderBy: { _count: { creatorId: "desc" } },
      take: 5,
    }),
    team.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      take: 10,
    }),
  ]);

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const priorityBreakdown = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  priorityGroups.forEach((g) => {
    priorityBreakdown[g.priority] = g._count._all;
  });

  const creatorIds = topContributorGroups.map((g) => g.creatorId);
  const contributorUsers = await _user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true },
  });
  const topContributors = topContributorGroups.map((g) => {
    const user = contributorUsers.find((u) => u.id === g.creatorId);
    return { id: g.creatorId, name: user?.name || "Unknown", doneTasks: g._count._all };
  });

  const teamBreakdown = teams.map((t) => ({
    id: t.id,
    name: t.name,
    total: t._count.tasks,
    done: t.tasks.filter((task) => task.status === "DONE").length,
  }));

  res.json({
    completionRate,
    overdueTasks,
    priorityBreakdown,
    topContributors,
    teamBreakdown,
  });
});

export default router;
