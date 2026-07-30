import express from "express";
import {
  getCurrentUserController,
  loginUserController,
  registerUserController,
} from "../controllers/auth.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/me", authenticate, getCurrentUserController);

export default router;
