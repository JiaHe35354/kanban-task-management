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

import { BoardActionsContext } from "@/context/board/BoardProvider";
import StatusDropDown from "@/components/ui/StatusDropDown";
import CrossIcon from "@/assets/icon-cross.svg";

import "@/app/globals.css";
import classes from "./EditTaskModal.module.css";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useModalCleanup } from "@/hooks/useModalCleanup";
import { useTaskModal } from "@/context/board/TaskModalContext";

const EditTaskModal = forwardRef(function EditTaskModal(
  { task, columns, currentColumn },
  ref,
) {
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dialog = useRef();

  const { editTask } = useContext(BoardActionsContext);

  const isMobile = useMediaQuery("(max-width: 46.25em)");
  const { closeTaskModal } = useTaskModal();

  function createFormState(taskData) {
    return {
      title: taskData.title,
      description: taskData.description,
      subtasks: taskData.subtasks?.map((s) => ({ ...s })) ?? [],
      columnId: taskData.columnId,
    };
  }

  function resetForm() {
    if (!task) return;
    setForm(createFormState(task));
    setSubmitted(false);
    setFormError(null);
  }

  const { handleBackdropClick, handleEscKey } = useModalCleanup(
    dialog,
    resetForm,
    closeTaskModal,
  );

  useEffect(() => {
    if (task) {
      setForm(createFormState(task));
      setFormError(null);
    }
  }, [task?.id]);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        if (!dialog.current?.open) {
          dialog.current.showModal();
        }
      },
      close: () => {
        if (dialog.current?.open) {
          dialog.current.close();
        }
      },
    };
  });

  if (!task || !form) return null;

  const titleInvalid = !form?.title?.trim();
  const hasEmptySubtask = form?.subtasks?.some((s) => !s.title.trim());
  const selectedColumn = columns.find((c) => c.id === form?.columnId);

  const isTitleChanged = form?.title !== task.title;
  const isDescriptionChanged = form?.description !== task.description;
  const isSubChanged =
    form.subtasks.length !== (task.subtasks?.length || 0) ||
    form.subtasks.some((sub, index) => {
      const original = task.subtasks?.[index];
      return sub.title !== original?.title || sub.id !== original?.id;
    });
  const isStatusChanged = form?.columnId !== task.columnId;

  const isDataChanged =
    isTitleChanged || isDescriptionChanged || isSubChanged || isStatusChanged;

  function handleAddSubtask() {
    setForm((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: crypto.randomUUID(), title: "", isCompleted: false },
      ],
    }));
  }

  function handleUpdateSubtask(id, value) {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === id ? { ...s, title: value } : s,
      ),
    }));
  }

  function handleRemoveSubtask(id) {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (titleInvalid || hasEmptySubtask) return;

    const modal = dialog.current;

    setIsSaving(true);
    try {
      await editTask({
        taskId: task.id,
        title: form.title,
        description: form.description,
        status: form.columnId,
        subtasks: form.subtasks,
      });

      modal?.close();
      closeTaskModal();
    } catch (err) {
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

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
        <h4 className="modalHeading">Edit Task</h4>

        {isMobile && (
          <button
            type="button"
            className="modalCloseBtn"
            disabled={isSaving}
            onClick={() => {
              resetForm();
              dialog.current.close();
              closeTaskModal();
            }}
            aria-label="Close modal"
          >
            <CrossIcon />
          </button>
        )}
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="title">Title</label>
          <div className={classes.inputWrapper}>
            <input
              id="title"
              value={form?.title ?? ""}
              disabled={isSaving}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className={submitted && titleInvalid ? classes.inputError : ""}
            />
            {submitted && titleInvalid && (
              <p className={classes.errorText}>Can&apos;t be empty</p>
            )}
          </div>
        </div>

        <div className="formControl">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form?.description ?? ""}
            disabled={isSaving}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="formControl">
          <label>Subtasks</label>

          <div className={classes.subtasksWrapper}>
            {form?.subtasks?.map((subtask) => {
              const isInvalid = submitted && !subtask.title.trim();

              return (
                <div key={subtask.id} className={classes.subtaskRow}>
                  <div className={classes.inputWrapper}>
                    <input
                      value={subtask.title}
                      disabled={isSaving}
                      onChange={(e) =>
                        handleUpdateSubtask(subtask.id, e.target.value)
                      }
                      className={isInvalid ? classes.inputError : ""}
                    />
                    {isInvalid && (
                      <p className={classes.errorText}>Can&apos;t be empty</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${classes.closeBtn} ${
                      isInvalid ? classes.btnError : ""
                    }`}
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    disabled={isSaving}
                  >
                    <CrossIcon />
                  </button>
                </div>
              );
            })}
          </div>

          {form?.subtasks?.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              disabled={isSaving}
              onClick={handleAddSubtask}
            >
              + Add New Subtask
            </button>
          )}
        </div>

        <div className="formControl">
          <p className={classes.statusLabel}>Status</p>

          <StatusDropDown
            value={selectedColumn?.name || currentColumn?.name}
            options={columns}
            onChange={(columnId) =>
              setForm((prev) => ({ ...prev, columnId: columnId }))
            }
            disabled={isSaving}
          />
        </div>

        {formError && <p className="formErrorText">{formError}</p>}

        <button
          className="btn btnPrimary"
          disabled={!isDataChanged || isSaving}
        >
          {isSaving ? "Saving" : "Save Changes"}
        </button>
      </form>
    </dialog>,
    modalRoot,
  );
});

export default EditTaskModal;
