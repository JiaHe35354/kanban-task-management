import { useRef } from "react";
import { useSelector } from "react-redux";

import TaskDetailsModal from "./task-details/TaskDetailsModal";
import EditTaskModal from "./edit-task/EditTaskModal";
import DeleteTaskModal from "./delete-task/DeleteTaskModal";
import { getSubtaskStats } from "@/utils/taskHelper";
import { selectColumnsOfActiveBoard } from "@/store/boardSelector";

import classes from "./Task.module.css";

export default function TaskCard({ task }) {
  const detailsModalRef = useRef();
  const editModalRef = useRef();
  const deleteModalRef = useRef();

  const columns = useSelector(selectColumnsOfActiveBoard);
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

      <li className={classes.taskListItem} onClick={handleOpenDetails}>
        <h3 className={classes.taskTitle}>{task.title}</h3>
        <p className={classes.subtasks}>
          {completed} of {total} subtasks
        </p>
      </li>
    </>
  );
}
