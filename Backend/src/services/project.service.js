import { prisma } from "../config/prisma.js";
import AppError from "../utils/app.error.js";

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
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  // 404 Not Found
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 403 Forbidden
  if (!project.members.some((member) => member.userId === userId)) {
    throw new AppError("You do not have access to this project", 403);
  }

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

  // 404 Not Found
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const isOwner = project.ownerId === userId;
  const isAdmin = userRole === "ADMIN";

  // 403 Forbidden
  if (!isOwner && !isAdmin) {
    throw new AppError(
      "You do not have permission to update this project",
      403,
    );
  }

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

  // 404 Not Found
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const isOwner = project.ownerId === userId;
  const isAdmin = userRole === "ADMIN";

  // 403 Forbidden
  if (!isOwner && !isAdmin) {
    throw new AppError(
      "You do not have permission to delete this project",
      403,
    );
  }

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

  // 404 Not Found
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 403 Forbidden
  if (project.ownerId !== requesterId) {
    throw new AppError("Only the project owner can add new members", 403);
  }

  const userToAdd = await prisma.user.findUnique({
    where: { id: newMemberUserId },
  });

  // 404 Not Found
  if (!userToAdd) {
    throw new AppError("User to add was not found", 404);
  }

  // 400 Bad Request
  if (project.ownerId === newMemberUserId) {
    throw new AppError("User is already the owner of this project", 400);
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: {
      projectId: projectId,
      userId: newMemberUserId,
    },
  });

  // 409 Conflict
  if (existingMember) {
    throw new AppError("User is already a member of this project", 409);
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
  // 400 Bad Request
  if (!projectId || !requesterId || !memberUserIdToRemove) {
    throw new AppError(
      "Missing required parameters: projectId, requesterId, and memberUserIdToRemove are required.",
      400,
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  // 404 Not Found
  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  // 400 Bad Request
  if (memberUserIdToRemove === project.ownerId) {
    throw new AppError(
      "The project owner cannot be removed from the project.",
      400,
    );
  }

  const isOwner = project.ownerId === requesterId;
  const isSelfRemoval = requesterId === memberUserIdToRemove;

  // 403 Forbidden
  if (!isOwner && !isSelfRemoval) {
    throw new AppError(
      "You do not have permission to remove this member from the project.",
      403,
    );
  }

  const memberRecord = await prisma.projectMember.findFirst({
    where: {
      projectId: projectId,
      userId: memberUserIdToRemove,
    },
  });

  // 404 Not Found
  if (!memberRecord) {
    throw new AppError("User is not a member of this project.", 404);
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
