import express from "express";

import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import authenticate from "./middlewares/auth.middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.status(200).json({ message: "Server is running" }),
);

app.use("/api/auth", authRouter);

app.get("/api/test-auth", authenticate, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});
