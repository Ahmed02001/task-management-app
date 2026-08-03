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
import { getAllTasks, updateTask, deleteTask } from "../services/taskService";
import { getProjectById, removeMember } from "../services/projectService";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
import EditTaskModal from "../components/EditTaskModal";
import CreateTaskModal from "../components/CreateTaskModal";
import AddMemberModal from "../components/AddMemberModal";

const COLUMNS = [
  { id: "todo", title: "To Do", badgeBg: "bg-amber-100 text-amber-800" },
  {
    id: "in-progress",
    title: "In Progress",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  { id: "done", title: "Done", badgeBg: "bg-emerald-100 text-emerald-800" },
];

// Backend uses TODO / IN_PROGRESS / DONE. Board columns use lowercase-hyphenated ids.
// Tasks in local state ALWAYS keep the BACKEND format for `status`.
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

export default function ProjectDetailsPage() {
  const { id: projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters — applied client-side since all tasks are already loaded
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

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

  useEffect(() => {
    // Defer the fetch to avoid calling setState synchronously in the effect
    // which can trigger the react-hooks/set-state-in-effect rule.
    Promise.resolve().then(() => fetchProjectAndTasks());
  }, [projectId]);

  // Derived: tasks after applying the priority/assignee filters (view only —
  // drag/delete/edit operations always act on the full `tasks` array).
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "ALL" || task.assigneeId === assigneeFilter;
    return matchesPriority && matchesAssignee;
  });

  const handleDragStart = (event) => {
    const task = tasks.find((t) => (t.id || t._id) === event.active.id);
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
    if (overTask) newFrontendStatus = STATUS_TO_FRONTEND[overTask.status];

    const newBackendStatus = STATUS_TO_BACKEND[newFrontendStatus];
    if (!newBackendStatus || draggedTask.status === newBackendStatus) return;

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

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = async (taskId, updates) => {
    const updatedTask = await updateTask(projectId, taskId, updates);
    setTasks((prev) =>
      prev.map((t) => ((t.id || t._id) === taskId ? updatedTask : t)),
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== taskId));
    } catch (e) {
      console.error("Failed to delete task:", e.message);
      alert("Failed to delete task");
    }
  };

  const handleMemberAdded = (newMember) => {
    setProject((prev) => ({
      ...prev,
      members: [...(prev.members || []), newMember],
    }));
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeMember(projectId, userId);
      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.userId !== userId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Board...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/projects"
            className="text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            &larr; Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              + Add Member
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Project title + members */}
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {project?.name || "Project"}
          </h1>
          {project?.description && (
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          )}

          {project?.members?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {project.members.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-1 pr-2 py-1 text-xs font-medium text-gray-700 shadow-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {m.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  {m.user?.name}
                  {m.userId !== project.ownerId && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="text-gray-400 hover:text-red-500 ml-1"
                      title="Remove member"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Filter toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">
            Filter by:
          </span>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="ALL">All Members</option>
            {project?.members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.name}
              </option>
            ))}
          </select>

          {(priorityFilter !== "ALL" || assigneeFilter !== "ALL") && (
            <button
              onClick={() => {
                setPriorityFilter("ALL");
                setAssigneeFilter("ALL");
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

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
                const columnTasks = filteredTasks.filter(
                  (task) => task && STATUS_TO_FRONTEND[task.status] === col.id,
                );
                return (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    tasks={columnTasks}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={setEditingTask}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdateTask={handleUpdateTask}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
