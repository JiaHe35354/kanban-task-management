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

import { BoardActionsContext } from "@/context/BoardContext";
import StatusDropDown from "@/components/ui/StatusDropDown";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./EditTaskModal.module.css";

const EditTaskModal = forwardRef(function EditTaskModal(
  { task, columns, currentColumn },
  ref,
) {
  const dialog = useRef();

  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [status, setStatus] = useState("");

  const { editTask } = useContext(BoardActionsContext);

  const titleInvalid = !title.trim();
  const hasEmptySubtask = subtasks.some((s) => !s.title.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!task) return;

    setTitle(task.title);
    setDescription(task.description || "");
    setSubtasks(task.subtasks.map((s) => ({ ...s })));
    setStatus(currentColumn?.id || "");
  }, [task, currentColumn]);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function resetForm() {
    if (!task) return;

    setTitle(task.title);
    setDescription(task.description || "");
    setSubtasks(task.subtasks.map((s) => ({ ...s })));
    setStatus(currentColumn?.id || "");

    setSubmitted(false);
  }

  function handleBackdropClick(e) {
    if (e.target === dialog.current) {
      resetForm();
      dialog.current.close();
    }
  }

  function handleAddSubtask() {
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", isCompleted: false },
    ]);
    setSubmitted(false);
  }

  function handleUpdateSubtask(id, value) {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s)),
    );

    setSubmitted(false);
  }

  function handleRemoveSubtask(id) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (titleInvalid || hasEmptySubtask) return;

    editTask({
      taskId: task.id,
      title,
      description,
      status,
      subtasks,
    });

    console.log("Editted task");

    dialog.current.close();
  }

  if (!mounted || !task) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading">Edit Task</h4>

        <button
          type="button"
          className="modalClose"
          onClick={() => {
            resetForm();
            dialog.current.close();
          }}
          aria-label="Close modal"
        >
          <CrossIcon />
        </button>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="title">Title</label>
          <div className={classes.inputWrapper}>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={submitted && titleInvalid ? classes.inputError : ""}
            />
            {submitted && titleInvalid && (
              <p className={classes.errorText}>Can't be empty</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="formControl">
          <label>Subtasks</label>

          <div className={classes.subtasksWrapper}>
            {subtasks.map((subtask) => {
              const isInvalid = submitted && !subtask.title.trim();

              return (
                <div key={subtask.id} className={classes.subtaskRow}>
                  <div className={classes.inputWrapper}>
                    <input
                      value={subtask.title}
                      onChange={(e) =>
                        handleUpdateSubtask(subtask.id, e.target.value)
                      }
                      className={isInvalid ? classes.inputError : ""}
                    />
                    {isInvalid && (
                      <p className={classes.errorText}>Can't be empty</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${classes.closeBtn} ${
                      isInvalid ? classes.btnError : ""
                    }`}
                    onClick={() => handleRemoveSubtask(subtask.id)}
                  >
                    <CrossIcon />
                  </button>
                </div>
              );
            })}
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

          <StatusDropDown
            value={currentColumn?.name}
            options={columns}
            onChange={setStatus}
          />
        </div>

        <button className="btn btnPrimary">Save Changes</button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default EditTaskModal;
