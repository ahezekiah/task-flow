# TaskFlow Pro

A full-stack multi-user task management app built for MTM 320 (Advanced Web Scripting). This was our capstone project — we built it week by week throughout the semester, starting with a basic React CRUD app and turning it into a full role-based collaboration platform with authentication, teams, and a bunch of extra features we added for fun.

## What it does

- Create an account and manage your personal tasks
- Create teams and invite people by email
- Assign tasks to teammates, set priorities and due dates
- Leave comments on tasks
- Kanban board with drag-and-drop (we're pretty proud of this one)
- Calendar view to see what's due when
- Activity feed showing recent actions across all your teams
- Admin dashboard for system admins with analytics, user management, and a full task overview

## Roles

| Role | What they can do |
|---|---|
| Personal | Manage their own tasks only |
| Team Member | View and work on team tasks |
| Team Admin | Manage their team, invite/remove members |
| System Admin | See everything, manage all users |

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** PostgreSQL 15 with Prisma ORM
- **Auth:** JWT (7-day expiry) + bcrypt
- **Drag & Drop:** @dnd-kit
- **Containerization:** Docker + Docker Compose

## Running it locally

### With Docker (easiest)

Make sure Docker is running, then:

```bash
git clone https://github.com/your-repo/task-flow.git
cd task-flow
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). That's it — Docker handles the database, migrations, and everything.

### Without Docker

You'll need Node.js 18+ and PostgreSQL 15 running locally.

**Backend:**
```bash
cd task-flow/server
cp .env.example .env   # fill in your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev
```

**Frontend (separate terminal):**
```bash
cd task-flow
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

Create `task-flow/server/.env`:

```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/taskflow_pro
JWT_SECRET=your-secret-key-here
PORT=5000
```

## Extra Features We Added

We went beyond the base requirements with three creative extensions:

- **Kanban Board** — drag tasks between Todo / In Progress / Done columns using @dnd-kit
- **Calendar View** — month calendar showing tasks by due date, click a day to see what's due
- **Activity Feed** — real-time-ish timeline of everything happening across your tasks and teams

## Team

- **Naomi** — Full-stack (everything lol)
- **Amanda** — Contributed to initial planning, made the foundation of the application & added the file upload portion to the add task
- Project for MTM 320, Advanced Web Scripting
