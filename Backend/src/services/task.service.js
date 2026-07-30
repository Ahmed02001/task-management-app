import { prisma } from "../config/prisma.js";
import AppError from "../utils/app.error.js";

export async function createTaskService(projectId, creatorId, taskData) {
  const { title, description, priority, dueDate, assigneeId } = taskData;

  if (assigneeId) {
    const isAssigneeMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: assigneeId,
      },
    });

    // 400 Bad Request
    if (!isAssigneeMember) {
      throw new AppError("Assignee is not a member of this project.", 400);
    }
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      creatorId,
      assigneeId: assigneeId || null,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return newTask;
}

export async function getAllTasksService(projectId, filters = {}) {
  const { status, priority, assigneeId } = filters;

  const where = { projectId };

  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }
  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

export async function getTaskByIdService(taskId, projectId) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId: projectId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 404 Not Found
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
}

export async function updateTaskService(
  taskId,
  projectId,
  requesterId,
  project,
  updates,
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId: projectId,
    },
  });

  // 404 Not Found
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const isCreator = task.creatorId === requesterId;
  const isAssignee = task.assigneeId === requesterId;
  const isProjectOwner = project?.ownerId === requesterId;

  // 403 Forbidden
  if (!isCreator && !isAssignee && !isProjectOwner) {
    throw new AppError("You do not have permission to update this task", 403);
  }

  if (updates.assigneeId) {
    const isAssigneeMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: updates.assigneeId,
      },
    });

    // 400 Bad Request
    if (!isAssigneeMember) {
      throw new AppError("Assignee is not a member of this project.", 400);
    }
  }

  const allowedFields = [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "assigneeId",
  ];

  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === "dueDate" && updates.dueDate) {
        filteredUpdates.dueDate = new Date(updates.dueDate);
      } else {
        filteredUpdates[field] = updates[field];
      }
    }
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: filteredUpdates,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedTask;
}

export async function deleteTaskService(
  taskId,
  projectId,
  requesterId,
  requesterRole,
  project,
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId: projectId,
    },
  });

  // 404 Not Found
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const isCreator = task.creatorId === requesterId;
  const isProjectOwner = project?.ownerId === requesterId;
  const isAdmin = requesterRole === "ADMIN";

  // 403 Forbidden
  if (!isCreator && !isProjectOwner && !isAdmin) {
    throw new AppError("You do not have permission to delete this task", 403);
  }

  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return deletedTask;
}
