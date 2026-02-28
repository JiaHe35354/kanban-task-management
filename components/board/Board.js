"use client";

import { useContext, useState } from "react";
import {
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { BoardStateContext, BoardActionsContext } from "@/context/BoardContext";
import ColumnList from "./column/ColumnList";
import { getSubtaskStats } from "@/utils/taskHelper";

import classes from "./Board.module.css";

export default function Board() {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [previewTasks, setPreviewTasks] = useState(null);

  const { tasks: contextTasks } = useContext(BoardStateContext);
  const { reorderColumnTasks } = useContext(BoardActionsContext);

  const sensors = useSensors(useSensor(PointerSensor));

  const customDropAnimation = {
    ...defaultDropAnimation,
    duration: 400,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  };

  const tasks = previewTasks ?? contextTasks;
  const activeTask = tasks.find((t) => t.id === activeId);
  const { total, completed } = getSubtaskStats(activeTask?.subtasks);

  function handleDragOver(event) {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    const overColumnId = overTask ? overTask.columnId : over.id;

    if (activeTask.columnId === overColumnId) return;

    const updatedTasks = tasks.map((t) =>
      t.id === active.id ? { ...t, columnId: overColumnId } : t,
    );

    setPreviewTasks(updatedTasks);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      setPreviewTasks(null);
      return;
    }

    const baseTasks = previewTasks ?? contextTasks;

    const activeTask = baseTasks.find((t) => t.id === active.id);
    const overTask = baseTasks.find((t) => t.id === over.id);

    if (!activeTask) {
      setPreviewTasks(null);
      return;
    }

    const targetColumnId = overTask ? overTask.columnId : over.id;

    // Get tasks in target column AFTER preview move
    const targetColumnTasks = baseTasks
      .filter((t) => t.columnId === targetColumnId)
      .sort((a, b) => a.order - b.order);

    const oldIndex = targetColumnTasks.findIndex((t) => t.id === activeTask.id);

    let newIndex;

    if (overTask) {
      newIndex = targetColumnTasks.findIndex((t) => t.id === overTask.id);
    } else {
      newIndex = targetColumnTasks.length;
    }

    if (oldIndex === -1) {
      targetColumnTasks.push(activeTask);
    }

    if (newIndex !== -1) {
      const reorderedColumnTasks = arrayMove(
        targetColumnTasks,
        oldIndex === -1 ? targetColumnTasks.length - 1 : oldIndex,
        newIndex,
      ).map((task, index) => ({
        ...task,
        order: index,
      }));

      // Merge back into full task list
      const updatedTasks = baseTasks.map((task) => {
        const updated = reorderedColumnTasks.find((t) => t.id === task.id);
        return updated ?? task;
      });

      setPreviewTasks(null);
      setActiveId(null);
      setOverId(null);
      setActiveSize(null);

      reorderColumnTasks(updatedTasks);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const rect =
          e.active.rect.current?.translated ?? e.active.rect.current?.initial;

        if (rect) {
          setActiveSize({
            width: rect.width,
            height: rect.height,
          });
        }

        setActiveId(e.active.id);
      }}
      onDragOver={(e) => {
        handleDragOver(e);
        setOverId(e.over?.id ?? null);
      }}
      onDragEnd={(e) => {
        handleDragEnd(e);
      }}
    >
      <div className={classes.board}>
        <ColumnList
          activeId={activeId}
          overId={overId}
          activeSize={activeSize}
        />
      </div>

      <DragOverlay dropAnimation={customDropAnimation}>
        {activeTask && (
          <div
            className={classes.overlay}
            style={{ width: activeSize?.width, height: activeSize?.height }}
          >
            <h3 className={classes.taskTitle}>{activeTask.title}</h3>
            <p className={classes.subtasks}>
              {completed} of {total} subtasks
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
