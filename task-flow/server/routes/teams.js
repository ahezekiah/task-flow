import { Router } from "express";
const router = Router();
import { verifyToken, requireRole } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const _user = prisma.user;
const _team = prisma.team;
const teamMember = prisma.teamMember

router.use(verifyToken);

router.get("/", async (req, res) => {
  const memberships = await teamMember.findMany({
    where: { userId: req.user.userId },
    include: {
      team: {
        include: {
          admin: { select: { id: true, name: true } },
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
  });

  const adminTeams = await _team.findMany({
    where: { adminId: req.user.userId },
    include: {
      admin: { select: { id: true, name: true } },
      _count: { select: { members: true, tasks: true } },
    },
  });

  const memberTeams = memberships.map((m) => m.team);
  const allTeams = [...new Map([...adminTeams, ...memberTeams].map((t) => [t.id, t])).values()];

  res.json(allTeams);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Team name is required." });

  const team = await _team.create({
    data: {
      name,
      adminId: req.user.userId,
    },
    include: {
      admin: { select: { id: true, name: true } },
      _count: { select: { members: true, tasks: true } },
    },
  });

  await _user.update({
    where: { id: req.user.userId },
    data: { role: "TEAM_ADMIN" },
  });

  res.status(201).json(team);
});

router.get("/:id/members", async (req, res) => {
  const teamId = parseInt(req.params.id);
  const members = await teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  res.json(members.map((m) => m.user));
});

router.post("/:id/invite", async (req, res) => {
  const teamId = parseInt(req.params.id);
  const { email } = req.body;

  const team = await _team.findUnique({ where: { id: teamId } });
  if (!team) return res.status(404).json({ message: "Team not found." });
  if (team.adminId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN") {
    return res.status(403).json({ message: "Only the team admin can invite members." });
  }

  const invitee = await _user.findUnique({ where: { email } });
  if (!invitee) return res.status(404).json({ message: "No user found with that email." });

  const existing = await teamMember.findUnique({
    where: { userId_teamId: { userId: invitee.id, teamId } },
  });
  if (existing) return res.status(409).json({ message: "User is already in this team." });

  await teamMember.create({ data: { userId: invitee.id, teamId } });

  if (invitee.role === "PERSONAL") {
    await _user.update({ where: { id: invitee.id }, data: { role: "TEAM_MEMBER" } });
  }

  res.status(201).json({ message: `${invitee.name} added to the team.` });
});

router.delete("/:id/members/:userId", async (req, res) => {
  const teamId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);

  const team = await _team.findUnique({ where: { id: teamId } });
  if (!team) return res.status(404).json({ message: "Team not found." });
  if (team.adminId !== req.user.userId && req.user.role !== "SYSTEM_ADMIN") {
    return res.status(403).json({ message: "Only the team admin can remove members." });
  }

  await teamMember.delete({
    where: { userId_teamId: { userId, teamId } },
  });

  res.json({ message: "Member removed from team." });
});

export default router;
