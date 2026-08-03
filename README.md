# Task Management App

A full-stack team task management application. Authenticated users can create
projects, invite members, and manage tasks on a drag-and-drop Kanban board.

Built as part of a Full Stack Node.js technical assessment.

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Backend     | Node.js, Express.js                             |
| Database    | PostgreSQL (via Docker), Prisma ORM             |
| Auth        | JWT + bcrypt password hashing                   |
| Frontend    | React (Vite), Tailwind CSS, React Router, Axios |
| Drag & Drop | @dnd-kit                                        |
| Testing     | Jest + Supertest (integration tests)            |
| API Docs    | OpenAPI 3.0 (Swagger UI)                        |

---

## Project Structure

```
task-management-app/
├── Backend/
│   ├── src/
│   │   ├── config/         # env loader, Prisma client instance
│   │   ├── controllers/    # request handlers
│   │   ├── services/       # business logic (talks to Prisma)
│   │   ├── routes/         # Express route definitions
│   │   ├── middlewares/    # auth, project-membership, error handler
│   │   ├── utils/          # AppError, password hashing, JWT helpers
│   │   └── app.js          # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   │   └── api.test.js     # integration tests
│   ├── prisma.config.mjs
│   ├── docker-compose.yml  # PostgreSQL container
│   ├── server.js
│   └── .env.example
└── Frontend/
    ├── src/
    │   ├── api/             # axios instance + interceptor
    │   ├── services/        # per-resource API call functions
    │   ├── context/          # AuthContext (global auth state)
    │   ├── hooks/            # useAuth
    │   ├── components/       # reusable UI (modals, Kanban pieces)
    │   ├── pages/             # route-level pages
    │   └── App.jsx
    └── .env.example
```

---

## Prerequisites

- Node.js 18+
- Docker Desktop (for PostgreSQL)
- npm

---

## Backend Setup

```bash
cd Backend
npm install
```

### 1. Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable                              | Description                                             | Example                                                              |
| ------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| `PORT`                                | Port the API server listens on                          | `3035`                                                               |
| `NODE_ENV`                            | `development` or `production`                           | `development`                                                        |
| `JWT_SECRET`                          | Secret used to sign JWTs — must be a long random string | (generate below)                                                     |
| `JWT_EXPIRES_IN`                      | Token lifetime                                          | `7d`                                                                 |
| `DATABASE_URL`                        | PostgreSQL connection string                            | `postgresql://postgres:PASSWORD@localhost:5433/taskdb?schema=public` |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Used by `docker-compose.yml`                            | —                                                                    |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Start the database (Docker)

```bash
docker compose up -d
docker ps   # confirm the container is Up
```

> If port `5432` is already in use on your machine, the compose file maps the
> container to host port `5433` instead — make sure `DATABASE_URL` uses the
> same port.

### 3. Run migrations

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
```

This creates the `User`, `Project`, `ProjectMember`, and `Task` tables and
generates the Prisma Client into `src/generated/prisma`.

### 4. Create an Admin account (seed)

Registration always creates a `MEMBER` (this is intentional — it prevents
users from granting themselves elevated privileges via the public register
endpoint). To create the first `ADMIN`:

1. Register a normal account via `POST /api/auth/register`.
2. Promote it to Admin directly in the database:
   ```bash
   npx prisma studio
   ```
   Open the `User` table, find the account, and change its `role` field from
   `MEMBER` to `ADMIN`.

### 5. Start the server

```bash
npm run dev
```

The API is now running at `http://localhost:3035/api`.

### 6. Run the automated tests

```bash
npm test
```

Runs the Jest + Supertest integration test suite (8 tests covering
register/login, project CRUD, and task CRUD + filtering) against your
configured `DATABASE_URL`. Tests run `--runInBand` (sequential) since they
share state (a project/task created in one test is used by the next) and
clean up after themselves in `afterAll`.

### 7. API Documentation

With the server running, open:

```
http://localhost:3035/api-docs
```

This serves the OpenAPI/Swagger UI, generated from `src/swagger.yaml`,
documenting every endpoint, request body, and response shape.

---

## Frontend Setup

```bash
cd Frontend
npm install
```

### 1. Environment variables

```bash
cp .env.example .env
```

| Variable           | Description                         | Example                     |
| ------------------ | ----------------------------------- | --------------------------- |
| `VITE_BACKEND_URL` | Base URL of the running Backend API | `http://localhost:3035/api` |

> Vite only exposes environment variables to the browser if they're prefixed
> with `VITE_`.

### 2. Start the dev server

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

---

## Test Credentials

After following the seed steps above, you'll have:

| Role   | How to get one                                                       |
| ------ | -------------------------------------------------------------------- |
| Member | Register normally via the app's Register page                        |
| Admin  | Register normally, then promote via Prisma Studio (see step 4 above) |

There are no hardcoded demo accounts — every environment starts empty by
design, and accounts are created through the real registration flow.

---

## Architecture Notes

- **Authentication**: JWT-based. On login, the server signs a token
  containing `{ userId, role }`. The `authenticate` middleware verifies the
  token on every protected route and attaches `req.user`.
- **Authorization**: Layered per-resource. A `checkProjectMembership`
  middleware verifies the requester belongs to the project before any task
  operation runs. Update/delete of projects and tasks additionally check
  ownership/role (see the API docs for the exact rule per endpoint).
- **Error handling**: Centralized via an `AppError` class (carries an HTTP
  status code) and a single Express error-handling middleware. Known Prisma
  error codes (`P2002`, `P2025`, `P2023`) are translated into meaningful
  messages instead of leaking raw database errors.
- **Data cleanup on delete**: Deleting a project removes its tasks and
  memberships first (in a `$transaction`) to avoid foreign-key constraint
  errors.
- **Frontend state**: Global auth state lives in React Context
  (`AuthContext`); project/task data is fetched per-page and kept in local
  component state — no Redux, since the app's shared state surface is small
  enough that Context alone is simpler and sufficient.
- **Drag-and-drop**: Task status changes optimistically update local state
  immediately, then persist to the server; on failure, the UI reverts and
  shows an error.

---

## Known Limitations / Possible Improvements

- Response payload key names differ slightly between some endpoints (e.g.
  `createProject` vs `project` vs `updatedProject`) — functional, but could
  be unified for consistency in a future pass.
- No pagination/sorting on task or project lists yet (listed as a bonus
  feature in the original spec).
- No WebSocket/real-time updates — task changes require a page refresh to
  be seen by other users.
- Docker Compose currently covers the database only; the API server itself
  is run directly with `npm run dev` rather than containerized.
