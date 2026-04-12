"use client";

import { useContext, useState } from "react";
import {
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import {
  BoardStateContext,
  BoardActionsContext,
} from "@/context/board/BoardProvider";
import { TaskModalProvider } from "@/context/board/TaskModalContext";
import TaskOverlay from "./task/TaskOverlay";
import TaskModalsHost from "./task/TaskModalHost";
import ColumnList from "./column/ColumnList";

import classes from "./Board.module.css";

function getIntermediatePayload(
  activeId,
  activeCol,
  overId,
  overCol,
  columnTaskIds,
) {
  const sourceIds = [...(columnTaskIds[activeCol] || [])];
  const targetIds = [...(columnTaskIds[overCol] || [])];

  // 1. Remove the active task from its original list
  const activeIndex = sourceIds.indexOf(activeId);
  if (activeIndex !== -1) sourceIds.splice(activeIndex, 1);

  // 2. Find where to insert it in the new list
  let nextIndex;

  // If the 'over' target is the column itself (dragging to empty space at bottom)
  if (overId === overCol) {
    nextIndex = targetIds.length;
  } else {
    nextIndex = targetIds.indexOf(overId);
    // If we can't find the task we're over, default to the bottom
    if (nextIndex === -1) nextIndex = targetIds.length;
  }

  // 3. Insert into the new position
  targetIds.splice(nextIndex, 0, activeId);

  // 4. Build the payload for the database
  const updates = [];

  // Re-index source column
  sourceIds.forEach((id, i) => {
    updates.push({ id, columnId: activeCol, order: i });
  });

  // Re-index target column
  targetIds.forEach((id, i) => {
    updates.push({ id, columnId: overCol, order: i });
  });

  console.log(updates);
  return updates;
}

export default function Board() {
  const [activeId, setActiveId] = useState(null);

  const { tasksById, columnTaskIds } = useContext(BoardStateContext);
  const { reorderColumnTasks, reorderTasksLocal } =
    useContext(BoardActionsContext);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const activeTask = activeId ? tasksById[activeId] : null;

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // This comes from dnd-kit’s live internal state:
    const activeCol = active.data.current?.sortable?.containerId;
    const overCol = over.data.current?.sortable?.containerId || over.id;

    if (!activeCol || !overCol) return;

    const isRealColumn = !!columnTaskIds[overCol];

    if (!isRealColumn) return;

    // Moving between columns
    if (activeCol && overCol && activeCol !== overCol) {
      const updates = getIntermediatePayload(
        active.id,
        activeCol,
        over.id,
        overCol,
        columnTaskIds,
      );

      if (updates) {
        reorderTasksLocal(updates);
      }
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = active.data.current?.sortable?.containerId;
    const overCol = over.data.current?.sortable?.containerId || over.id;

    if (!activeCol || !overCol) return;

    // 1. Get the current IDs from the STATE (which was updated by onDragOver)
    const sourceIds = columnTaskIds[activeCol] || [];
    const targetIds = columnTaskIds[overCol] || [];

    const finalUpdates = [];

    // 2. Build updates for source column
    sourceIds.forEach((id, i) => {
      finalUpdates.push({ id, columnId: activeCol, order: i });
    });

    // 3. Build updates for target column (if different)
    if (activeCol !== overCol) {
      targetIds.forEach((id, i) => {
        finalUpdates.push({ id, columnId: overCol, order: i });
      });
    }

    // 4. Send to DB
    if (finalUpdates.length > 0) {
      console.log("SYNCING TO DB:", finalUpdates);
      await reorderColumnTasks(finalUpdates);
    }

    // if (activeCol === overCol) {
    //   const targetIds = [...(columnTaskIds[overCol] || [])];
    //   const oldIndex = targetIds.indexOf(activeId);
    //   let newIndex = targetIds.indexOf(overId);
    //   if (newIndex === -1) newIndex = targetIds.length;

    //   // Only update if the position actually changed
    //   if (oldIndex !== newIndex && oldIndex !== -1) {
    //     const newOrderIds = arrayMove(targetIds, oldIndex, newIndex);

    //     finalUpdates = newOrderIds.map((id, index) => ({
    //       id,
    //       columnId: activeCol,
    //       order: index,
    //     }));
    //   }
    // } else {
    //   // CROSS COLUMN UPDATING:
    //   finalUpdates = getIntermediatePayload(
    //     activeId,
    //     activeCol,
    //     overId,
    //     overCol,
    //     columnTaskIds,
    //   );
    // }

    // console.log("Final Updates Generated:", finalUpdates);

    // if (finalUpdates && finalUpdates.length > 0) {
    //   // Instant UI update
    //   reorderTasksLocal(finalUpdates);

    //   // Database sync
    //   await reorderColumnTasks(finalUpdates);
    // }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={(e) => {
        setActiveId(e.active.id);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <TaskModalProvider>
        <div className={classes.board}>
          <ColumnList />
        </div>

        <TaskModalsHost />
      </TaskModalProvider>

      <DragOverlay
        dropAnimation={{
          ...defaultDropAnimation,
          duration: 400,
          easing: "ease",
        }}
        // wrapperElement="ul"
      >
        {activeId ? <TaskOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
