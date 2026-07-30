import { prisma } from "../config/prisma.js";

export async function createTaskService(projectId, creatorId, taskData) {
  const { title, description, priority, dueDate, assigneeId } = taskData;

  if (assigneeId) {
    const isAssigneeMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: assigneeId,
      },
    });

    if (!isAssigneeMember) {
      throw new Error("Assignee is not a member of this project.");
    }
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: new Date(dueDate),
      projectId,
      creatorId, // or authorId depending on your Prisma schema field name
      assigneeId: assigneeId || null,
      // status field defaults to 'TODO' from schema
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

  if (!task) {
    throw new Error("Task not found");
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

  if (!task) {
    throw new Error("Task not found");
  }
  const isCreator = task.creatorId === requesterId;
  const isAssignee = task.assigneeId === requesterId;
  const isProjectOwner = project?.ownerId === requesterId;

  if (!isCreator && !isAssignee && !isProjectOwner) {
    throw new Error("You do not have permission to update this task");
  }

  if (updates.assigneeId) {
    const isAssigneeMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: updates.assigneeId,
      },
    });

    if (!isAssigneeMember) {
      throw new Error("Assignee is not a member of this project.");
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

  if (!task) {
    throw new Error("Task not found");
  }

  const isCreator = task.creatorId === requesterId;
  const isProjectOwner = project?.ownerId === requesterId;
  const isAdmin = requesterRole === "ADMIN";

  if (!isCreator && !isProjectOwner && !isAdmin) {
    throw new Error("You do not have permission to delete this task");
  }

  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return deletedTask;
}
