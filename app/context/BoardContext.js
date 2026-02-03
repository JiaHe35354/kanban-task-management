"use client";

import { createContext, useEffect, useReducer } from "react";
import {
  createBoard,
  deleteBoardById,
  getBoardsByUser,
  updateBoard,
} from "@/lib/firestore/boards";
import {
  createColumn,
  deleteColumn,
  updateColumn,
  deleteColumnsByBoard,
  getColumnsByBoard,
} from "@/lib/firestore/columns";
import {
  createTask,
  deleteTasksByBoard,
  getTasksByBoard,
} from "@/lib/firestore/tasks";
import { createSubtask, getSubtasksByTask } from "@/lib/firestore/subtasks";
import { COLUMN_COLORS } from "@/constants/columnColors";

const initialState = {
  boards: [],
  activeBoardId: null,
  columns: [],
  tasks: [],
};

export const BoardContext = createContext(initialState);

function boardReducer(state, action) {
  if (action.type === "SET_BOARDS") {
    return {
      ...state,
      boards: action.payload,
      // activeBoardId: action.payload[0]?.id ?? null,
      activeBoardId:
        state.activeBoardId &&
        action.payload.some((b) => b.id === state.activeBoardId)
          ? state.activeBoardId
          : action.payload[0]?.id ?? null,
    };
  }

  if (action.type === "SET_BOARD_DATA") {
    return {
      ...state,
      columns: action.payload.columns,
      tasks: action.payload.tasks,
    };
  }

  if (action.type === "SET_ACTIVE_BOARD") {
    return {
      ...state,
      activeBoardId: action.payload,
    };
  }

  if (action.type === "ADD_BOARD") {
    return {
      ...state,
      boards: [...state.boards, action.payload],
      activeBoardId: action.payload.id,
    };
  }

  if (action.type === "ADD_TASK") {
    return {
      ...state,
      tasks: [...state.tasks, action.payload],
    };
  }

  throw new Error(`Unknown action: ${action.type}`);
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  async function loadBoards() {
    const data = await getBoardsByUser("user123");
    dispatch({ type: "SET_BOARDS", payload: data });
  }

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoardData(boardId) {
    if (!boardId) {
      throw new Error("loadBoardData called without boardId");
    }

    const cols = await getColumnsByBoard(boardId);
    const rawTasks = await getTasksByBoard(boardId);

    const tasksWithSubtasks = await Promise.all(
      rawTasks.map(async (task) => {
        const subtasks = await getSubtasksByTask(task.id);
        return { ...task, subtasks };
      })
    );
    console.log(cols, tasksWithSubtasks);
    dispatch({
      type: "SET_BOARD_DATA",
      payload: { columns: cols, tasks: tasksWithSubtasks },
    });
  }

  useEffect(() => {
    if (!state.activeBoardId) return;

    loadBoardData(state.activeBoardId);
  }, [state.activeBoardId]);

  async function selectBoard(boardId) {
    dispatch({ type: "SET_ACTIVE_BOARD", payload: boardId });
  }

  async function createNewBoard({ boardName, columns }) {
    const tempBoardId = crypto.randomUUID();

    const optimisticColumns = columns.map((col, i) => ({
      id: col.id,
      boardId: tempBoardId,
      name: col.name,
      order: i,
      color: COLUMN_COLORS[i % COLUMN_COLORS.length],
    }));

    const optimisticBoard = {
      id: tempBoardId,
      name: boardName,
      userId: "user123",
      createdAt: new Date(),
      columns: optimisticColumns,
    };

    dispatch({ type: "ADD_BOARD", payload: optimisticBoard });

    try {
      // Create board in Firestore
      const realBoardId = await createBoard("user123", boardName);

      // Create columns in Firestore
      const realColumns = await Promise.all(
        optimisticColumns.map((col, i) =>
          createColumn(realBoardId, col.name, col.color, col.order).then(
            (realColumnId) => ({
              ...col,
              id: realColumnId,
              boardId: realBoardId,
            })
          )
        )
      );

      // Replace temp board with real board
      dispatch({
        type: "SET_BOARDS",
        payload: state.boards.map((board) =>
          board.id === tempBoardId
            ? {
                ...board,
                id: realBoardId,
                columns: realColumns,
                userId: "user123",
                createdAt: new Date(),
              }
            : board
        ),
      });

      await loadBoards();

      // Set the new board as active:
      dispatch({ type: "SET_ACTIVE_BOARD", payload: realBoardId });
      console.log(state.boards);
    } catch (err) {
      console.error("Failed to create board:", err);

      // rollback
      dispatch({
        type: "SET_BOARDS",
        payload: state.boards.filter((b) => b.id !== tempBoardId),
      });
    }
  }

  async function editBoard({ boardId, name, columns }) {
    if (!columns || columns.length === 0) {
      throw new Error("Board must have at least one column");
    }

    try {
      await updateBoard(boardId, { name });

      const originalColumns = state.columns;

      // Determine deleted, updated, new columns
      const deletedColumns = originalColumns.filter(
        (orig) =>
          !columns.some((c) => c.id === orig.id) && typeof orig.id === "string"
      );

      const newColumns = columns.filter(
        (c) => !originalColumns.some((orig) => orig.id === c.id)
      );

      const updatedColumns = columns.filter((c) =>
        originalColumns.some((orig) => orig.id === c.id && orig.name !== c.name)
      );

      // Apply changes to Firestore
      for (const col of deletedColumns) {
        await deleteColumn(col.id);
      }

      for (const col of updatedColumns) {
        await updateColumn(col.id, { name: col.name });
      }

      for (const col of newColumns) {
        const order = columns.findIndex((c) => c.id === col.id);

        await createColumn(
          boardId,
          col.name,
          col.color ?? COLUMN_COLORS[order % COLUMN_COLORS.length],
          order
        );
      }

      // Reload board data
      await loadBoards();
      await loadBoardData(boardId);
    } catch (err) {
      console.error("Failed to edit board:", err);
    }
  }

  async function deleteBoard(boardId) {
    try {
      await deleteTasksByBoard(boardId);
      await deleteColumnsByBoard(boardId);
      await deleteBoardById(boardId);
      await loadBoards();
    } catch (err) {
      console.log("Failed to delete board:", err);
    }
  }

  // async function createNewTask({ title, description, status, subtasks }) {
  //   const column = state.columns.find((c) => c.name === status);
  //   if (!column) return;

  //   const order = tasks.filter((t) => t.columnId === column.id).length;
  //   const taskId = await createTask(
  //     state.activeBoardId,
  //     column.id,
  //     title,
  //     description,
  //     order
  //   );

  //   const createdSubtasks = await Promise.all(
  //     subtasks.map((s, i) => createSubtask(taskId, s.title, false, i))
  //   );

  //   dispatch({
  //     type: "ADD_TASK",
  //     payload: {
  //       id: taskId,
  //       boardId: state.activeBoardId,
  //       columnId: column.id,
  //       title,
  //       description,
  //       order,
  //       subtasks: createdSubtasks,
  //     },
  //   });
  // }

  const activeBoard =
    state.boards.find((board) => board.id === state.activeBoardId) ?? null;

  return (
    <BoardContext.Provider
      value={{
        ...state,
        activeBoard,
        selectBoard,
        createNewBoard,
        // createNewTask,
        loadBoards,
        loadBoardData,
        editBoard,
        deleteBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
