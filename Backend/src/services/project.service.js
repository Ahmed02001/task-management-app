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

export async function addMemberService(
  projectId,
  requesterId,
  newMemberUserId,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== requesterId) {
    throw new Error("Only the project owner can add new members");
  }

  const userToAdd = await prisma.user.findUnique({
    where: { id: newMemberUserId },
  });

  if (!userToAdd) {
    throw new Error("User to add was not found");
  }

  if (project.ownerId === newMemberUserId) {
    throw new Error("User is already the owner of this project");
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: {
      projectId: projectId,
      userId: newMemberUserId,
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  const newMember = await prisma.projectMember.create({
    data: {
      projectId: projectId,
      userId: newMemberUserId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return newMember;
}

export async function removeMemberService(
  projectId,
  requesterId,
  memberUserIdToRemove,
) {
  if (!projectId || !requesterId || !memberUserIdToRemove) {
    throw new Error(
      "Missing required parameters: projectId, requesterId, and memberUserIdToRemove are required.",
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (memberUserIdToRemove === project.ownerId) {
    throw new Error("The project owner cannot be removed from the project.");
  }

  const isOwner = project.ownerId === requesterId;
  const isSelfRemoval = requesterId === memberUserIdToRemove;

  if (!isOwner && !isSelfRemoval) {
    throw new Error(
      "You do not have permission to remove this member from the project.",
    );
  }

  const memberRecord = await prisma.projectMember.findFirst({
    where: {
      projectId: projectId,
      userId: memberUserIdToRemove,
    },
  });

  if (!memberRecord) {
    throw new Error("User is not a member of this project.");
  }

  const removedMember = await prisma.projectMember.delete({
    where: {
      id: memberRecord.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return removedMember;
}
