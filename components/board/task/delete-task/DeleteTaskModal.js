"use client";

import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { BoardActionsContext } from "@/context/board/BoardProvider";
import { useModalCleanup } from "@/hooks/useModalCleanup";
import { useTaskModal } from "@/context/board/TaskModalContext";

const DeleteTaskModal = forwardRef(function DeleteTaskModal({ task }, ref) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { deleteTask } = useContext(BoardActionsContext);
  const { closeTaskModal } = useTaskModal();
  const dialog = useRef();

  const { handleBackdropClick } = useModalCleanup(
    dialog,
    undefined,
    closeTaskModal,
  );

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  async function handleDeleteTask(taskId) {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteTask(taskId);

      dialog.current.close();
      closeTaskModal();
    } catch (err) {
      setDeleteError("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancel() {
    setDeleteError(null);
    dialog.current.close();
    closeTaskModal();
  }

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <dialog
      ref={dialog}
      className="modal"
      onClick={!isDeleting ? handleBackdropClick : undefined}
      onCancel={(e) => {
        if (isDeleting) e.preventDefault();
      }}
    >
      <header className="modalHeader">
        <h4 className="modalHeading headingDanger">Delete this task?</h4>
      </header>

      <section>
        <p className="deleteText">
          {`Are you sure you want to delete the "${task.title}" task and its subtasks? This action cannot be 
          reversed.`}
        </p>

        {deleteError && <p className="formErrorText mb-2">{deleteError}</p>}

        <div className="btnGroup">
          <button
            className="btn btnDanger"
            disabled={isDeleting}
            onClick={() => handleDeleteTask(task.id)}
          >
            {isDeleting ? "Deleting" : "Delete"}
          </button>
          <button
            className="btn btnSecondary"
            disabled={isDeleting}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </section>
    </dialog>,
    modalRoot,
  );
});

export default DeleteTaskModal;
