import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import "@/app/globals.css";
import classes from "./DeleteBoardModal.module.css";

const DeleteBoardModal = forwardRef(function DeleteBoardModal(
  { boardName },
  ref
) {
  const dialog = useRef();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialog} className="modal">
      <header className="modalHeader">
        <h4 className="modalHeading headingDanger">Delete this board?</h4>
      </header>

      <section>
        <p className="deleteText">
          {`Are you sure you want to delete the "${boardName}" board? This
          action will remove all columns and tasks and cannot be reversed.`}
        </p>

        <div className="btnGroup">
          <button className="btn btnDanger">Delete</button>
          <button className="btn btnSecondary">Cancel</button>
        </div>
      </section>
    </dialog>,
    modalRoot
  );
});

export default DeleteBoardModal;
