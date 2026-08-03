import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { searchUserByEmailController } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", authenticate, searchUserByEmailController);

export default router;
