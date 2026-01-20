"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { getSubtaskStats } from "@/utils/taskHelper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MenuButton from "./MenuButton";
import StatusDropDown from "@/components/ui/StatusDropDown";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./TaskDetailsModal.module.css";

const TaskDetailsModal = forwardRef(function TaskDetailsModal(
  { task, columns, currentColumn, onEdit, onDelete },
  ref
) {
  const [mounted, setMounted] = useState(false);
  const dialog = useRef();

  const isMobile = useMediaQuery("(max-width: 46.25em)");

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function handleBackdropClick(e) {
    if (e.target === dialog.current) {
      dialog.current.close();
    }
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  const { total, completed } = getSubtaskStats(task.subtasks);

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className={classes.modalHeader}>
        <h4 className={classes.heading}>{task.title}</h4>

        <div className={classes.headerActions}>
          <MenuButton onEdit={onEdit} onDelete={onDelete} />
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
                  checked={subtask.isCompleted}
                  readOnly
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

          <StatusDropDown value={currentColumn?.name} options={columns} />
        </div>
      </section>

      {isMobile && (
        <form method="dialog">
          <button
            className={`${classes.closeModalBtn} ${
              !isMobile ? "visuallyHidden" : ""
            }`}
            aria-label="Close task details"
          >
            <CrossIcon />
          </button>
        </form>
      )}
    </dialog>,
    modalRoot
  );
});

export default TaskDetailsModal;
