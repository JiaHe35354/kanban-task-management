import { useContext, useRef } from "react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { BoardStateContext } from "@/context/BoardContext";
import TaskDetailsModal from "./task-details/TaskDetailsModal";
import EditTaskModal from "./edit-task/EditTaskModal";
import DeleteTaskModal from "./delete-task/DeleteTaskModal";
import { getSubtaskStats } from "@/utils/taskHelper";

import classes from "./Task.module.css";

export default function TaskCard({ task }) {
  const { columns } = useContext(BoardStateContext);

  const detailsModalRef = useRef();
  const editModalRef = useRef();
  const deleteModalRef = useRef();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: (args) =>
      defaultAnimateLayoutChanges({
        ...args,
        wasDragging: true,
      }),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const currentColumn = columns.find((column) => column.id === task.columnId);

  function handleOpenDetails() {
    detailsModalRef.current.open();
  }

  function handleOpenEdit() {
    detailsModalRef.current.close();
    editModalRef.current.open();
  }

  function handleOpenDelete() {
    detailsModalRef.current.close();
    deleteModalRef.current.open();
  }

  const { total, completed } = getSubtaskStats(task.subtasks);

  return (
    <>
      <TaskDetailsModal
        ref={detailsModalRef}
        task={task}
        columns={columns}
        currentColumn={currentColumn}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
      <EditTaskModal
        ref={editModalRef}
        task={task}
        columns={columns}
        currentColumn={currentColumn}
      />
      <DeleteTaskModal ref={deleteModalRef} task={task} />

      <li
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={classes.taskListItem}
        onClick={handleOpenDetails}
      >
        <h3 className={classes.taskTitle}>{task.title}</h3>
        <p className={classes.subtasks}>
          {completed} of {total} subtasks
        </p>
      </li>
    </>
  );
}
