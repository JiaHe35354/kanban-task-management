"use client";

import { useContext, useRef, useState } from "react";
import {
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
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
    // if (nextIndex === -1) nextIndex = targetIds.length;
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

  return updates;
}

export default function Board() {
  const [activeId, setActiveId] = useState(null);

  const { tasksById, columnTaskIds } = useContext(BoardStateContext);
  const { reorderColumnTasks, reorderTasksLocal, reorderColumnIds } =
    useContext(BoardActionsContext);

  const lastUpdateRef = useRef(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 12 } }),
  );

  const activeTask = activeId ? tasksById[activeId] : null;

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCol = active.data.current?.sortable?.containerId;
    const overCol = over.data.current?.sortable?.containerId || over.id;
    console.log(activeCol, overCol);

    if (!activeCol || !overCol || !columnTaskIds[overCol]) return;

    // --- SAME COLUMN MOVE ---
    if (activeCol === overCol) {
      const currentIds = columnTaskIds[activeCol];
      const oldIndex = currentIds.indexOf(active.id);
      const newIndex = currentIds.indexOf(over.id);

      // If we are over a task and it's a different position
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const updateKey = `${active.id}-${over.id}-${newIndex}`;
        if (lastUpdateRef.current === updateKey) return;
        lastUpdateRef.current = updateKey;

        const newOrderIds = arrayMove(currentIds, oldIndex, newIndex);
        reorderColumnIds(activeCol, newOrderIds);
      }
    }
    // --- CROSS COLUMN MOVE ---
    else {
      if (tasksById[active.id]?.columnId !== overCol) {
        // Reset the ref when switching columns
        lastUpdateRef.current = null;

        const updates = getIntermediatePayload(
          active.id,
          activeCol,
          over.id,
          overCol,
          columnTaskIds,
        );
        reorderTasksLocal(updates);
      }
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    lastUpdateRef.current = null; // Clear the guard

    if (!over) return;

    const activeCol = active.data.current?.sortable?.containerId;
    const overCol = over.data.current?.sortable?.containerId || over.id;

    // Final snapshot for the Database
    const finalUpdates = [];
    const affectedCols =
      activeCol === overCol ? [activeCol] : [activeCol, overCol];

    affectedCols.forEach((colId) => {
      columnTaskIds[colId]?.forEach((id, index) => {
        finalUpdates.push({ id, columnId: colId, order: index });
      });
    });

    if (finalUpdates.length > 0) {
      await reorderColumnTasks(finalUpdates);
    }
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
      >
        {activeId ? <TaskOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
