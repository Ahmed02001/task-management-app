import express from "express";
import { createProjectController } from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createProjectController);

export default router;
