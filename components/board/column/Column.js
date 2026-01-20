import { useSelector } from "react-redux";
import TaskList from "../task/TaskList";

import classes from "./Column.module.css";
import { selectTasksOfActiveBoard } from "@/store/boardSelector";

export default function Column({ column }) {
  const tasks = useSelector(selectTasksOfActiveBoard);

  const columnTasks = tasks.filter((task) => task.columnId === column.id);

  const numOfTasks = columnTasks.length;

  return (
    <li className={classes.columnListItem}>
      <div className={classes.columnHeader}>
        <span
          className={classes.dot}
          style={{ backgroundColor: column.color }}
        />
        <p
          className={classes.columnTitle}
        >{`${column.name} (${numOfTasks})`}</p>
      </div>

      <TaskList tasks={columnTasks} />
    </li>
  );
}
