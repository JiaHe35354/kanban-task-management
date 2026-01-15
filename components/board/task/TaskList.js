import TaskCard from "./TaskCard";

import classes from "./Task.module.css";

export default function TaskList({ tasks }) {
  return (
    <ul className={classes.taskList}>
      {tasks.map((task) => (
        <TaskCard key={task.title} task={task} />
      ))}
    </ul>
  );
}
