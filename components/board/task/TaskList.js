import TaskCard from "./TaskCard";

import classes from "./Task.module.css";

export default function TaskList({ tasks }) {
  return (
    <ul
      className={`${classes.taskList} ${
        tasks.length === 0 ? classes.emptyList : ""
      }`}
    >
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
}
