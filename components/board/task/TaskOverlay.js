import { getSubtaskStats } from "@/utils/taskHelper";

import classes from "./Task.module.css";

function TaskOverlay({ task }) {
  const { total, completed } = getSubtaskStats(task.subtasks);

  return (
    <>
      <li className={classes.taskListItem}>
        <button type="button" className={classes.taskBtn}>
          <h3 className={classes.taskTitle}>{task.title}</h3>
          <p className={classes.subtaskTitle}>
            {completed} of {total} subtasks
          </p>
        </button>
      </li>
    </>
  );
}

export default TaskOverlay;
