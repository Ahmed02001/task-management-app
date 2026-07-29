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
