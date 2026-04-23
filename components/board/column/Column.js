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
  const { columnTaskIds } = useContext(BoardStateContext);

  // Get only the IDs
  const taskIds = useMemo(
    () => columnTaskIds?.[column.id] ?? [],
    [columnTaskIds, column.id],
  );

  // Tell dnd-kit this is a Column and pass its ID for handleDragOver/End
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      columnId: column.id,
    },
  });

  return (
    <li className={classes.columnListItem}>
      <div className={classes.columnHeader}>
        <span
          className={classes.dot}
          style={{ backgroundColor: column.color }}
        />
        <p
          className={classes.columnTitle}
        >{`${column.name} (${taskIds.length})`}</p>
      </div>

      <div ref={setNodeRef} className={classes.columnBody}>
        <SortableContext
          id={column.id}
          items={taskIds} // dnd-kit works best when items is just a list of IDs
          strategy={verticalListSortingStrategy}
        >
          <TaskList taskIds={taskIds} />
        </SortableContext>
      </div>
    </li>
  );
}

export default memo(Column);
