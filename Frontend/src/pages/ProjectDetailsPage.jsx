import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import { getProjectById } from "../services/projectService";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
const STATUS_TO_BACKEND = {
  todo: "TODO",
  "in-progress": "IN_PROGRESS",
  done: "DONE",
};

const STATUS_TO_FRONTEND = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

const COLUMNS = [
  { id: "todo", title: "To Do", badgeBg: "bg-amber-100 text-amber-800" },
  {
    id: "in-progress",
    title: "In Progress",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  { id: "done", title: "Done", badgeBg: "bg-emerald-100 text-emerald-800" },
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  status: "todo",
};

export default function ProjectDetailsPage() {
  const { id: projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  async function fetchProjectAndTasks() {
    try {
      setLoading(true);
      setError(null);
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getAllTasks(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load details",
      );
    } finally {
      setLoading(false);
    }
  }

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => (t.id || t._id) === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const draggedTask = tasks.find((t) => (t.id || t._id) === activeId);
    if (!draggedTask) return;

    let newFrontendStatus = overId;
    const overTask = tasks.find((t) => (t.id || t._id) === overId);
    if (overTask) {
      newFrontendStatus = STATUS_TO_FRONTEND[overTask.status];
    }

    const newBackendStatus = STATUS_TO_BACKEND[newFrontendStatus];

    if (draggedTask.status === newBackendStatus) return;

    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === activeId ? { ...t, status: newBackendStatus } : t,
      ),
    );

    try {
      await updateTask(projectId, activeId, { status: newBackendStatus });
    } catch (err) {
      console.error("Failed to update task status:", err);
      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === activeId
            ? { ...t, status: draggedTask.status }
            : t,
        ),
      );
      alert("Failed to save task status. Reverting changes.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const { title, description, priority, dueDate } = newTaskData;

    if (!title.trim() || !description.trim() || !priority || !dueDate) {
      alert(
        "All fields (Title, Description, Priority, Due Date) are required.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newTaskData,
        title: title.trim(),
        description: description.trim(),
        priority: priority.toUpperCase(),
        dueDate: new Date(dueDate).toISOString(),
      };

      const createdTask = await createTask(projectId, payload);
      setTasks((prev) => [...prev, createdTask]);
      setIsTaskModalOpen(false);
      setNewTaskData(INITIAL_FORM_STATE);
    } catch (err) {
      console.error("Task Creation Error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Board...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              &larr; Back to Projects
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-bold text-gray-900">
              {project?.name || "Project"}
            </h1>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            + New Task
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter(
                  (task) => task && STATUS_TO_FRONTEND[task.status] === col.id,
                );
                return (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    tasks={columnTasks}
                    onDeleteTask={handleDeleteTask}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard task={activeTask} onDelete={() => {}} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Complete Task Creation Modal */}
      {isTaskModalOpen && (
        <div
          onClick={() => setIsTaskModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <h3 className="font-bold text-gray-900 text-lg mb-4">
              Add New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTaskData.title}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, title: e.target.value })
                  }
                  placeholder="Task title..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={newTaskData.description}
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Task description..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Priority *
                  </label>
                  <select
                    required
                    value={newTaskData.priority}
                    onChange={(e) =>
                      setNewTaskData({
                        ...newTaskData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Due Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={newTaskData.dueDate || ""}
                      onChange={(e) =>
                        setNewTaskData({
                          ...newTaskData,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition duration-200"
                    />
                    {newTaskData.dueDate && (
                      <button
                        type="button"
                        onClick={() =>
                          setNewTaskData({
                            ...newTaskData,
                            dueDate: "",
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                        title="Clear date"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={newTaskData.status}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Form Controls */}
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-xs font-semibold text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
