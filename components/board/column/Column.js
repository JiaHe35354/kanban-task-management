import { useContext, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

import { BoardStateContext } from "@/context/BoardContext";
import TaskList from "../task/TaskList";

import classes from "./Column.module.css";

export default function Column({ column, activeId, overId, activeSize }) {
  const { tasks } = useContext(BoardStateContext);

  const { setNodeRef } = useDroppable({ id: column.id });

  const sortedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.columnId === column.id)
      .sort((a, b) => a.order - b.order);
  }, [tasks, column.id]);

  const overIndex = sortedTasks.findIndex((t) => t.id === overId);

  const placeholderIndex =
    overIndex > -1 && overIndex < sortedTasks.length - 1 ? overIndex : null;

  return (
    <div ref={setNodeRef}>
      <li className={classes.columnListItem}>
        <div className={classes.columnHeader}>
          <span
            className={classes.dot}
            style={{ backgroundColor: column.color }}
          />
          <p
            className={classes.columnTitle}
          >{`${column.name} (${sortedTasks.length})`}</p>
        </div>

        <TaskList
          tasks={sortedTasks}
          placeholderIndex={placeholderIndex}
          activeId={activeId}
          activeSize={activeSize}
        />
      </li>
    </div>
  );
}
