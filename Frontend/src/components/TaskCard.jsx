import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export default function TaskCard({ task, onDelete }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition group relative cursor-grab active:cursor-grabbing select-none flex flex-col gap-2"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
          {task.title}
        </h3>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(taskId)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition text-xs font-bold"
          title="Delete Task"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges Footer: Priority & Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1 text-[11px]">
        <span
          className={`px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
            PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>
        {formattedDate && (
          <span className="text-gray-400 font-medium">📅 {formattedDate}</span>
        )}
      </div>
    </div>
  );
}
