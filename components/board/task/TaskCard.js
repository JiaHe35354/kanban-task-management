import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTaskModal } from "@/context/board/TaskModalContext";
import { getSubtaskStats } from "@/utils/taskHelper";

import classes from "./Task.module.css";

function TaskCard({ task }) {
  const { openTaskDetails } = useTaskModal();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: () => true,
  });

  const style = {
    transition: transition || "transform 500ms cubic-bezier(0.2, 0, 0, 1)",
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  const { total, completed } = getSubtaskStats(task.subtasks);

  function handleOpenDetails() {
    openTaskDetails(task.id);
  }

  return (
    <>
      <li ref={setNodeRef} style={style} className={classes.taskListItem}>
        <button
          type="button"
          className={classes.taskBtn}
          style={{ opacity: isDragging ? 0 : 1 }}
          {...listeners}
          {...attributes}
          onClick={handleOpenDetails}
        >
          <h3 className={classes.taskTitle}>{task.title}</h3>
          <p className={classes.subtaskTitle}>
            {completed} of {total} subtasks
          </p>
        </button>
      </li>
    </>
  );
}

export default memo(TaskCard);
