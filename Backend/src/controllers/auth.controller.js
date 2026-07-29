import { registerUserService } from "../services/auth.service.js";

export async function registerUserController(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  try {
    const user = await registerUserService(name, email, password);
    return res.status(201).json({ message: "User created successfully", user });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
