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
  createTask as createTaskInDb,
  deleteTasksByBoard,
  getTasksByBoard,
  moveTask as moveTaskInDb,
  updateTask as updateTaskInDb,
  deleteTaskById,
} from "@/lib/firestore/tasks";
import {
  createSubtask as createSubtaskInDb,
  getSubtasksByTask,
  toggleSubtask as toggleSubtaskInDb,
  updateSubtask as updateSubtaskInDb,
  deleteSubtask as deleteSubtaskInDb,
} from "@/lib/firestore/subtasks";

import { COLUMN_COLORS } from "@/constants/columnColors";

const initialState = {
  boards: [],
  activeBoardId: null,
  columns: [],
  tasks: [],
};

export const BoardStateContext = createContext(initialState);
export const BoardActionsContext = createContext(null);

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
          : (action.payload[0]?.id ?? null),
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

  if (action.type === "TOGGLE_SUBTASK") {
    const { taskId, subtaskId } = action.payload;

    return {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id !== taskId
          ? task
          : {
              ...task,
              subtasks: task.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
              ),
            },
      ),
    };
  }

  if (action.type === "MOVE_TASK") {
    const { taskId, newColumnId, newOrder } = action.payload;

    return {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, columnId: newColumnId, order: newOrder }
          : task,
      ),
    };
  }

  if (action.type === "REORDER_MULTIPLE_TASKS") {
    const updatesMap = new Map(action.payload.map((task) => [task.id, task]));

    return {
      ...state,
      tasks: state.tasks.map((task) => {
        const updated = updatesMap.get(task.id);

        return updated
          ? { ...task, columnId: updated.columnId, order: updated.order }
          : task;
      }),
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
      }),
    );

    dispatch({
      type: "SET_BOARD_DATA",
      payload: { columns: cols, tasks: tasksWithSubtasks },
    });

    console.log(state.tasks);
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
            }),
          ),
        ),
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
            : board,
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
    try {
      await updateBoard(boardId, { name });

      const originalColumns = state.columns;

      // Determine deleted, updated, new columns
      const deletedColumns = originalColumns.filter(
        (orig) =>
          !columns.some((c) => c.id === orig.id) && typeof orig.id === "string",
      );

      const newColumns = columns.filter(
        (c) => !originalColumns.some((orig) => orig.id === c.id),
      );

      const updatedColumns = columns.filter((c) =>
        originalColumns.some(
          (orig) => orig.id === c.id && orig.name !== c.name,
        ),
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
          order,
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

  async function updateColumns(boardId, columns) {
    try {
      const originalColumns = state.columns;

      const deleted = originalColumns.filter(
        (orig) => !columns.some((c) => c.id === orig.id),
      );

      const added = columns.filter(
        (c) => !originalColumns.some((orig) => orig.id === c.id),
      );

      const updated = columns.filter((c) =>
        originalColumns.some(
          (orig) => orig.id === c.id && orig.name !== c.name,
        ),
      );

      for (const col of deleted) {
        await deleteColumn(col.id);
      }

      for (const col of updated) {
        await updateColumn(col.id, { name: col.name });
      }

      for (const col of added) {
        const order = columns.findIndex((c) => c.id === col.id);

        await createColumn(
          boardId,
          col.name,
          COLUMN_COLORS[order % COLUMN_COLORS.length],
          order,
        );
      }

      await loadBoardData(boardId);
    } catch (err) {
      console.error("Failed updating columns:", err);
    }
  }

  async function createNewTask({ title, description, status, subtasks }) {
    const column = state.columns.find((c) => c.id === status);
    if (!column) return;

    const order = state.tasks.filter((t) => t.columnId === column.id).length;

    try {
      const taskId = await createTaskInDb(
        state.activeBoardId,
        column.id,
        title,
        description,
        order,
      );

      const createdSubtasks = await Promise.all(
        subtasks.map((s, i) =>
          createSubtaskInDb(taskId, s.title, false, i).then((id) => ({
            id,
            title: s.title,
            isCompleted: false,
            order: i,
          })),
        ),
      );

      // Optimistic UI update
      dispatch({
        type: "ADD_TASK",
        payload: {
          id: taskId,
          boardId: state.activeBoardId,
          columnId: column.id,
          title,
          description,
          order,
          subtasks: createdSubtasks,
        },
      });

      loadBoardData(state.activeBoardId);
    } catch (err) {
      console.log("Failed to create task:", err);
    }
  }

  async function moveTask(taskId, newColumnId) {
    const tasksInColumn = state.tasks.filter((t) => t.columnId === newColumnId);

    const newOrder = tasksInColumn.length;

    dispatch({
      type: "MOVE_TASK",
      payload: { taskId, newColumnId, newOrder },
    });

    try {
      await moveTaskInDb(taskId, newColumnId, newOrder);
    } catch (err) {
      console.log("Failed to move task", err);
    }
  }

  // async function reorderColumnTasks(updatedColumnTasks) {
  //   // Optimistic UI update
  //   updatedColumnTasks.forEach((task) => {
  //     dispatch({
  //       type: "MOVE_TASK",
  //       payload: {
  //         taskId: task.id,
  //         newColumnId: task.columnId,
  //         newOrder: task.order,
  //       },
  //     });
  //   });

  //   try {
  //     // Persist all
  //     await Promise.all(
  //       updatedColumnTasks.map((task) =>
  //         moveTaskInDb(task.id, task.columnId, task.order),
  //       ),
  //     );
  //   } catch (err) {
  //     console.log("Failed reorder", err);
  //   }
  // }

  async function reorderColumnTasks(updatedColumnTasks) {
    dispatch({
      type: "REORDER_MULTIPLE_TASKS",
      payload: updatedColumnTasks,
    });

    try {
      await Promise.all(
        updatedColumnTasks.map((task) =>
          moveTaskInDb(task.id, task.columnId, task.order),
        ),
      );
    } catch (err) {
      console.log("Failed reorder", err);
      // optional rollback here later
    }
  }

  async function editTask({ taskId, title, description, status, subtasks }) {
    try {
      await updateTaskInDb(taskId, {
        title,
        description,
        columnId: status,
      });

      const originalTask = state.tasks.find((task) => task.id === taskId);
      const originalSubtasks = originalTask?.subtasks ?? [];

      const deletedSubtasks = originalSubtasks.filter(
        (orig) => !subtasks.some((s) => s.id === orig.id),
      );

      const newSubtasks = subtasks.filter(
        (s) => !originalSubtasks.some((orig) => orig.id === s.id),
      );

      const updatedSubtasks = subtasks.filter((s) =>
        originalSubtasks.some(
          (orig) => orig.id === s.id && orig.title !== s.title,
        ),
      );

      for (const sub of deletedSubtasks) {
        await deleteSubtaskInDb(sub.id);
      }

      for (const sub of updatedSubtasks) {
        await updateSubtaskInDb(sub.id, {
          title: sub.title,
        });
      }

      for (const sub of newSubtasks) {
        const order = subtasks.findIndex((s) => s.id === sub.id);

        await createSubtaskInDb(taskId, sub.title, false, order);
      }

      await loadBoardData(state.activeBoardId);
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  }

  async function deleteTask(taskId) {
    try {
      await deleteTaskById(taskId);

      await loadBoardData(state.activeBoardId);
    } catch (err) {
      console.log("Failed to delete task:", err);
    }
  }

  async function toggleSubtask(taskId, subtaskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    const newValue = !subtask.isCompleted;

    // optimistic UI update
    dispatch({
      type: "TOGGLE_SUBTASK",
      payload: { taskId, subtaskId },
    });

    try {
      await toggleSubtaskInDb(subtaskId, newValue);
    } catch (err) {
      console.log("Failed to toggle subtask", err);
      //optional rollback later...
    }
  }

  const activeBoard =
    state.boards.find((board) => board.id === state.activeBoardId) ?? null;

  return (
    <BoardStateContext.Provider value={state}>
      <BoardActionsContext.Provider
        value={{
          activeBoard,
          selectBoard,
          createNewBoard,
          createNewTask,
          loadBoards,
          loadBoardData,
          editBoard,
          deleteBoard,
          updateColumns,
          toggleSubtask,
          moveTask,
          reorderColumnTasks,
          editTask,
          deleteTask,
        }}
      >
        {children}
      </BoardActionsContext.Provider>
    </BoardStateContext.Provider>
  );
}
