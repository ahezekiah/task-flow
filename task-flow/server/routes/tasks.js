import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();
const taskModel = prisma.task;
const commentModel = prisma.comment;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads");

mkdirSync(uploadsDir, { recursive: true });

const validPriorities = new Set(["LOW", "MEDIUM", "HIGH"]);
const validStatuses = new Set(["TODO", "IN_PROGRESS", "DONE"]);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function canAccessTask(user, task) {
  if (
    user.role === "SYSTEM_ADMIN" ||
    task.creatorId === user.userId
  ) {
    return true;
  }

  if (!task.teamId) {
    return false;
  }

  const team = await prisma.team.findFirst({
    where: {
      id: task.teamId,
      OR: [
        { adminId: user.userId },
        {
          members: {
            some: {
              userId: user.userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(team);
}

async function canManageTask(user, task) {
  if (
    user.role === "SYSTEM_ADMIN" ||
    task.creatorId === user.userId
  ) {
    return true;
  }

  if (!task.teamId) {
    return false;
  }

  const team = await prisma.team.findFirst({
    where: {
      id: task.teamId,
      adminId: user.userId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(team);
}

router.use(verifyToken);

// Get personal, team, or all admin tasks
router.get("/", async (req, res) => {
  const { teamId } = req.query;

  const isAdminAll =
    req.query.all === "true" &&
    req.user.role === "SYSTEM_ADMIN";

  let where;

  if (isAdminAll) {
    where = {};
  } else if (teamId !== undefined) {
    const parsedTeamId = parseId(teamId);

    if (!parsedTeamId) {
      return res.status(400).json({
        message: "Invalid team id.",
      });
    }

    const team = await prisma.team.findFirst({
      where: {
        id: parsedTeamId,
        OR: [
          { adminId: req.user.userId },
          {
            members: {
              some: {
                userId: req.user.userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!team && req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({
        message: "You do not have access to this team.",
      });
    }

    where = {
      teamId: parsedTeamId,
    };
  } else {
    where = {
      creatorId: req.user.userId,
      teamId: null,
    };
  }

  const tasks = await taskModel.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(tasks);
});

// Get one task
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "Invalid task id.",
    });
  }

  const task = await taskModel.findUnique({
    where: {
      id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  if (!(await canAccessTask(req.user, task))) {
    return res.status(403).json({
      message: "You do not have access to this task.",
    });
  }

  res.json(task);
});

// Create task
router.post("/", async (req, res) => {
  const {
    title,
    description,
    priority,
    status,
    dueDate,
    teamId,
    assigneeId,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({
      message: "Title is required.",
    });
  }

  if (priority && !validPriorities.has(priority)) {
    return res.status(400).json({
      message: "Invalid task priority.",
    });
  }

  if (status && !validStatuses.has(status)) {
    return res.status(400).json({
      message: "Invalid task status.",
    });
  }

  const parsedTeamId = teamId ? parseId(teamId) : null;
  const parsedAssigneeId = assigneeId
    ? parseId(assigneeId)
    : null;

  if (teamId && !parsedTeamId) {
    return res.status(400).json({
      message: "Invalid team id.",
    });
  }

  if (assigneeId && !parsedAssigneeId) {
    return res.status(400).json({
      message: "Invalid assignee id.",
    });
  }

  if (parsedTeamId) {
    const team = await prisma.team.findFirst({
      where: {
        id: parsedTeamId,
        OR: [
          { adminId: req.user.userId },
          {
            members: {
              some: {
                userId: req.user.userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!team && req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({
        message: "You do not have access to this team.",
      });
    }

    if (parsedAssigneeId) {
      const assigneeAllowed =
        await prisma.team.findFirst({
          where: {
            id: parsedTeamId,
            OR: [
              { adminId: parsedAssigneeId },
              {
                members: {
                  some: {
                    userId: parsedAssigneeId,
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
        });

      if (!assigneeAllowed) {
        return res.status(400).json({
          message:
            "Assignee is not a member of this team.",
        });
      }
    }
  } else if (
    parsedAssigneeId &&
    parsedAssigneeId !== req.user.userId
  ) {
    return res.status(400).json({
      message:
        "Personal tasks can only be assigned to you.",
    });
  }

  const task = await taskModel.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || "MEDIUM",
      status: status || "TODO",
      completed: status === "DONE",
      dueDate: dueDate ? new Date(dueDate) : null,
      creatorId: req.user.userId,
      teamId: parsedTeamId,
      assigneeId: parsedAssigneeId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(task);
});

// Update task
router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "Invalid task id.",
    });
  }

  const existing = await taskModel.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  if (!(await canManageTask(req.user, existing))) {
    return res.status(403).json({
      message: "You can only edit tasks you manage.",
    });
  }

  const {
    title,
    description,
    priority,
    status,
    dueDate,
    completed,
    assigneeId,
  } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({
      message: "Title is required.",
    });
  }

  if (
    priority !== undefined &&
    !validPriorities.has(priority)
  ) {
    return res.status(400).json({
      message: "Invalid task priority.",
    });
  }

  if (
    status !== undefined &&
    !validStatuses.has(status)
  ) {
    return res.status(400).json({
      message: "Invalid task status.",
    });
  }

  const nextStatus =
    status ??
    (completed === true
      ? "DONE"
      : completed === false &&
        existing.status === "DONE"
        ? "TODO"
        : undefined);

  const nextCompleted =
    completed ??
    (status !== undefined
      ? status === "DONE"
      : undefined);

  const task = await taskModel.update({
    where: {
      id,
    },
    data: {
      ...(title !== undefined && {
        title: title.trim(),
      }),
      ...(description !== undefined && {
        description: description?.trim() || null,
      }),
      ...(priority !== undefined && {
        priority,
      }),
      ...(nextStatus !== undefined && {
        status: nextStatus,
      }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(nextCompleted !== undefined && {
        completed: nextCompleted,
      }),
      ...(assigneeId !== undefined && {
        assigneeId: assigneeId
          ? parseId(assigneeId)
          : null,
      }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "Invalid task id.",
    });
  }

  const existing = await taskModel.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  if (!(await canManageTask(req.user, existing))) {
    return res.status(403).json({
      message: "You can only delete tasks you manage.",
    });
  }

  await taskModel.delete({
    where: {
      id,
    },
  });

  res.json({
    message: "Task deleted.",
  });
});

// Add comment
router.post("/:id/comments", async (req, res) => {
  const { content } = req.body;
  const taskId = parseId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      message: "Invalid task id.",
    });
  }

  if (!content?.trim()) {
    return res.status(400).json({
      message: "Comment content is required.",
    });
  }

  const task = await taskModel.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  if (!(await canAccessTask(req.user, task))) {
    return res.status(403).json({
      message: "You do not have access to this task.",
    });
  }

  const comment = await commentModel.create({
    data: {
      content: content.trim(),
      userId: req.user.userId,
      taskId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(comment);
});

// Attachment setup
const storage = multer.diskStorage({
  destination: uploadsDir,

  filename(req, file, callback) {
    const safeFilename = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

    callback(null, `${Date.now()}-${safeFilename}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Upload task attachment
router.post(
  "/:id/attachment",
  upload.single("file"),
  async (req, res) => {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid task id.",
      });
    }

    const existing = await taskModel.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    if (!(await canManageTask(req.user, existing))) {
      return res.status(403).json({
        message:
          "You can only attach files to tasks you manage.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No attachment provided.",
      });
    }

    const attachmentPath = `uploads/${req.file.filename}`;

    const task = await taskModel.update({
      where: {
        id,
      },
      data: {
        attachment: attachmentPath,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(task);
  }
);

export default router;