import { useContext } from "react";

import { BoardContext } from "@/app/context/BoardContext";
import TaskList from "../task/TaskList";

import classes from "./Column.module.css";

export default function Column({ column }) {
  const { tasks } = useContext(BoardContext);

  return (
    <li className={classes.columnListItem}>
      <div className={classes.columnHeader}>
        <span
          className={classes.dot}
          style={{ backgroundColor: column.color }}
        />
        <p
          className={classes.columnTitle}
        >{`${column.name} (${tasks.length})`}</p>
      </div>

      <TaskList tasks={tasks} />
    </li>
  );
}
