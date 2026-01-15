"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

import { selectColumnsOfActiveBoard } from "@/store/boardSelector";
import CrossIcon from "@/assets/icon-cross.svg";
import StatusDropDown from "@/components/ui/StatusDropDown";

import "@/app/globals.css";
import classes from "./NewTaskModal.module.css";

const NewTaskModal = forwardRef(function NewTaskModal({}, ref) {
  const dialog = useRef();
  const columns = useSelector(selectColumnsOfActiveBoard);

  const [mounted, setMounted] = useState(false);
  const [subtasks, setSubtasks] = useState([
    { id: crypto.randomUUID(), title: "" },
  ]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      setStatus(columns[0].name);
    }
  }, [columns]);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function handleAddSubtask() {
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: "" }]);
  }

  function handleUpdateSubtask(id, value) {
    setSubtasks((prev) =>
      prev.map((subtask) =>
        subtask.id === id ? { ...subtask, title: value } : subtask
      )
    );
  }

  function handleRemoveSubtask(id) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal">
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Task</h4>
      </header>

      <form className="form">
        <div className="formControl">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Take coffee break"
          />
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
          />
        </div>

        <div className="formControl">
          <label htmlFor="subtasks">Subtasks</label>

          <div className={classes.subtasksWrapper}>
            {subtasks.map((subtask) => (
              <div key={subtask.id} className={classes.subtaskRow}>
                <input
                  type="text"
                  id="subtasks"
                  name="subtasks"
                  value={subtask.value}
                  onChange={(e) =>
                    handleUpdateSubtask(subtask.id, e.target.value)
                  }
                />
                <button
                  type="button"
                  className={classes.closeBtn}
                  onClick={() => handleRemoveSubtask(subtask.id)}
                >
                  <CrossIcon />
                </button>
              </div>
            ))}
          </div>

          {subtasks.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              onClick={handleAddSubtask}
            >
              + Add New Subtask
            </button>
          )}
        </div>

        <div className="formControl">
          <p className={classes.statusLabel}>Status</p>

          <StatusDropDown value={status} options={columns} />
        </div>

        <button type="button" className="btn btnPrimary">
          Create Task
        </button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default NewTaskModal;
