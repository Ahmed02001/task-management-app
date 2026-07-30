import { prisma } from "../config/prisma.js";

export default async function checkProjectMembership(req, res, next) {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res
        .status(400)
        .json({ message: "Project ID is required parameter." });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentUserId = req.user.userId;
    const isOwner = project.ownerId === currentUserId;
    const isMember = project.members.some(
      (member) => member.userId === currentUserId,
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied: You are not a member of this project.",
      });
    }

    req.project = project;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}
