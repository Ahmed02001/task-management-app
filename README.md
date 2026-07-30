# 🚀 DevTasker — Full-Stack Project Board & Task Manager

A high-performance full-stack web application designed for team project tracking, real-time status updates, and task management.

---

## 🛠️ Tech Stack

- **Frontend:** React.js / TypeScript, Tailwind CSS, Zustand / Redux Toolkit
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose) or PostgreSQL (with Prisma)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt hashing
- **Deployment:** Vercel (Client) + Render / Railway (Server)

---

## 📁 Project Structure

```text
project-root/
├── client/                # React / Frontend Application
│   ├── public/            # Static assets and icons
│   └── src/
│       ├── assets/        # Visual components and SVG images
│       ├── components/    # Reusable UI elements (Buttons, Cards, Modals)
│       ├── hooks/         # Custom React hooks (useTasks, useAuth)
│       ├── pages/         # Page components (Dashboard, BoardView)
│       └── App.js         # Routing wrapper
│
├── server/                # Express / Backend Application
│   ├── config/            # DB client configuration & env bindings
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # Auth validation & error handling
│   ├── models/            # Database schemas
│   ├── routes/            # Express API endpoints
│   └── server.js          # Application entry point
│
└── README.md              # Project documentation
