import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllProjects, deleteProject } from "../services/projectService";
import CreateProjectModal from "../components/CreateProjectModal";

export default function ProjectsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Data & Page States
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Projects on Mount
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProjects();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load projects",
      );
    } finally {
      setLoading(false);
    }
  }

  const handleProjectCreated = (newProject) => {
    if (newProject) {
      setProjects((prev) => [newProject, ...prev]);
    } else {
      fetchProjects();
    }
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => (p.id || p._id) !== projectId));
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <h1 className="text-4 font-bold text-gray-900 tracking-tight">
              TaskManager
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              Welcome,{" "}
              <span className="text-gray-900 font-semibold">
                {user?.name || "User"}
              </span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Projects Dashboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a project to view its tasks or create a new workspace.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-200"
          >
            + New Project
          </button>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={fetchProjects}
              className="text-sm underline font-semibold hover:text-red-800 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 bg-white rounded-xl border border-gray-200 p-5 animate-pulse flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State Window */
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📂
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No Projects Found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your very first project workspace.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              Create Project
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectId = project.id || project._id;
              return (
                <div
                  key={projectId}
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="group bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3
                        className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition truncate"
                        title={project.name}
                      >
                        {project.name}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        #{projectId.toString().slice(-4)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[2.5rem]">
                      {project.description || (
                        <span className="italic text-gray-400">
                          No description provided
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Card Bottom / Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                      View Tasks &rarr;
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, projectId)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Project Modal Integration */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
