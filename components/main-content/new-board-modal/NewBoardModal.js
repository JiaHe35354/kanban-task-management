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

import { BoardContext } from "@/app/context/BoardContext";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./NewBoardModal.module.css";

const NewBoardModal = forwardRef(function NewBoardModal({}, ref) {
  const { createNewBoard } = useContext(BoardContext);

  const dialog = useRef();

  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [boardName, setBoardName] = useState("");
  const [columns, setColumns] = useState([
    { id: crypto.randomUUID(), name: "" },
  ]);

  const boardNameInvalid = !boardName.trim();
  const hasEmptyColumn = columns.some((col) => !col.name.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function resetForm() {
    setSubmitted(false);
    setBoardName("");
    setColumns([{ id: crypto.randomUUID(), name: "" }]);
  }

  // Need to modify:
  function handleBackdropClick(e) {
    if (e.target === dialog.current) {
      dialog.current.close();
      resetForm();
    }
  }

  function handleBoardNameChange(e) {
    setBoardName(e.target.value);

    if (submitted) setSubmitted(false);
  }

  function handleAddColumn() {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);

    if (submitted) setSubmitted(false);
  }

  function handleUpdateColumn(id, value) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name: value } : col))
    );

    if (submitted) setSubmitted(false);
  }

  function handleRemoveColumn(id) {
    setColumns((prev) => prev.filter((col) => col.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (boardNameInvalid || hasEmptyColumn) return;

    createNewBoard({ boardName, columns });

    dialog.current.close();
    resetForm();
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Board</h4>

        <button
          type="button"
          className="modalClose"
          onClick={() => {
            dialog.current.close();
            resetForm();
          }}
          aria-label="Close modal"
        >
          <CrossIcon />
        </button>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="name">Name</label>

          <div className={classes.inputWrapper}>
            <input
              type="text"
              id="name"
              placeholder="e.g. Web Design"
              value={boardName}
              onChange={handleBoardNameChange}
              className={
                submitted && boardNameInvalid ? classes.inputError : ""
              }
            />
            {submitted && boardNameInvalid && (
              <p className={classes.errorText}>Can't be empty</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label htmlFor="columns">Columns</label>

          <div className={classes.columnsWrapper}>
            {columns.map((column) => {
              const isInvalid = submitted && !column.name.trim();

              return (
                <div key={column.id} className={classes.columnRow}>
                  <div className={classes.inputWrapper}>
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, e.target.value)
                      }
                      className={isInvalid ? classes.inputError : ""}
                    />
                    {isInvalid && (
                      <p className={classes.errorText}>Can't be empty</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={classes.closeBtn}
                    onClick={() => handleRemoveColumn(column.id)}
                  >
                    <CrossIcon />
                  </button>
                </div>
              );
            })}
          </div>

          {columns.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              onClick={handleAddColumn}
            >
              + Add New Column
            </button>
          )}
        </div>

        <button className="btn btnPrimary">Create New Board</button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default NewBoardModal;
