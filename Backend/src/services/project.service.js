import { prisma } from "../config/prisma.js";

export async function createProjectService(name, description, ownerId) {
  const result = await prisma.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        name: name,
        description: description,
        ownerId: ownerId,
      },
    });
    await tx.projectMember.create({
      data: {
        userId: ownerId,
        projectId: newProject.id,
      },
    });
    return newProject;
  });
  return result;
}

export async function getAllProjectsService(userId) {
  const allProjects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: userId },
      },
    },
  });

  return allProjects;
}

export async function getProjectByIdService(projectId, userId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) throw new Error("Project not found");

  if (!project.members.some((member) => member.userId === userId))
    throw new Error("You do not have access to this project");

  return project;
}

export async function updateProjectService(
  projectId,
  userId,
  userRole,
  updates,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  const isOwner = project.ownerId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin)
    throw new Error("You do not have permission to update this project");

  const allowedFields = ["name", "description"];
  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: filteredUpdates,
  });

  return updatedProject;
}

export async function deleteProjectService(projectId, userId, userRole) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  const isOwner = project.ownerId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin)
    throw new Error("You do not have permission to delete this project");

  const deletedProject = await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { projectId } });
    await tx.projectMember.deleteMany({ where: { projectId } });
    return tx.project.delete({ where: { id: projectId } });
  });

  return deletedProject;
}
