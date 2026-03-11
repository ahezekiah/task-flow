import { Router } from "express";
const router = Router();
import { user as _user } from "../lib/prisma";
import { verifyToken, requireRole } from "../middleware/auth";

router.use(verifyToken);

router.get("/me", async (req, res) => {
  const user = await _user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
});

router.get("/", requireRole("SYSTEM_ADMIN"), async (req, res) => {
  const users = await _user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { createdTasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(users);
});

router.put("/:id/role", requireRole("SYSTEM_ADMIN"), async (req, res) => {
  const { role } = req.body;
  const validRoles = ["PERSONAL", "TEAM_MEMBER", "TEAM_ADMIN", "SYSTEM_ADMIN"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  const user = await _user.update({
    where: { id: parseInt(req.params.id) },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json(user);
});

router.put("/:id/deactivate", requireRole("SYSTEM_ADMIN"), async (req, res) => {
  const user = await _user.update({
    where: { id: parseInt(req.params.id) },
    data: { isActive: false },
    select: { id: true, name: true, email: true, isActive: true },
  });

  res.json(user);
});

export default router;
