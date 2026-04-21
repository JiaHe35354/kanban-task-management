export const initialState = {
  boards: [],
  columns: [],

  tasksById: {},
  columnTaskIds: {},

  activeBoardId: null,
  isBoardLoading: null,
  isDataLoading: false,
  error: null,
};

export function boardReducer(state, action) {
  if (action.type === "SET_BOARD_LOADING") {
    return { ...state, isBoardLoading: action.payload };
  }

  if (action.type === "SET_DATA_LOADING") {
    return { ...state, isDataLoading: action.payload };
  }

  if (action.type === "SET_ERROR") {
    return { ...state, error: action.payload };
  }

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
    const { columns = [], tasksById = {}, columnTaskIds = {} } = action.payload;

    return {
      ...state,
      columns,
      tasksById,
      columnTaskIds,
    };
  }

  if (action.type === "RESET_STATE") {
    return initialState;
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

  if (action.type === "SET_COLUMNS") {
    return {
      ...state,
      columns: action.payload,
    };
  }

  if (action.type === "ADD_TASK") {
    const task = action.payload;

    if (state.tasksById[task.id]) return state;

    const columnTasks = state.columnTaskIds[task.columnId] || [];

    return {
      ...state,

      tasksById: {
        ...state.tasksById,
        [task.id]: task,
      },

      columnTaskIds: {
        ...state.columnTaskIds,
        [task.columnId]: [...columnTasks, task.id],
      },
    };
  }

  if (action.type === "TOGGLE_SUBTASK") {
    const { taskId, subtaskId } = action.payload;

    const task = state.tasksById[taskId];
    if (!task) return state;

    return {
      ...state,

      tasksById: {
        ...state.tasksById,
        [taskId]: {
          ...task,
          subtasks: task.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
          ),
        },
      },
    };
  }

  if (action.type === "MOVE_TASK") {
    const { taskId, newColumnId, newOrder } = action.payload;

    const task = state.tasksById[taskId];
    if (!task) return state;

    const oldColumnId = task.columnId;

    const sourceTasks = [...(state.columnTaskIds[oldColumnId] || [])];
    const targetTasks = [...(state.columnTaskIds[newColumnId] || [])];

    const index = sourceTasks.indexOf(taskId);
    if (index !== -1) sourceTasks.splice(index, 1);

    targetTasks.splice(newOrder, 0, taskId);

    return {
      ...state,

      tasksById: {
        ...state.tasksById,
        [taskId]: {
          ...task,
          columnId: newColumnId,
          order: newOrder,
        },
      },

      columnTaskIds: {
        ...state.columnTaskIds,
        [oldColumnId]: sourceTasks,
        [newColumnId]: targetTasks,
      },
    };
  }

  if (action.type === "REORDER_MULTIPLE_TASKS") {
    const updatedTasks = action.payload;
    const tasksById = { ...state.tasksById };
    const columnTaskIds = { ...state.columnTaskIds };

    // 1. Update the individual task objects (for the 'order' and 'columnId' property)
    updatedTasks.forEach((task) => {
      if (tasksById[task.id]) {
        tasksById[task.id] = { ...tasksById[task.id], ...task };
      }
    });

    // 2. Optimized Column Update:
    const affectedColumns = [...new Set(updatedTasks.map((t) => t.columnId))];

    affectedColumns.forEach((colId) => {
      columnTaskIds[colId] = Object.values(tasksById)
        .filter((t) => t.columnId === colId)
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id);
    });

    return { ...state, tasksById, columnTaskIds };
  }

  if (action.type === "ROLLBACK_TASKS") {
    const tasksById = action.payload;

    const columnTaskIds = {};

    Object.values(tasksById).forEach((task) => {
      if (!columnTaskIds[task.columnId]) {
        columnTaskIds[task.columnId] = [];
      }

      columnTaskIds[task.columnId].push(task);
    });

    for (const columnId in columnTaskIds) {
      columnTaskIds[columnId] = columnTaskIds[columnId]
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id);
    }

    return {
      ...state,
      ...action.payload,
    };
  }

  throw new Error(`Unknown action: ${action.type}`);
}
