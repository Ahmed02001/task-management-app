import express from "express";

import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import authenticate from "./middlewares/auth.middleware.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.status(200).json({ message: "Server is running" }),
);

app.use("/api/auth", authRouter);

app.use("/api/projects", projectRouter);
app.use("/api/projects", taskRouter);
