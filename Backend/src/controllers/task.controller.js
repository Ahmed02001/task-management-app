import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "../services/task.service.js";

export async function createTaskController(req, res) {
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
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to create task",
    });
  }
}

export async function getAllTasksController(req, res) {
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
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to retrieve tasks",
    });
  }
}

export async function getTaskByIdController(req, res) {
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
  } catch (error) {
    const statusCode = error.message === "Task not found" ? 404 : 400;
    return res.status(statusCode).json({
      message: error.message || "Failed to retrieve task",
    });
  }
}

export async function updateTaskController(req, res) {
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
  } catch (error) {
    let statusCode = 400;
    if (error.message === "Task not found") {
      statusCode = 404;
    } else if (
      error.message === "You do not have permission to update this task"
    ) {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      message: error.message || "Failed to update task",
    });
  }
}

export async function deleteTaskController(req, res) {
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
  } catch (error) {
    let statusCode = 400;
    if (error.message === "Task not found") {
      statusCode = 404;
    } else if (
      error.message === "You do not have permission to delete this task"
    ) {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      message: error.message || "Failed to delete task",
    });
  }
}
