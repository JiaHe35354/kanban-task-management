import { memo, useContext } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTaskModal } from "@/context/board/TaskModalContext";
import { getSubtaskStats } from "@/utils/taskHelper";

import classes from "./Task.module.css";
import { BoardStateContext } from "@/context/board/BoardProvider";

function TaskCard({ id }) {
  const { tasksById } = useContext(BoardStateContext);
  const { openTaskDetails } = useTaskModal();

  const task = tasksById[id];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    animateLayoutChanges: () => true,
  });

  const style = {
    transition: transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  if (!task) return null;

  const { total, completed } = getSubtaskStats(task.subtasks);

  return (
    <>
      <li ref={setNodeRef} style={style} className={classes.taskListItem}>
        <button
          type="button"
          className={classes.taskBtn}
          {...listeners}
          {...attributes}
          onClick={() => openTaskDetails(id)}
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
