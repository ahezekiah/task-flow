import { Router } from "express";
const router = Router();
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { user as _user } from "../lib/prisma.js";

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existing = await _user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const hashed = await hash(password, 10);

  const user = await _user.create({
    data: { email, password: hashed, name },
  });

  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await _user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
