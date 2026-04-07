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
import { toTitleCase } from "@/utils/stringHelper";
import { normalizeTasks } from "@/utils/taskHelper";

export function createBoardActions(stateRef, dispatch) {
  async function withLoading(actionFn) {
    dispatch({ type: "SET_DATA_LOADING", payload: true });

    try {
      await actionFn();
    } finally {
      dispatch({ type: "SET_DATA_LOADING", payload: false });
    }
  }

  async function loadBoards() {
    try {
      dispatch({ type: "SET_ERROR", payload: null });
      const data = await getBoardsByUser("user123");
      dispatch({ type: "SET_BOARDS", payload: data });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload:
          "Failed to load boards. Please check your internet connection.",
      });
    }
  }

  async function loadBoardData(boardId) {
    if (!boardId) return;

    try {
      dispatch({ type: "SET_ERROR", payload: null });
      const cols = await getColumnsByBoard(boardId);
      const rawTasks = await getTasksByBoard(boardId);

      const tasksWithSubtasks = await Promise.all(
        rawTasks.map(async (task) => {
          const subtasks = await getSubtasksByTask(task.id);
          return { ...task, subtasks };
        }),
      );

      const { tasksById, columnTaskIds } = normalizeTasks(tasksWithSubtasks);
      // console.log("tasksById:", tasksById, "columnTaskIds:", columnTaskIds);

      dispatch({
        type: "SET_BOARD_DATA",
        payload: { columns: cols, tasksById, columnTaskIds },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load board content. Please refresh.",
      });

      throw err;
    }
  }

  async function selectBoard(boardId) {
    dispatch({ type: "SET_ACTIVE_BOARD", payload: boardId });
  }

  async function createNewBoard({ boardName, columns }) {
    const state = stateRef.current;
    const formattedName = toTitleCase(boardName);

    const nameExists = state.boards.some(
      (b) => b.name.toLowerCase() === formattedName.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("BOARD_EXISTS");
    }

    try {
      await withLoading(async () => {
        const realBoardId = await createBoard("user123", formattedName);

        await Promise.all(
          columns.map((col, i) =>
            createColumn(
              realBoardId,
              toTitleCase(col.name),
              COLUMN_COLORS[i % COLUMN_COLORS.length],
              i,
            ),
          ),
        );

        await loadBoards();
        dispatch({ type: "SET_ACTIVE_BOARD", payload: realBoardId });
        await loadBoardData(realBoardId);
        console.log(state.activeBoard);
      });
    } catch (err) {
      throw err;
    }
  }

  async function editBoard({ boardId, name, columns }) {
    const state = stateRef.current;

    const formattedBoardName = toTitleCase(name.trim());

    const nameExists = state.boards.some(
      (b) =>
        b.id !== boardId &&
        b.name.toLowerCase() === formattedBoardName.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("BOARD_EXISTS");
    }

    try {
      await withLoading(async () => {
        const boardPromise = updateBoard(boardId, { name: formattedBoardName });

        const originalColumns = state.columns;

        // Determine deleted, updated, new columns
        const deletedColumns = originalColumns.filter(
          (orig) => !columns.some((c) => c.id === orig.id),
        );

        const newColumns = columns.filter(
          (c) => !originalColumns.some((orig) => orig.id === c.id),
        );

        const updatedColumns = columns.filter((c) =>
          originalColumns.some(
            (orig) => orig.id === c.id && orig.name !== c.name,
          ),
        );

        const columnPromises = [
          ...deletedColumns.map((col) => deleteColumn(col.id)),
          ...updatedColumns.map((col) =>
            updateColumn(col.id, { name: toTitleCase(col.name) }),
          ),
          ...newColumns.map((col) => {
            const order = columns.findIndex((c) => c.id === col.id);

            return createColumn(
              boardId,
              toTitleCase(col.name),
              col.color ?? COLUMN_COLORS[order % COLUMN_COLORS.length],
              order,
            );
          }),
        ];

        await Promise.all([boardPromise, ...columnPromises]);

        // Refresh data
        await loadBoards();
        await loadBoardData(boardId);
      });
    } catch (err) {
      console.log("Failed to edit board:", err);
      throw err;
    }
  }

  async function deleteBoard(boardId) {
    try {
      await withLoading(async () => {
        await deleteTasksByBoard(boardId);
        await deleteColumnsByBoard(boardId);
        await deleteBoardById(boardId);

        const state = stateRef.current;

        if (state.boards.length > 0) {
          dispatch({
            type: "SET_ACTIVE_BOARD",
            payload: state.boards[0].id,
          });

          await loadBoards();
          await loadBoardData(state.boards[0].id);
        } else {
          dispatch({ type: "SET_ACTIVE_BOARD", payload: null });
          dispatch({
            type: "SET_BOARD_DATA",
            payload: { columns: [], tasks: [] },
          });
        }
      });
    } catch (err) {
      throw err;
    }
  }

  async function updateColumns(boardId, newColumnData) {
    try {
      const state = stateRef.current;
      const originalColumns = state.columns;

      const deleted = originalColumns.filter(
        (orig) => !newColumnData.some((c) => c.id === orig.id),
      );

      const added = newColumnData.filter(
        (c) => !originalColumns.some((orig) => orig.id === c.id),
      );

      const updated = newColumnData.filter((c) =>
        originalColumns.some(
          (orig) => orig.id === c.id && orig.name !== c.name,
        ),
      );

      const deletePromises = deleted.map((col) => deleteColumn(col.id));

      const updatePromises = updated.map((col) =>
        updateColumn(col.id, { name: toTitleCase(col.name) }),
      );

      const createPromises = added.map((col) => {
        const order = newColumnData.findIndex((c) => c.id === col.id);
        return createColumn(
          boardId,
          toTitleCase(col.name),
          COLUMN_COLORS[order % COLUMN_COLORS.length],
          order,
        );
      });

      await Promise.all([
        ...deletePromises,
        ...updatePromises,
        ...createPromises,
      ]);

      await loadBoardData(boardId);
    } catch (err) {
      console.log("failed to update columns:", err);
      throw err;
    }
  }

  async function createNewTask({ title, description, status, subtasks }) {
    const state = stateRef.current;
    if (!state?.activeBoardId) return;

    const columnTaskIds = state.columnTaskIds || {};

    const column = state.columns.find((c) => c.id === status);

    const order = (columnTaskIds[column.id] || []).length;

    try {
      await withLoading(async () => {
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
      });
    } catch (err) {
      console.log("Failed to create task:", err);
      throw err;
    }
  }

  async function moveTask(taskId, newColumnId) {
    const state = stateRef.current;

    const { tasksById, columnTaskIds } = state;

    const taskToMove = tasksById[taskId];
    if (!taskToMove || taskToMove.columnId === newColumnId) return;

    const oldColumnId = taskToMove.columnId;
    const oldOrder = taskToMove.order;

    const newOrder = (columnTaskIds[newColumnId] || []).length;

    // Update UI immediately before the await
    dispatch({
      type: "MOVE_TASK",
      payload: { taskId, newColumnId, newOrder },
    });

    try {
      await moveTaskInDb(taskId, newColumnId, newOrder);

      const remainingTasksInOldCol = (columnTaskIds[oldColumnId] || []).filter(
        (id) => id !== taskId,
      );

      const reorderRequests = remainingTasksInOldCol.map((id, index) =>
        moveTaskInDb(id, oldColumnId, index),
      );

      await Promise.all(reorderRequests);
    } catch (err) {
      console.log("Failed to move task", err);

      dispatch({
        type: "MOVE_TASK",
        payload: {
          taskId,
          newColumnId: oldColumnId,
          newOrder: oldOrder,
        },
      });

      throw err;
    }
  }

  async function toggleSubtask(taskId, subtaskId) {
    const state = stateRef.current;

    const task = state.tasksById[taskId];
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

      // Rollback UI if DB fails
      dispatch({
        type: "TOGGLE_SUBTASK",
        payload: { taskId, subtaskId },
      });
    }
  }

  async function reorderColumnTasks(updatedTasks) {
    const state = stateRef.current;

    const previousTasks = structuredClone(state.tasksById);
    const previousColumnIds = structuredClone(state.columnTaskIds);

    try {
      const tasksToUpdate = updatedTasks.filter((task) => {
        const original = previousTasks[task.id];
        return (
          original &&
          (original.order !== task.order || original.columnId !== task.columnId)
        );
      });

      if (tasksToUpdate.length === 0) return;

      await Promise.all(
        tasksToUpdate.map((task) =>
          moveTaskInDb(task.id, task.columnId, task.order),
        ),
      );
    } catch (err) {
      console.log("Failed to sync reorder:", err);

      dispatch({
        type: "ROLLBACK_TASKS",
        payload: {
          tasksById: previousTasks,
          columnTaskIds: previousColumnIds,
        },
      });
    }
  }

  function reorderTasksLocal(updatedTasks) {
    dispatch({
      type: "REORDER_MULTIPLE_TASKS",
      payload: updatedTasks,
    });
  }

  async function editTask({ taskId, title, description, status, subtasks }) {
    try {
      const state = stateRef.current;
      const { tasksById, columnTaskIds } = state;

      const originalTask = tasksById[taskId];
      const oldColumnId = originalTask.columnId;
      const isColumnChanging = oldColumnId !== status;

      let targetOrder;

      if (isColumnChanging) {
        const targetIds = (columnTaskIds[status] || []).filter(
          (id) => id !== taskId,
        );
        targetOrder = targetIds.length;

        const sourceIds = (columnTaskIds[oldColumnId] || []).filter(
          (id) => id !== taskId,
        );

        const reorderOldColPromises = sourceIds.map((id, index) =>
          updateTaskInDb(id, { order: index }),
        );
        await Promise.all(reorderOldColPromises);
      } else {
        targetOrder = originalTask.order;
      }

      await updateTaskInDb(taskId, {
        title,
        description,
        columnId: status,
        order: targetOrder,
      });

      const originalSubtasks = originalTask.subtasks ?? [];

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

      const subtaskPromises = [
        ...deletedSubtasks.map((sub) => deleteSubtaskInDb(sub.id)),
        ...updatedSubtasks.map((sub) =>
          updateSubtaskInDb(sub.id, { title: sub.title }),
        ),
        ...newSubtasks.map((sub, i) => {
          const order = subtasks.findIndex((s) => s.id === sub.id);
          return createSubtaskInDb(taskId, sub.title, false, order);
        }),
      ];

      await Promise.all(subtaskPromises);

      await loadBoardData(state.activeBoardId);
    } catch (err) {
      console.error("Failed to edit task:", err);
      throw err;
    }
  }

  async function deleteTask(taskId) {
    try {
      await deleteTaskById(taskId);

      await loadBoardData(stateRef.current.activeBoardId);
    } catch (err) {
      console.log("Failed to delete task:", err);
      throw err;
    }
  }

  return {
    selectBoard,
    createNewBoard,
    createNewTask,
    loadBoards,
    loadBoardData,
    editBoard,
    deleteBoard,
    moveTask,
    toggleSubtask,
    updateColumns,
    reorderColumnTasks,
    reorderTasksLocal,
    editTask,
    deleteTask,
  };
}
