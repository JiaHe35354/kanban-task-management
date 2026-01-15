"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";

import { selectColumnsOfActiveBoard } from "@/store/boardSelector";
import { getSubtaskStats } from "@/util/taskHelper";
import MenuButton from "./MenuButton";
import StatusDropDown from "@/components/ui/StatusDropDown";

import "@/app/globals.css";
import classes from "./TaskDetailsModal.module.css";

const TaskDetailsModal = forwardRef(function TaskDetailsModal(
  { task, onEdit, onDelete },
  ref
) {
  const columns = useSelector(selectColumnsOfActiveBoard);
  const [mounted, setMounted] = useState(false);
  const dialog = useRef();

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  const { total, completed } = getSubtaskStats(task.subtasks);

  return createPortal(
    <dialog ref={dialog} className="modal">
      <header className={classes.modalHeader}>
        <h4 className={classes.taskTitle}>{task.title}</h4>

        <MenuButton onEdit={onEdit} onDelete={onDelete} />
      </header>

      <section className={classes.modalContent}>
        {task.description ? (
          <p className={classes.description}>{task.description}</p>
        ) : (
          <p className={classes.description}>No description provided.</p>
        )}

        <fieldset className={classes.subtasks}>
          <legend className={classes.subtaskTitle}>
            Subtasks({`${completed} of ${total}`})
          </legend>
          <ul className={classes.subtaskList}>
            {task.subtasks.map((subtask) => (
              <li key={subtask.title} className={classes.subtaskItem}>
                <input
                  type="checkbox"
                  id={subtask.id}
                  checked={subtask.isCompleted}
                  readOnly
                />
                <label htmlFor={subtask.id}>{subtask.title}</label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={classes.status}>
          <h5 className={classes.statusLabel}>Current Status</h5>

          <StatusDropDown value={task.status} options={columns} />
        </div>
      </section>

      {/* <form method="dialog">
        <button aria-label="Close task details" className="sr-only">
          Close
        </button>
      </form> */}
    </dialog>,
    modalRoot
  );
});

export default TaskDetailsModal;
