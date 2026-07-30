import { useState, useEffect } from "react";
import { createProject } from "../services/projectService";

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Project name must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProject = await createProject(
        trimmedName,
        formData.description.trim(),
      );

      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      handleClose();
    } catch (err) {
      console.error("Create Project Error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to create project. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Overlay مع Backdrop Blur */
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in transition-all"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-scale-up"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                Create New Project
              </h3>
              <p className="text-xs text-gray-500">
                Add a new workspace to manage your tasks
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Input: Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              autoFocus
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Mobile App Redesign"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
            />
          </div>

          {/* Input: Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of the goals and scope..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition resize-none"
            />
          </div>

          {/* Actions Bar */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
