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

import {
  BoardStateContext,
  BoardActionsContext,
} from "@/context/board/BoardProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useModalCleanup } from "@/hooks/useModalCleanup";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./NewColumnModal.module.css";

const NewColumnModal = forwardRef(function NewColumnModal({}, ref) {
  const [cols, setCols] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const { columns, activeBoard } = useContext(BoardStateContext);
  const { updateColumns } = useContext(BoardActionsContext);

  const dialog = useRef();

  const isMobile = useMediaQuery("(max-width: 46.25em)");

  const { handleBackdropClick, handleEscKey } = useModalCleanup(
    dialog,
    resetForm,
  );

  const getFormData = () => {
    if (!columns) return;
    setCols(columns.map((c) => ({ ...c })));
  };

  useEffect(() => setMounted(true), []);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        if (!activeBoard) return;

        getFormData();

        dialog.current.showModal();
      },
      close: () => dialog.current.close(),
    };
  });

  function resetForm() {
    setSubmitted(false);
    setFormError(null);
    getFormData();
  }

  const handleAddColumn = () =>
    setCols((p) => [...p, { id: crypto.randomUUID(), name: "" }]);
  const handleRemoveColumn = (id) =>
    setCols((p) => p.filter((c) => c.id !== id));
  const handleUpdateColumn = (id, val) => {
    setCols((p) => p.map((c) => (c.id === id ? { ...c, name: val } : c)));
    setSubmitted(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    const hasEmptyColumn = cols.some((c) => !c.name.trim());
    if (hasEmptyColumn) return;

    setIsSaving(true);
    try {
      await updateColumns(activeBoard.id, cols);
      dialog.current.close();
    } catch (err) {
      setFormError("Failed to update columns. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  const areColumnsChanged =
    cols.length !== columns.length ||
    cols.some((col, index) => {
      const original = columns[index];
      return col.name !== original?.name || col.id !== original?.id;
    });

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <dialog
      ref={dialog}
      className="modal"
      onClick={!isSaving ? handleBackdropClick : undefined}
      onCancel={isSaving ? (e) => e.preventDefault() : handleEscKey}
    >
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Column</h4>

        {isMobile && (
          <button
            type="button"
            className="modalCloseBtn"
            disabled={isSaving}
            onClick={() => !isSaving && dialog.current.close()}
            aria-label="Close modal"
          >
            <CrossIcon />
          </button>
        )}
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
                      disabled={isSaving}
                      onChange={(e) =>
                        handleUpdateColumn(col.id, e.target.value)
                      }
                      className={isInvalid ? classes.inputError : ""}
                    />
                    {isInvalid && (
                      <p className={classes.errorText}>Can't be empty</p>
                    )}
                  </div>

                  {cols.length > 1 && (
                    <button
                      type="button"
                      className={`${classes.closeBtn} ${
                        isInvalid ? classes.btnError : ""
                      }`}
                      disabled={isSaving}
                      onClick={() => handleRemoveColumn(col.id)}
                    >
                      <CrossIcon />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {cols.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              disabled={isSaving}
              onClick={handleAddColumn}
            >
              + Add New Column
            </button>
          )}
        </div>

        {formError && <p className="formErrorText">{formError}</p>}

        <button
          className="btn btnPrimary"
          disabled={!areColumnsChanged || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default NewColumnModal;
