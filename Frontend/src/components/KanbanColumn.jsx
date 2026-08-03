import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  column,
  tasks,
  onDeleteTask,
  onEditTask,
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const taskIds = tasks.map((t) => t.id || t._id);

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100/70 border border-gray-200 rounded-xl p-4 min-h-[500px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h2 className="font-bold text-gray-300 text-sm uppercase tracking-wide">
          {column.title}
        </h2>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${column.badgeBg}`}
        >
          {tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id || task._id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
