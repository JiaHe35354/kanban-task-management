import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { BoardActionsContext } from "@/context/BoardContext";

const DeleteTaskModal = forwardRef(function DeleteTaskModal({ task }, ref) {
  const { deleteTask } = useContext(BoardActionsContext);

  const [mounted, setMounted] = useState(false);
  const dialog = useRef();

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

  function handleDeleteTask(taskId) {
    deleteTask(taskId);
    dialog.current.close();
  }

  function handleCancel() {
    dialog.current.close();
  }

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal" onClick={handleBackdropClick}>
      <header className="modalHeader">
        <h4 className="modalHeading headingDanger">Delete this task?</h4>
      </header>

      <section>
        <p className="deleteText">
          {`Are you sure you want to delete the "${task.title}" task and its subtasks? This action cannot be 
          reversed.`}
        </p>

        <div className="btnGroup">
          <button
            className="btn btnDanger"
            onClick={() => handleDeleteTask(task.id)}
          >
            Delete
          </button>
          <button className="btn btnSecondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </section>
    </dialog>,
    modalRoot,
  );
});

export default DeleteTaskModal;
