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
import CrossIcon from "@/assets/icon-cross.svg";
import StatusDropDown from "@/components/ui/StatusDropDown";

import "@/app/globals.css";
import { useModalCleanup } from "@/hooks/useModalCleanup";

const NewTaskModal = forwardRef(function NewTaskModal({}, ref) {
  const { columns, isDataLoading } = useContext(BoardStateContext);
  const { createNewTask } = useContext(BoardActionsContext);

  const dialog = useRef();

  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subtasks: [{ id: crypto.randomUUID(), title: "" }],
    status: "",
  });

  const isMobile = useMediaQuery("(max-width: 46.25em)");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (
      columns.length > 0 &&
      !columns.some((col) => col.id === formData.status)
    ) {
      setFormData((prev) => ({ ...prev, status: columns[0].id }));
    }
  }, [columns, formData.status]);

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      subtasks: [{ id: crypto.randomUUID(), title: "" }],
      status: columns[0]?.id || "",
    });

    setSubmitted(false);
    setFormError(null);
  }

  const { handleBackdropClick, handleEscKey } = useModalCleanup(
    dialog,
    resetForm,
  );

  useImperativeHandle(ref, () => {
    return {
      open: () => dialog.current.showModal(),
      close: () => dialog.current.close(),
    };
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddSubtask() {
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: "" }],
    }));
  }

  function handleUpdateSubtask(id, value) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === id ? { ...s, title: value } : s,
      ),
    }));
  }

  function handleRemoveSubtask(id) {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }));
  }

  const titleInvalid = !formData.title.trim();
  const hasEmptySubtask = formData.subtasks.some((s) => !s.title.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (titleInvalid || hasEmptySubtask) return;

    try {
      await createNewTask(formData);

      resetForm();
      dialog.current.close();
    } catch (err) {
      setFormError("Failed to create task. Please try again.");
    }
  }

  if (!mounted || columns.length === 0) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  const selectedColumn =
    columns.find((c) => c.id === formData.status) || columns[0];

  return createPortal(
    <dialog
      ref={dialog}
      className="modal"
      onClick={!isDataLoading ? handleBackdropClick : undefined}
      onCancel={isDataLoading ? (e) => e.preventDefault() : handleEscKey}
    >
      <header className="modalHeader">
        <h4 className="modalHeading">Add New Task</h4>

        {isMobile && (
          <button
            type="button"
            className="modalCloseBtn"
            onClick={resetForm}
            disabled={isDataLoading}
            aria-label="Close modal"
          >
            <CrossIcon />
          </button>
        )}
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="title">Title</label>

          <div className="inputWrapper">
            <input
              id="title"
              name="title"
              value={formData.title}
              disabled={isDataLoading}
              className={submitted && titleInvalid ? "inputError" : ""}
              onChange={handleChange}
              placeholder="e.g. Take coffee break"
            />

            {submitted && titleInvalid && (
              <p className="errorText">Can't be empty</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            disabled={isDataLoading}
            onChange={handleChange}
            rows="4"
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
          />
        </div>

        <div className="formControl">
          <label htmlFor="subtasks">Subtasks</label>

          <div className="rowsWrapper">
            {formData.subtasks.map((subtask) => {
              const isInvalid = submitted && !subtask.title.trim();

              return (
                <div key={subtask.id} className="row">
                  <div className="inputWrapper">
                    <input
                      id="subtasks"
                      value={subtask.title}
                      disabled={isDataLoading}
                      className={isInvalid ? "inputError" : ""}
                      onChange={(e) =>
                        handleUpdateSubtask(subtask.id, e.target.value)
                      }
                    />
                    {isInvalid && <p className="errorText">Can't be empty</p>}
                  </div>

                  {formData.subtasks.length > 1 && (
                    <button
                      type="button"
                      disabled={isDataLoading}
                      className={`closeBtn ${isInvalid ? "errorBtn" : ""}`}
                      onClick={() => handleRemoveSubtask(subtask.id)}
                    >
                      <CrossIcon />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {formData.subtasks.length <= 5 && (
            <button
              type="button"
              disabled={isDataLoading}
              className="btn btnSecondary"
              onClick={handleAddSubtask}
            >
              + Add New Subtask
            </button>
          )}
        </div>

        <div className="formControl">
          <label className="statusLabel">Status</label>

          <StatusDropDown
            value={selectedColumn?.name}
            options={columns}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, status: val }))
            }
            disabled={isDataLoading}
          />
        </div>

        {formError && <p className="formErrorText">{formError}</p>}

        <button className="btn btnPrimary" disabled={isDataLoading}>
          {isDataLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default NewTaskModal;
