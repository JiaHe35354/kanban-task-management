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
  BoardActionsContext,
  BoardStateContext,
} from "@/context/board/BoardProvider";
import { useModalCleanup } from "@/hooks/useModalCleanup";

import "@/app/globals.css";

const DeleteBoardModal = forwardRef(function DeleteBoardModal(_, ref) {
  const { boards, isDataLoading } = useContext(BoardStateContext);
  const { deleteBoard } = useContext(BoardActionsContext);

  const dialog = useRef();

  const [boardId, setBoardId] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [formError, setFormError] = useState(null);

  const { handleBackdropClick } = useModalCleanup(dialog);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: (id) => {
        const activeBoard = boards.find((b) => b.id === id);

        setSelectedBoard(activeBoard);
        setBoardId(id);
        setFormError(null);

        dialog.current.showModal();
      },
      close: () => dialog.current.close(),
    };
  });

  async function handleDeleteBoard() {
    if (!boardId) return;
    setFormError(null);

    try {
      await deleteBoard(boardId);

      dialog.current.close();
    } catch (err) {
      setFormError("Failed to delete board. Please try again.");
    }
  }

  function handleCancel() {
    dialog.current.close();
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
        if (isDataLoading) e.preventDefault();
      }}
    >
      <header className="modalHeader">
        <h4 className="modalHeading headingDanger">Delete this board?</h4>
      </header>

      <section>
        <p className="deleteText">
          {`Are you sure you want to delete the "${selectedBoard?.name}" board? This
          action will remove all columns and tasks and cannot be reversed.`}
        </p>

        {formError && <p className="formErrorText mb-2">{formError}</p>}

        <div className="btnGroup">
          <button
            className="btn btnDanger"
            disabled={isDataLoading}
            onClick={handleDeleteBoard}
          >
            {isDataLoading ? "Deleting..." : "Delete"}
          </button>
          <button
            className="btn btnSecondary"
            disabled={isDataLoading}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </section>
    </dialog>,
    modalRoot,
  );
});

export default DeleteBoardModal;
