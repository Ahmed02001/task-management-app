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
