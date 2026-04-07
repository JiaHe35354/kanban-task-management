"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BoardStateContext } from "@/context/board/BoardProvider";

const TaskModalContext = createContext(null);

export function TaskModalProvider({ children }) {
  const { tasksById, columns } = useContext(BoardStateContext);

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "details" | "edit" | "delete" | null

  const activeTask = useMemo(
    () => (activeTaskId ? tasksById[activeTaskId] : null),
    [tasksById, activeTaskId],
  );

  const currentColumn = useMemo(() => {
    if (!activeTask) return null;
    return columns.find((c) => c.id === activeTask.columnId) ?? null;
  }, [columns, activeTask]);

  const openTaskModal = useCallback((taskId, modalType) => {
    setActiveTaskId(taskId);
    setActiveModal(modalType); // "details" | "edit" | "delete"
  }, []);

  const closeTaskModal = useCallback(() => {
    setActiveTaskId(null);
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({
      activeTask,
      activeModal,
      currentColumn,
      columns,
      openTaskDetails: (taskId) => openTaskModal(taskId, "details"),
      openEditTask: (taskId) => openTaskModal(taskId, "edit"),
      openDeleteTask: (taskId) => openTaskModal(taskId, "delete"),
      closeTaskModal,
    }),
    [
      activeTask,
      activeModal,
      currentColumn,
      columns,
      openTaskModal,
      closeTaskModal,
    ],
  );

  return (
    <TaskModalContext.Provider value={value}>
      {children}
    </TaskModalContext.Provider>
  );
}

export function useTaskModal() {
  return useContext(TaskModalContext);
}
