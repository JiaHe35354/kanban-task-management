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

import "@/app/globals.css";
import classes from "./EditBoardModal.module.css";
import { useSelector } from "react-redux";
import { selectActiveBoard } from "@/store/boardSelector";

const EditBoardModal = forwardRef(function EditBoardModal({}, ref) {
  const dialog = useRef();
  const activeBoard = useSelector(selectActiveBoard);

  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState([
    { id: crypto.randomUUID(), name: "" },
  ]);

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

  function handleAddColumn() {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  }

  function handleUpdateColumn(id, value) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name: value } : col))
    );
  }

  function handleRemoveColumn(id) {
    setColumns((prev) => prev.filter((col) => col.id !== id));
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
          onClick={() => dialog.current.close()}
          aria-label="Close modal"
        >
          <CrossIcon />
        </button>
      </header>

      <form className="form">
        <div className="formControl">
          <label htmlFor="name">Board Name</label>
          <input type="text" id="name" name="name" value={activeBoard.name} />
        </div>

        <div className="formControl">
          <label htmlFor="columns">Board Columns</label>

          <div className={classes.columnsWrapper}>
            {activeBoard.columns.map((column) => (
              <div key={column.name} className={classes.columnRow}>
                <input
                  type="text"
                  defaultValue={column.name}
                  onChange={(e) =>
                    handleUpdateColumn(column.id, e.target.value)
                  }
                />
                <button
                  type="button"
                  className={classes.closeBtn}
                  onClick={() => handleRemoveColumn(column.id)}
                >
                  <CrossIcon />
                </button>
              </div>
            ))}
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

        <button type="button" className="btn btnPrimary">
          Save Changes
        </button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default EditBoardModal;
