import axiosInstance from "../api/axiosInstance";

export async function getAllProjects() {
  const response = await axiosInstance.get("/projects");
  return response.data.projects;
}

export async function createProject(name, description) {
  const response = await axiosInstance.post("/projects", { name, description });
  return response.data.createProject;
}

export async function getProjectById(projectId) {
  const response = await axiosInstance.get(`/projects/${projectId}`);
  return response.data.project;
}

export async function updateProject(projectId, name, description) {
  const response = await axiosInstance.put(`/projects/${projectId}`, {
    name,
    description,
  });
  return response.data.updatedProject;
}

export async function deleteProject(projectId) {
  const response = await axiosInstance.delete(`/projects/${projectId}`);
  return response.data;
}
