import express from "express";
import {
  createProjectController,
  getAllProjectsController,
} from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createProjectController);
router.get("/", authenticate, getAllProjectsController);

export default router;
