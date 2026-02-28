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

import { BoardStateContext, BoardActionsContext } from "@/context/BoardContext";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./NewColumnModal.module.css";

const NewColumnModal = forwardRef(function NewColumnModal({}, ref) {
  const [cols, setCols] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { columns } = useContext(BoardStateContext);
  const { activeBoard, updateColumns } = useContext(BoardActionsContext);

  const dialog = useRef();

  const hasEmptyColumn = cols.some((c) => !c.name.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeBoard) return;

    setCols(columns.map((column) => ({ ...column })));
  }, [activeBoard, columns]);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function resetForm() {
    if (!activeBoard) return;

    setCols(columns);

    setSubmitted(false);
  }

  function handleBackdropClick(e) {
    if (e.target === dialog.current) {
      resetForm();
      dialog.current.close();
    }
  }

  function handleAddColumn() {
    setCols((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);

    setSubmitted(false);
  }

  function handleUpdateColumn(id, value) {
    setCols((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name: value } : col)),
    );

    setSubmitted(false);
  }

  function handleRemoveColumn(id) {
    setCols((prev) => prev.filter((col) => col.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (hasEmptyColumn) return;

    updateColumns(activeBoard.id, cols);

    dialog.current.close();
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Column</h4>
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
          <label>Board Name</label>
          <p className={classes.boardNameLabel}>{activeBoard?.name}</p>
        </div>

        <div className="formControl">
          <label htmlFor="columns">Columns</label>

          <div className={classes.columnsWrapper}>
            {cols.map((col) => {
              const isInvalid = submitted && !col.name.trim();

              return (
                <div key={col.id} className={classes.columnRow}>
                  <div className={classes.inputWrapper}>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) =>
                        handleUpdateColumn(col.id, e.target.value)
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
                    disabled={cols.length === 1}
                    onClick={() => handleRemoveColumn(col.id)}
                  >
                    <CrossIcon />
                  </button>
                </div>
              );
            })}
          </div>

          {cols.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              onClick={handleAddColumn}
            >
              + Add New Column
            </button>
          )}
        </div>

        <button className="btn btnPrimary">Save Changes</button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default NewColumnModal;
