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

  // function handleDragOver(event) {
  //   const { active, over } = event;
  //   if (!over || active.id === over.id) return;

  //   // This comes from dnd-kit’s live internal state:
  //   const activeCol = active.data.current?.sortable?.containerId;
  //   const overCol = over.data.current?.sortable?.containerId || over.id;
  //   console.log("ACTIVE COL:", activeCol, "OVER COL:", overCol);

  //   if (!activeCol || !overCol) return;

  //   // Check if the thing user is currently hovering over (overCol) actually exists as a key in the state (columnTaskIds).
  //   const isRealColumn = !!columnTaskIds[overCol];

  //   if (!isRealColumn) return;

  //   // Moving between columns
  //   if (activeCol && overCol && activeCol !== overCol) {
  //     const updates = getIntermediatePayload(
  //       active.id,
  //       activeCol,
  //       over.id,
  //       overCol,
  //       columnTaskIds,
  //     );

  //     if (updates) {
  //       reorderTasksLocal(updates);
  //     }
  //   }
  // }

  // async function handleDragEnd(event) {
  //   const { active, over } = event;
  //   setActiveId(null);

  //   if (!over) return;

  //   const activeId = active.id;
  //   const overId = over.id;

  //   // Use the containerId (column id) from dnd-kit data
  //   const activeCol = active.data.current?.sortable?.containerId;
  //   const overCol = over.data.current?.sortable?.containerId || over.id;

  //   if (!activeCol || !overCol) return;

  //   let finalUpdates = [];

  //   if (activeCol === overCol) {
  //     // --- SAME COLUMN REORDERING ---
  //     const currentIds = [...(columnTaskIds[activeCol] || [])];
  //     const oldIndex = currentIds.indexOf(activeId);

  //     let newIndex = currentIds.indexOf(overId);

  //     // If dropping over the column container
  //     if (newIndex === -1) newIndex = currentIds.length - 1;

  //     if (oldIndex !== -1 && oldIndex !== newIndex) {
  //       const newOrderIds = arrayMove(currentIds, oldIndex, newIndex);

  //       finalUpdates = newOrderIds.map((id, index) => ({
  //         id,
  //         columnId: activeCol,
  //         order: index,
  //       }));

  //       reorderTasksLocal(finalUpdates);
  //     }
  //   } else {
  //     // --- CROSS-COLUMN REORDERING ---
  //     // Since onDragOver already handled the local state move, we just take the current state and sync to DB.
  //     const sourceIds = columnTaskIds[activeCol] || [];
  //     const targetIds = columnTaskIds[overCol] || [];

  //     sourceIds.forEach((id, i) => {
  //       finalUpdates.push({ id, columnId: activeCol, order: i });
  //     });

  //     targetIds.forEach((id, i) => {
  //       finalUpdates.push({ id, columnId: overCol, order: i });
  //     });
  //   }

  //   if (finalUpdates.length > 0) {
  //     console.log("SYNCING TO DB:", finalUpdates);
  //     await reorderColumnTasks(finalUpdates);
  //   }
  // }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCol = active.data.current?.sortable?.containerId;
    const overCol = over.data.current?.sortable?.containerId || over.id;

    if (!activeCol || !overCol || !columnTaskIds[overCol]) return;

    // --- CASE A: MOVING BETWEEN COLUMNS ---
    if (activeCol !== overCol) {
      const updates = getIntermediatePayload(
        active.id,
        activeCol,
        over.id,
        overCol,
        columnTaskIds,
      );

      // Check if the task's column in state is already the overCol
      // to prevent infinite updates while hovering in the new column
      if (tasksById[active.id].columnId !== overCol) {
        reorderTasksLocal(updates);
      }
    }

    // --- CASE B: MOVING WITHIN SAME COLUMN ---
    else {
      const currentIds = columnTaskIds[activeCol];
      const oldIndex = currentIds.indexOf(active.id);
      let newIndex = currentIds.indexOf(over.id);

      if (newIndex === -1) newIndex = currentIds.length - 1;

      // ONLY dispatch if the index actually changed
      if (oldIndex !== newIndex && oldIndex !== -1) {
        const newOrderIds = arrayMove(currentIds, oldIndex, newIndex);
        const updates = newOrderIds.map((id, index) => ({
          id,
          columnId: activeCol,
          order: index,
        }));

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

    // The local state is already correct because of handleDragOver.
    // We just collect all tasks in the affected columns and sync.
    const finalUpdates = [];
    const sourceIds = columnTaskIds[activeCol] || [];

    sourceIds.forEach((id, i) => {
      finalUpdates.push({ id, columnId: activeCol, order: i });
    });

    if (activeCol !== overCol) {
      const targetIds = columnTaskIds[overCol] || [];
      targetIds.forEach((id, i) => {
        finalUpdates.push({ id, columnId: overCol, order: i });
      });
    }

    if (finalUpdates.length > 0) {
      console.log("SYNCING FINAL STATE TO DB:", finalUpdates);
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
