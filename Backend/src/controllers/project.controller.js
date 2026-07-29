import { createProjectService } from "../services/project.service.js";

export async function createProjectController(req, res) {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name, and description are required" });
  }

  const ownerId = req.user.userId;

  try {
    const createProject = await createProjectService(
      name,
      description,
      ownerId,
    );

    return res
      .status(201)
      .json({ message: "Project Created Successfully", createProject });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
