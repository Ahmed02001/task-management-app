import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import checkProjectMembership from "../middlewares/projectMembership.middleware.js";
import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post(
  "/:projectId/tasks",
  authenticate,
  checkProjectMembership,
  createTaskController,
);

router.get(
  "/:projectId/tasks",
  authenticate,
  checkProjectMembership,
  getAllTasksController,
);

router.get(
  "/:projectId/tasks/:taskId",
  authenticate,
  checkProjectMembership,
  getTaskByIdController,
);

router.put(
  "/:projectId/tasks/:taskId",
  authenticate,
  checkProjectMembership,
  updateTaskController,
);

router.delete(
  "/:projectId/tasks/:taskId",
  authenticate,
  checkProjectMembership,
  deleteTaskController,
);

export default router;
