import jwt from "jsonwebtoken";
import ENV from "../config/env.js";

async function generateToken(payload) {
  const token = await jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

  return token;
}

export default generateToken;
