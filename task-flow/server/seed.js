import "dotenv/config";

// require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import { hash as _hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw) => _hash(pw, 10);

  const [naomi, amanda, marcus, sofia, jordan, riley] = await Promise.all([
    prisma.user.create({ data: { name: "Naomi Vazquez", email: "nv@email.com", password: await hash("password123"), role: "SYSTEM_ADMIN" } }),
    prisma.user.create({ data: { name: "Amanda Chen", email: "amanda@email.com", password: await hash("password123"), role: "TEAM_ADMIN" } }),
    prisma.user.create({ data: { name: "Marcus Rivera", email: "marcus@email.com", password: await hash("password123"), role: "TEAM_MEMBER" } }),
    prisma.user.create({ data: { name: "Sofia Park", email: "sofia@email.com", password: await hash("password123"), role: "TEAM_MEMBER" } }),
    prisma.user.create({ data: { name: "Jordan Lee", email: "jordan@email.com", password: await hash("password123"), role: "PERSONAL" } }),
    prisma.user.create({ data: { name: "Riley Torres", email: "riley@email.com", password: await hash("password123"), role: "TEAM_MEMBER", isActive: false } }),
  ]);

  const designTeam = await prisma.team.create({ data: { name: "Design Squad", adminId: amanda.id } });
  const devTeam = await prisma.team.create({ data: { name: "Dev Team", adminId: naomi.id } });

  await prisma.teamMember.createMany({
    data: [
      { userId: amanda.id, teamId: designTeam.id },
      { userId: marcus.id, teamId: designTeam.id },
      { userId: sofia.id, teamId: designTeam.id },
      { userId: naomi.id, teamId: devTeam.id },
      { userId: marcus.id, teamId: devTeam.id },
      { userId: jordan.id, teamId: devTeam.id },
    ],
  });

  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86400000);
  const daysFromNow = (n) => new Date(+now + n * 86400000);

  const tasks = await prisma.task.createMany({
    data: [
      { title: "Design onboarding flow", description: "Create wireframes for the new user onboarding experience", status: "DONE", priority: "HIGH", completed: true, creatorId: amanda.id, assigneeId: marcus.id, teamId: designTeam.id, dueDate: daysAgo(5) },
      { title: "Component library audit", description: "Review all UI components for consistency", status: "DONE", priority: "MEDIUM", completed: true, creatorId: amanda.id, assigneeId: sofia.id, teamId: designTeam.id, dueDate: daysAgo(3) },
      { title: "Mobile nav redesign", description: "Redesign bottom navigation for mobile screens", status: "DONE", priority: "HIGH", completed: true, creatorId: marcus.id, teamId: designTeam.id, dueDate: daysAgo(2) },
      { title: "Dark mode token update", description: "Update color tokens for dark mode consistency", status: "IN_PROGRESS", priority: "MEDIUM", creatorId: sofia.id, assigneeId: sofia.id, teamId: designTeam.id, dueDate: daysFromNow(2) },
      { title: "Accessibility review", description: "Run WCAG 2.1 audit on all screens", status: "IN_PROGRESS", priority: "HIGH", creatorId: amanda.id, assigneeId: marcus.id, teamId: designTeam.id, dueDate: daysAgo(1) },
      { title: "Icon set finalization", description: "Pick and export final icon set from Figma", status: "TODO", priority: "LOW", creatorId: marcus.id, teamId: designTeam.id, dueDate: daysFromNow(5) },
      { title: "Landing page redesign", description: "Full redesign of the marketing landing page", status: "TODO", priority: "HIGH", creatorId: amanda.id, assigneeId: sofia.id, teamId: designTeam.id, dueDate: daysAgo(2) },

      { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated deploys", status: "DONE", priority: "HIGH", completed: true, creatorId: naomi.id, assigneeId: naomi.id, teamId: devTeam.id, dueDate: daysAgo(7) },
      { title: "API rate limiting", description: "Add rate limiting middleware to all public endpoints", status: "DONE", priority: "HIGH", completed: true, creatorId: naomi.id, assigneeId: marcus.id, teamId: devTeam.id, dueDate: daysAgo(4) },
      { title: "Database indexing", description: "Add indexes to frequently queried columns", status: "DONE", priority: "MEDIUM", completed: true, creatorId: marcus.id, teamId: devTeam.id, dueDate: daysAgo(3) },
      { title: "Write API documentation", description: "Document all REST endpoints with examples", status: "IN_PROGRESS", priority: "MEDIUM", creatorId: naomi.id, assigneeId: jordan.id, teamId: devTeam.id, dueDate: daysFromNow(3) },
      { title: "Fix auth token refresh", description: "Token refresh logic breaks on concurrent requests", status: "IN_PROGRESS", priority: "HIGH", creatorId: naomi.id, assigneeId: naomi.id, teamId: devTeam.id, dueDate: daysAgo(1) },
      { title: "Add pagination to tasks endpoint", description: "Implement cursor-based pagination", status: "TODO", priority: "MEDIUM", creatorId: marcus.id, teamId: devTeam.id, dueDate: daysFromNow(4) },
      { title: "Email notification service", description: "Set up transactional email with Resend", status: "TODO", priority: "LOW", creatorId: naomi.id, teamId: devTeam.id, dueDate: daysFromNow(10) },
      { title: "Load testing", description: "Run k6 load tests against staging environment", status: "TODO", priority: "HIGH", creatorId: jordan.id, teamId: devTeam.id, dueDate: daysAgo(3) },

      { title: "Update portfolio site", description: "Add TaskFlow Pro to projects section", status: "DONE", priority: "MEDIUM", completed: true, creatorId: naomi.id, dueDate: daysAgo(6) },
      { title: "Record demo video", description: "Record a walkthrough for the capstone submission", status: "IN_PROGRESS", priority: "HIGH", creatorId: naomi.id, dueDate: daysFromNow(1) },
      { title: "Write project README", description: "Document setup instructions and tech stack", status: "TODO", priority: "MEDIUM", creatorId: naomi.id, dueDate: daysFromNow(2) },

      { title: "Research competitors", description: "Analyze Todoist, Linear, and Asana feature sets", status: "DONE", priority: "LOW", completed: true, creatorId: jordan.id, dueDate: daysAgo(8) },
      { title: "Plan Q2 roadmap", description: "Draft feature priorities for next quarter", status: "TODO", priority: "HIGH", creatorId: jordan.id, dueDate: daysFromNow(7) },
    ],
  });

  const allTasks = await prisma.task.findMany({ orderBy: { id: "asc" } });
  const t = (i) => allTasks[i].id;

  await prisma.comment.createMany({
    data: [
      { content: "Wireframes are approved, moving to high-fi.", userId: amanda.id, taskId: t(0) },
      { content: "Handoff to dev ready by EOD.", userId: marcus.id, taskId: t(0) },
      { content: "Found 3 components that need updates.", userId: sofia.id, taskId: t(1) },
      { content: "Token mapping doc shared in Figma.", userId: sofia.id, taskId: t(3) },
      { content: "Starting with the nav and modal components first.", userId: marcus.id, taskId: t(4) },
      { content: "Pipeline running green on all branches.", userId: naomi.id, taskId: t(7) },
      { content: "Rate limit set to 100 req/min per IP.", userId: marcus.id, taskId: t(8) },
    ],
  });

  console.log("Seeded: 6 users, 2 teams, 20 tasks, 7 comments");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
