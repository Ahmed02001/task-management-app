import express from "express";

import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import authenticate from "./middlewares/auth.middleware.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import userRouter from "./routes/user.routes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
export const app = express();

app.use(cors());
app.use(express.json());

// Get current directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load swagger.yaml relative to src/
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/health", (req, res) =>
  res.status(200).json({ message: "Server is running" }),
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use("/api/projects", projectRouter);
app.use("/api/projects", taskRouter);

app.use(errorHandler);
