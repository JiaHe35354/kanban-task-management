"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import CrossIcon from "@/assets/icon-cross.svg";
import StatusDropDown from "@/components/ui/StatusDropDown";
import { getColumnsByBoard } from "@/lib/firestore/columns";

import "@/app/globals.css";
import classes from "./NewTaskModal.module.css";

const NewTaskModal = forwardRef(function NewTaskModal({ activeBoard }, ref) {
  const dialog = useRef();

  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [columns, setColumns] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([
    { id: crypto.randomUUID(), title: "" },
  ]);
  const [status, setStatus] = useState("");

  const titleInvalid = submitted && !title.trim();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeBoard) return;

    async function loadColumns() {
      const data = await getColumnsByBoard(activeBoard.id);
      setColumns(data);

      console.log(data);
    }

    loadColumns();
  }, [activeBoard]);

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

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (!title.trim() || subtasks.some((s) => !s.title.trim())) return;

    const task = {
      title,
      description,
      status,
      subtasks,
    };

    console.log("Create task", task);

    // onCreateTask(task);

    dialog.current.close();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      e.currentTarget.close();
    }
  }

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
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Task</h4>
        <button
          type="button"
          className="modalClose"
          onClick={() => dialog.current.close()}
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
              type="text"
              id="title"
              name="title"
              value={title}
              className={titleInvalid ? classes.inputError : ""}
              onChange={(e) => {
                setTitle(e.target.value);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. Take coffee break"
            />

            {titleInvalid && (
              <p className={classes.errorText}>Can't be empty</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            rows="4"
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
          />
        </div>

        <div className="formControl">
          <label htmlFor="subtasks">Subtasks</label>

          <div className={classes.subtasksWrapper}>
            {subtasks.map((subtask) => {
              const isInvalid = submitted && !subtask.title.trim();

              return (
                <div key={subtask.id} className={classes.subtaskRow}>
                  <div className={classes.inputWrapper}>
                    <input
                      type="text"
                      id="subtasks"
                      value={subtask.title}
                      className={isInvalid ? classes.inputError : ""}
                      onChange={(e) => {
                        handleUpdateSubtask(subtask.id, e.target.value);
                        if (submitted) setSubmitted(false);
                      }}
                    />
                    {isInvalid && (
                      <p className={classes.errorText}>Can't be empty</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={classes.closeBtn}
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

          <input type="hidden" name="status" value={status} />
          <StatusDropDown
            value={status}
            options={columns}
            onChange={setStatus}
          />
        </div>

        <button className="btn btnPrimary">Create Task</button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default NewTaskModal;
