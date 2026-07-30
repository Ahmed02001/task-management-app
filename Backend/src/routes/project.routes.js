import express from "express";
import {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  addMemberController,
  removeMemberController,
} from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createProjectController);
router.get("/", authenticate, getAllProjectsController);
router.get("/:id", authenticate, getProjectByIdController);
router.put("/:id", authenticate, updateProjectController);
router.delete("/:id", authenticate, deleteProjectController);

router.post("/:id/members", authenticate, addMemberController);
router.delete("/:id/members/:userId", authenticate, removeMemberController);
export default router;
