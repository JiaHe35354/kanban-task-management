import TaskList from "../task/TaskList";

import classes from "./Column.module.css";

export default function Column({ column }) {
  return (
    <li className={classes.columnListItem}>
      <div className={classes.columnHeader}>
        <span
          className={classes.dot}
          style={{ backgroundColor: column.color }}
        />
        <p className={classes.columnTitle}>{column.name}</p>
      </div>

      <TaskList tasks={column.tasks} />
    </li>
  );
}
