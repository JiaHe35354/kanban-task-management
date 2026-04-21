import { memo, useContext, useMemo } from "react";
import { BoardStateContext } from "@/context/board/BoardProvider";
import { useDroppable } from "@dnd-kit/core";

import TaskList from "../task/TaskList";

import classes from "./Column.module.css";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function Column({ column }) {
  const { tasksById, columnTaskIds } = useContext(BoardStateContext);

  const taskIds = useMemo(
    () => columnTaskIds?.[column.id] ?? [],
    [columnTaskIds, column.id],
  );

  const columnTasks = useMemo(() => {
    return taskIds.map((id) => tasksById[id]).filter(Boolean);
  }, [taskIds, tasksById]);

  const tasksCount = columnTasks.length;

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      columnId: column.id,
    },
  });

  return (
    <li ref={setNodeRef} className={classes.columnListItem}>
      <div className={classes.columnHeader}>
        <span
          className={classes.dot}
          style={{ backgroundColor: column.color }}
        />
        <p
          className={classes.columnTitle}
        >{`${column.name} (${tasksCount})`}</p>
      </div>

      <SortableContext
        id={column.id}
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <TaskList tasks={columnTasks} />
      </SortableContext>
    </li>
  );
}

export default memo(Column);
