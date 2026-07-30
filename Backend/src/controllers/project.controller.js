import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addMemberService,
  removeMemberService,
} from "../services/project.service.js";

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

export async function getAllProjectsController(req, res) {
  const userId = req.user.userId;

  try {
    const projects = await getAllProjectsService(userId);

    return res.status(200).json({ projects });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

export async function getProjectByIdController(req, res) {
  const userId = req.user.userId;
  const projectId = req.params.Id;

  try {
    const project = await getProjectByIdService(projectId, userId);
    return res.status(200).json({ project });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

export async function updateProjectController(req, res) {
  const projectId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const updates = req.body;

  try {
    const updatedProject = await updateProjectService(
      projectId,
      userId,
      userRole,
      updates,
    );

    return res
      .status(200)
      .json({ message: "Project Updated Successfully", updatedProject });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

export async function deleteProjectController(req, res) {
  const projectId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const deletedProject = await deleteProjectService(
      projectId,
      userId,
      userRole,
    );

    return res
      .status(200)
      .json({ message: "Project Deleted Successfully", deletedProject });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

export async function addMemberController(req, res) {
  const projectId = req.params.id;
  const { userId: newMemberUserId } = req.body;
  const requesterId = req.user.userId;

  try {
    const member = await addMemberService(
      projectId,
      requesterId,
      newMemberUserId,
    );
    return res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

export async function removeMemberController(req, res) {
  const projectId = req.params.id;
  const memberUserIdToRemove = req.params.userId;
  const requesterId = req.user.userId;

  if (!projectId || !memberUserIdToRemove) {
    return res.status(400).json({
      message: "Project ID and Member User ID to remove are required.",
    });
  }

  try {
    const removedMember = await removeMemberService(
      projectId,
      requesterId,
      memberUserIdToRemove,
    );

    return res.status(200).json({
      message: "Member removed successfully",
      member: removedMember,
    });
  } catch (e) {
    return res
      .status(400)
      .json({ message: e.message || "Failed to remove member" });
  }
}
