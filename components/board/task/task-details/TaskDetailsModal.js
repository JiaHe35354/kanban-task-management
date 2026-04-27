"use client";

import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { BoardActionsContext } from "@/context/board/BoardProvider";
import { getSubtaskStats } from "@/utils/taskHelper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MenuButton from "./MenuButton";
import StatusDropDown from "@/components/ui/StatusDropDown";
import CrossIcon from "@/assets/icon-cross.svg";
import { useModalCleanup } from "@/hooks/useModalCleanup";
import { useTaskModal } from "@/context/board/TaskModalContext";

import "@/app/globals.css";
import classes from "./TaskDetailsModal.module.css";

const TaskDetailsModal = forwardRef(function TaskDetailsModal(
  { task, columns, currentColumn, onOpenEdit, onOpenDelete },
  ref,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { toggleSubtask, moveTask } = useContext(BoardActionsContext);
  const { closeTaskModal } = useTaskModal();

  const dialog = useRef();

  const isMobile = useMediaQuery("(max-width: 46.25em)");
  const { handleBackdropClick } = useModalCleanup(
    dialog,
    undefined,
    closeTaskModal,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        if (dialog.current) dialog.current.showModal();
      },
      close: () => {
        if (dialog.current) dialog.current.close();
      },
    };
  });

  async function handleChange(newColumnId) {
    if (newColumnId === currentColumn?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      await moveTask(task.id, newColumnId);
    } catch (error) {
      console.error("Move failed:", error);
      setError("Connection lost. Task movement was cancelled.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted || !task) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  const { total, completed } = getSubtaskStats(task.subtasks);

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className={classes.modalHeader}>
        <h4 className={classes.heading}>{task.title}</h4>

        <div className={classes.headerActions}>
          <MenuButton
            onOpenEdit={onOpenEdit}
            onOpenDelete={onOpenDelete}
            disabled={isLoading}
          />
        </div>
      </header>

      <section className={classes.modalContent}>
        {task.description ? (
          <p className={classes.description}>{task.description}</p>
        ) : (
          <p className={classes.description}>No description provided.</p>
        )}

        <fieldset className={classes.subtasks}>
          <legend className={classes.subtaskTitle}>
            Subtasks ({`${completed} of ${total}`})
          </legend>
          <ul className={classes.subtaskList}>
            {task.subtasks.map((subtask) => (
              <li key={subtask.id} className={classes.subtaskItem}>
                <input
                  type="checkbox"
                  id={subtask.id}
                  className={classes.checkbox}
                  disabled={isLoading}
                  checked={subtask.isCompleted}
                  onChange={() => toggleSubtask(task.id, subtask.id)}
                />
                <label htmlFor={subtask.id} className={classes.subtaskLabel}>
                  {subtask.title}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={classes.status}>
          <h5 className={classes.statusLabel}>Current Status</h5>

          <StatusDropDown
            value={currentColumn?.name}
            options={columns}
            onChange={(newColumnId) => handleChange(newColumnId)}
            disabled={isLoading}
          />
        </div>

        {error && <p className="formErrorText mt-2">{moveError}</p>}
      </section>

      {isMobile && (
        <button
          type="button"
          className={`${classes.closeModalBtn} ${
            !isMobile ? "visuallyHidden" : ""
          }`}
          onClick={() => {
            dialog.current.close();
            closeTaskModal();
          }}
          aria-label="Close task details"
        >
          <CrossIcon />
        </button>
      )}
    </dialog>,
    modalRoot,
  );
});

export default TaskDetailsModal;
