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

const EditBoardModal = forwardRef(function EditBoardModal({}, ref) {
  const [boardName, setBoardName] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [cols, setCols] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  const { columns, activeBoard, isDataLoading } = useContext(BoardStateContext);
  const { editBoard } = useContext(BoardActionsContext);

  const dialog = useRef();
  const isMobile = useMediaQuery("(max-width: 46.25em)");

  function getFormData() {
    setBoardName(activeBoard.name);
    setCols(columns.map((column) => ({ ...column })));
    setSubmitted(false);
    setIsDuplicate(false);
    setFormError(null);
  }

  const { handleBackdropClick, handleEscKey } = useModalCleanup(
    dialog,
    resetForm,
  );

  useEffect(() => setMounted(true), []);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        getFormData();
        dialog.current.showModal();
      },
      close: () => dialog.current.close(),
    };
  });

  const isNameChanged = boardName !== activeBoard?.name;
  const areColumnsChanged =
    cols.length !== columns.length ||
    cols.some((col, index) => {
      const original = columns[index];
      return col.name !== original?.name || col.id !== original?.id;
    });

  const isDataChanged = isNameChanged || areColumnsChanged;

  const boardNameInvalid = !boardName.trim();
  const hasEmptyColumn = cols.some((c) => !c.name.trim());

  function resetForm() {
    getFormData();
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (boardNameInvalid || hasEmptyColumn) return;

    try {
      await editBoard({
        boardId: activeBoard.id,
        name: boardName,
        columns: cols,
      });

      dialog.current.close();
    } catch (err) {
      if (err.message === "BOARD_EXISTS") {
        setIsDuplicate(true);
      } else {
        setFormError("Failed to update board. Please try again.");
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
        if (isDataLoading) return;
        handleBackdropClick(e);
      }}
      onCancel={(e) => {
        if (isDataLoading) {
          e.preventDefault();
        } else {
          handleEscKey();
        }
      }}
    >
      <header className="modalHeader">
        <h4 className="modalHeading">Edit Board</h4>

        {isMobile && (
          <button
            type="button"
            className="modalCloseBtn"
            disabled={isDataLoading}
            onClick={() => {
              if (!isDataLoading) dialog.current.close();
            }}
            aria-label="Close modal"
          >
            <CrossIcon />
          </button>
        )}
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="name">Board Name</label>
          <div className="inputWrapper">
            <input
              type="text"
              id="name"
              name="name"
              disabled={isDataLoading}
              value={boardName}
              onChange={(e) => {
                setBoardName(e.target.value);
                if (isDuplicate) setIsDuplicate(false);
              }}
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
          <label htmlFor="columns">Board Columns</label>

          <ul className="rowsWrapper">
            {cols.map((col) => {
              const isInvalid = submitted && !col.name.trim();

              return (
                <li key={col.id} className="row">
                  <div className="inputWrapper">
                    <input
                      type="text"
                      disabled={isDataLoading}
                      value={col.name}
                      onChange={(e) =>
                        handleUpdateColumn(col.id, e.target.value)
                      }
                      className={isInvalid ? "inputError" : ""}
                    />
                    {isInvalid && <p className="errorText">Can't be empty</p>}
                  </div>
                  {cols.length > 1 && (
                    <button
                      type="button"
                      disabled={isDataLoading}
                      className={`closeBtn ${isInvalid ? "errorBtn" : ""}`}
                      onClick={() => handleRemoveColumn(col.id)}
                    >
                      <CrossIcon />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {cols.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              disabled={isDataLoading}
              onClick={handleAddColumn}
            >
              + Add New Column
            </button>
          )}
        </div>

        {formError && <p className="formErrorText">{formError}</p>}

        <button
          className="btn btnPrimary"
          disabled={!isDataChanged || isDataLoading}
        >
          {isDataLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default EditBoardModal;
