"use client";

import { useEffect, useRef } from "react";
import { useTaskModal } from "@/context/board/TaskModalContext";

import TaskDetailsModal from "./task-details/TaskDetailsModal";
import EditTaskModal from "./edit-task/EditTaskModal";
import DeleteTaskModal from "./delete-task/DeleteTaskModal";

export default function TaskModalsHost() {
  const detailsRef = useRef();
  const editRef = useRef();
  const deleteRef = useRef();

  const {
    activeTask,
    currentColumn,
    columns,
    activeModal,
    openEditTask,
    openDeleteTask,
  } = useTaskModal();

  // When the context says which modal is active, open/close the dialogs
  useEffect(() => {
    const details = detailsRef.current;
    const edit = editRef.current;
    const del = deleteRef.current;

    if (activeTask && activeModal) {
      if (activeModal === "details") {
        details?.open?.();
        edit?.close?.();
        del?.close?.();
      }
      if (activeModal === "edit") {
        edit?.open?.();
        details?.close?.();
        del?.close?.();
      }
      if (activeModal === "delete") {
        del?.open?.();
        details?.close?.();
        edit?.close?.();
      }
    } else {
      details?.close?.();
      edit?.close?.();
      del?.close?.();
    }
  }, [activeTask, activeModal]);

  // if (!activeTask) return null;

  function handleOpenEditTask() {
    openEditTask(activeTask.id);
  }

  function handleOpenDeleteTask() {
    openDeleteTask(activeTask.id);
  }

  return (
    <>
      <TaskDetailsModal
        ref={detailsRef}
        task={activeTask || { title: "", subtasks: [] }}
        columns={columns}
        currentColumn={currentColumn}
        onOpenEdit={handleOpenEditTask}
        onOpenDelete={handleOpenDeleteTask}
      />
      <EditTaskModal
        ref={editRef}
        task={activeTask}
        columns={columns}
        currentColumn={currentColumn}
      />
      <DeleteTaskModal ref={deleteRef} task={activeTask} />
    </>
  );
}
