import TaskCard from "./TaskCard";

import classes from "./Task.module.css";

export default function TaskList({ taskIds }) {
  return (
    <ul
      className={`${classes.taskList} ${
        taskIds.length === 0 ? classes.emptyList : ""
      }`}
    >
      {taskIds.map((id) => (
        <TaskCard key={id} id={id} />
      ))}
    </ul>
  );
}
