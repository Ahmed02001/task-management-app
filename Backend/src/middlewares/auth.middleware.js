import jwt from "jsonwebtoken";
import ENV from "../config/env.js";

export default function authenticate(req, res, next) {
  const authorize = req.headers.authorization;

  if (!authorize || !authorize.startsWith("Bearer "))
    return res.status(401).json({ message: "token is wrong or undefined" });

  const token = authorize.split(" ")[1];

  try {
    const { userId, role } = jwt.verify(token, ENV.JWT_SECRET);

    req.user = { userId, role };
  } catch (e) {
    return res.status(401).json({ message: "unAuthorized" });
  }

  next();
}
