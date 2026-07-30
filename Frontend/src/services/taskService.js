import axiosInstance from "../api/axiosInstance";

export async function getAllTasks(projectId, filters = {}) {
  const response = await axiosInstance.get(`/projects/${projectId}/tasks`, {
    params: filters,
  });
  return response.data.tasks || [];
}

export async function createTask(projectId, taskData) {
  const response = await axiosInstance.post(
    `/projects/${projectId}/tasks`,
    taskData,
  );
  return response.data.task;
}

export async function updateTask(projectId, taskId, updates) {
  const response = await axiosInstance.put(
    `/projects/${projectId}/tasks/${taskId}`,
    updates,
  );
  return response.data.task;
}

export async function deleteTask(projectId, taskId) {
  const response = await axiosInstance.delete(
    `/projects/${projectId}/tasks/${taskId}`,
  );
  return response.data;
}
