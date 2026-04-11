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

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useModalCleanup } from "@/hooks/useModalCleanup";
import {
  BoardActionsContext,
  BoardStateContext,
} from "@/context/board/BoardProvider";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";

const NewBoardModal = forwardRef(function NewBoardModal({}, ref) {
  const [boardName, setBoardName] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [columns, setColumns] = useState([
    { id: crypto.randomUUID(), name: "" },
  ]);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  const { isDataLoading } = useContext(BoardStateContext);
  const { createNewBoard } = useContext(BoardActionsContext);

  const dialog = useRef();
  const isMobile = useMediaQuery("(max-width: 46.25em)");

  useEffect(() => setMounted(true), []);

  const resetForm = () => {
    setSubmitted(false);
    setBoardName("");
    setIsDuplicate(false);
    setFormError(null);
    setColumns([{ id: crypto.randomUUID(), name: "" }]);
  };

  const { handleBackdropClick, handleEscKey } = useModalCleanup(
    dialog,
    resetForm,
  );

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        resetForm();
        dialog.current.showModal();
      },
      close: () => dialog.current.close(),
    };
  });

  function handleBoardNameChange(e) {
    setBoardName(e.target.value);
    setIsDuplicate(false);
  }

  function handleAddColumn() {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
    setSubmitted(false);
  }

  function handleUpdateColumn(id, value) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name: value } : col)),
    );
  }

  function handleRemoveColumn(id) {
    setColumns((prev) => prev.filter((col) => col.id !== id));
  }

  const boardNameInvalid = !boardName.trim();
  const hasEmptyCol = columns.some((c) => !c.name.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (boardNameInvalid || hasEmptyCol) return;

    try {
      await createNewBoard({ boardName, columns });
      dialog.current.close();
    } catch (err) {
      if (err.message === "BOARD_EXISTS") {
        setIsDuplicate(true);
      } else {
        setFormError("Failed to create board. Please check your connection.");
      }
    }
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <dialog
      ref={dialog}
      className="modal"
      onClick={(e) => {
        !isDataLoading ? handleBackdropClick(e) : undefined;
      }}
      onCancel={(e) => {
        isDataLoading ? e.preventDefault() : handleEscKey();
      }}
    >
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Board</h4>

        {isMobile && (
          <button
            type="button"
            className="modalCloseBtn"
            disabled={isDataLoading}
            onClick={() => {
              !isDataLoading && dialog.current.close();
            }}
            aria-label="Close modal"
          >
            <CrossIcon />
          </button>
        )}
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="name">Name</label>

          <div className="inputWrapper">
            <input
              type="text"
              id="name"
              placeholder="e.g. Web Design"
              disabled={isDataLoading}
              value={boardName}
              onChange={handleBoardNameChange}
              className={
                submitted && (boardNameInvalid || isDuplicate)
                  ? "inputError"
                  : ""
              }
            />
            {submitted && boardNameInvalid && (
              <p className="errorText">Can't be empty</p>
            )}
            {submitted && isDuplicate && (
              <p className="errorText">Name already used</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label>Columns</label>

          <div className="rowsWrapper">
            {columns.map((column) => {
              const isInvalid = submitted && !column.name.trim();

              return (
                <div key={column.id} className="row">
                  <div className="inputWrapper">
                    <input
                      type="text"
                      value={column.name}
                      disabled={isDataLoading}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, e.target.value)
                      }
                      className={isInvalid ? "inputError" : ""}
                    />
                    {isInvalid && <p className="errorText">Can't be empty</p>}
                  </div>

                  {columns.length > 1 && (
                    <button
                      type="button"
                      className={`closeBtn ${isInvalid ? "errorBtn" : ""}`}
                      disabled={isDataLoading}
                      onClick={() => handleRemoveColumn(column.id)}
                    >
                      <CrossIcon />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {columns.length <= 5 && (
            <button
              type="button"
              disabled={isDataLoading}
              className="btn btnSecondary"
              onClick={handleAddColumn}
            >
              + Add New Column
            </button>
          )}
        </div>

        {formError && <p className="formErrorText">{formError}</p>}

        <button className="btn btnPrimary" disabled={isDataLoading}>
          {isDataLoading ? "Creating..." : "Create New Board"}
        </button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default NewBoardModal;
