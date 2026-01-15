import CrossIcon from "@/assets/icon-cross.svg";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import StatusDropDown from "@/components/ui/StatusDropDown";

import "@/app/globals.css";
import classes from "./TaskForm.module.css";

export default function TaskForm({
  title,
  description,
  subtasks,
  status,
  columns,
  onTitleChange,
  onDescriptionChange,
  onSubtaskChange,
  onSubtaskRemove,
  onAddSubtask,
  onStatusChange,
  actionLabel,
}) {
  return (
    <form className={classes.form}>
      {/* Title */}
      <FormField label="Title" id="title">
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          // placeholder="e.g. Take coffee break"
        />
      </FormField>

      {/* Description */}
      <FormField label="Description" id="description">
        <textarea
          id="description"
          name="description"
          rows="4"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          // placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
        />
      </FormField>

      {/* Subtasks */}
      <FormField id="subtasks" label="Subtasks">
        <div className={classes.subtasksWrapper}>
          {subtasks.map((subtask) => (
            <div key={subtask.id} className={classes.subtaskRow}>
              <Input
                id="subtasks"
                name="subtasks"
                value={subtask.title}
                onChange={(e) => onSubtaskChange(subtask.id, e.target.value)}
              />

              <button
                type="button"
                className={classes.closeBtn}
                onClick={() => onSubtaskRemove(subtask.id)}
              >
                <CrossIcon />
              </button>
            </div>
          ))}

          {subtasks.length <= 5 && (
            <button
              type="button"
              className="btn btnSecondary"
              onClick={onAddSubtask}
            >
              + Add New Subtask
            </button>
          )}
        </div>
      </FormField>

      {/* Status */}
      <div className="formControl">
        <p className={classes.statusLabel}>Status</p>

        <StatusDropDown
          value={status}
          options={columns}
          onChange={onStatusChange}
        />
      </div>

      {/* Primary Action */}
      <button type="button" className="btn btnPrimary">
        {actionLabel}
      </button>
    </form>
  );
}
