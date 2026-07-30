import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "../services/task.service.js";

export async function createTaskController(req, res, next) {
  const projectId = req.params.projectId;
  const creatorId = req.user?.userId;
  const { title, description, priority, dueDate, assigneeId } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required." });
  }
  if (!title || !description || !priority || !dueDate) {
    return res.status(400).json({
      message: "Title, description, priority, and dueDate are required",
    });
  }

  try {
    const task = await createTaskService(projectId, creatorId, {
      title,
      description,
      priority,
      dueDate,
      assigneeId,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (e) {
    next(e);
  }
}

export async function getAllTasksController(req, res, next) {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const { status, priority, assigneeId } = req.query;

    const tasks = await getAllTasksService(projectId, {
      status,
      priority,
      assigneeId,
    });

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks,
    });
  } catch (e) {
    next(e);
  }
}

export async function getTaskByIdController(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { taskId } = req.params;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "Project ID and Task ID are required." });
    }

    const task = await getTaskByIdService(taskId, projectId);

    return res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (e) {
    next(e);
  }
}

export async function updateTaskController(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { taskId } = req.params;

    const requesterId = req.user?.userId;
    const project = req.project;

    const updates = req.body;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "Project ID and Task ID are required." });
    }

    const updatedTask = await updateTaskService(
      taskId,
      projectId,
      requesterId,
      project,
      updates,
    );

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteTaskController(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { taskId } = req.params;

    const requesterId = req.user.userId;
    const requesterRole = req.user.role;
    const project = req.project;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "Project ID and Task ID are required." });
    }

    await deleteTaskService(
      taskId,
      projectId,
      requesterId,
      requesterRole,
      project,
    );

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (e) {
    next(e);
  }
}
