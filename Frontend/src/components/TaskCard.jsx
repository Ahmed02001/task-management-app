import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

// Maps the backend status enum to a top bar color + badge style + label.
const STATUS_STYLES = {
  TODO: {
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "To Do",
  },
  IN_PROGRESS: {
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "In Progress",
  },
  DONE: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Done",
  },
};

export default function TaskCard({ task, onDelete, onEdit }) {
  const taskId = task.id || task._id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityKey = (task.priority || "MEDIUM").toLowerCase();
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;
  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.TODO;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group relative cursor-grab active:cursor-grabbing select-none flex flex-col gap-2"
    >
      {/* Status color bar - changes automatically once the task is
          dropped in a new column and its status updates */}
      <div className={`h-1.5 w-full ${statusStyle.bar}`} />

      <div className="px-4 pt-1 flex justify-between items-start gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
          {task.title}
        </h3>

        {/* Action buttons: must stop pointer/click propagation so they
            don't trigger a drag or interfere with dnd-kit's listeners */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-gray-400 hover:text-blue-600 transition text-xs"
            title="Edit Task"
          >
            ✏️
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(taskId);
            }}
            className="text-gray-400 hover:text-red-600 transition text-xs font-bold"
            title="Delete Task"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className="px-4 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="px-4 pb-4 flex items-center justify-between pt-2 border-t border-gray-100 mt-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
              PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.medium
            }`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusStyle.badge}`}
          >
            {statusStyle.label}
          </span>
        </div>
        {formattedDate && (
          <span className="text-gray-400 font-medium">📅 {formattedDate}</span>
        )}
      </div>
    </div>
  );
}
