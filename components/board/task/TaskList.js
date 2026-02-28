import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import TaskCard from "./TaskCard";

import classes from "./Task.module.css";
import { useMemo } from "react";

export default function TaskList({ tasks }) {
  const itemIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <ul
      className={`${classes.taskList} ${
        tasks.length === 0 ? classes.emptyList : ""
      }`}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          // <Fragment key={task.id}>
          //   {index === placeholderIndex && activeId && (
          //     <li
          //       className={classes.dropPlaceholder}
          //       style={{
          //         height: activeSize?.height,
          //         width: "100%",
          //       }}
          //     />
          //   )}
          <TaskCard key={task.id} task={task} />
          // </Fragment>
        ))}
      </SortableContext>
    </ul>
  );
}
