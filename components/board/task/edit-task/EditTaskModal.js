import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

import { selectColumnsOfActiveBoard } from "@/store/boardSelector";
import StatusDropDown from "@/components/ui/StatusDropDown";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./EditTaskModal.module.css";

const EditTaskModal = forwardRef(function EditTaskModal({ task }, ref) {
  const [mounted, setMounted] = useState(false);
  const dialog = useRef();

  const columns = useSelector(selectColumnsOfActiveBoard);

  useEffect(() => {
    setMounted(true);
  });

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
        <h4 className="modalHeading">Edit Task</h4>
      </header>

      <form className="form">
        <div className="formControl">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" value={task.title} />
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder={task.description}
          />
        </div>

        <div className="formControl">
          <label htmlFor="subtasks">Subtasks</label>

          <div className={classes.subtasksWrapper}>
            {task.subtasks.map((subtask) => (
              <div key={subtask.title} className={classes.subtaskRow}>
                <input
                  type="text"
                  id="subtasks"
                  name="subtasks"
                  value={subtask.title}
                />
                <button type="button" className={classes.closeBtn}>
                  <CrossIcon />
                </button>
              </div>
            ))}
          </div>

          {task.subtasks.length <= 5 && (
            <button type="button" className="btn btnSecondary">
              + Add New Subtask
            </button>
          )}
        </div>

        <div className="formControl">
          <p className={classes.statusLabel}>Status</p>

          <StatusDropDown value={task.status} options={columns} />
        </div>

        <button type="button" className="btn btnPrimary">
          Save Changes
        </button>
      </form>
    </dialog>,
    modalRoot
  );
});

export default EditTaskModal;
