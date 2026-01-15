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
import classes from "./NewBoardModal.module.css";

const NewBoardModal = forwardRef(function NewBoardModal({}, ref) {
  const dialog = useRef();

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
    <dialog ref={dialog} className="modal">
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Board</h4>
      </header>

      <form className="form">
        <div className="formControl">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Web Design"
          />
        </div>

        <div className="formControl">
          <label htmlFor="columns">Columns</label>

          <div className={classes.columnsWrapper}>
            {columns.map((column) => (
              <div key={column.id} className={classes.columnRow}>
                <input
                  type="text"
                  value={column.name}
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
          Create New Board
        </button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default NewBoardModal;
