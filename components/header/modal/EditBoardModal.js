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
import classes from "./EditBoardModal.module.css";

const EditBoardModal = forwardRef(function EditBoardModal({}, ref) {
  const [boardName, setBoardName] = useState("");
  const [cols, setCols] = useState([]);
  const [mounted, setMounted] = useState(false);

  const { activeBoard, columns, editBoard } = useContext(BoardContext);

  const dialog = useRef();
  const originalColumnsRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeBoard) return;

    setBoardName(activeBoard.name);
    setCols(columns);
    originalColumnsRef.current = columns;
  }, [activeBoard, columns]);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function resetForm() {
    if (!activeBoard) return;

    setBoardName(activeBoard.name);
    setCols(originalColumnsRef.current);
  }

  function handleBackdropClick(e) {
    if (e.target === dialog.current) {
      resetForm();
      dialog.current.close();
    }
  }

  function handleAddColumn() {
    setCols((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  }

  function handleUpdateColumn(id, value) {
    setCols((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name: value } : col))
    );
  }

  function handleRemoveColumn(id) {
    setCols((prev) => prev.filter((col) => col.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!activeBoard) return;

    editBoard({
      boardId: activeBoard.id,
      name: boardName,
      columns: cols,
    });

    dialog.current.close();
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading">Edit Board</h4>
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
          <label htmlFor="name">Board Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
          />
        </div>

        <div className="formControl">
          <label htmlFor="columns">Board Columns</label>

          <div className={classes.columnsWrapper}>
            {cols.map((col) => (
              <div key={col.id} className={classes.columnRow}>
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => handleUpdateColumn(col.id, e.target.value)}
                />
                <button
                  type="button"
                  className={classes.closeBtn}
                  disabled={cols.length === 1}
                  onClick={() => handleRemoveColumn(col.id)}
                >
                  <CrossIcon />
                </button>
              </div>
            ))}
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
    modalRoot
  );
});

export default EditBoardModal;
