export function getSubtaskStats(subtasks = []) {
  return {
    total: subtasks.length,
    completed: subtasks.filter((s) => s?.isCompleted).length,
  };
}

export function normalizeTasks(tasks, columns = []) {
  const tasksById = {};
  const columnTaskIds = {};

  // 1. Initialize ALL columns with an empty array first (to make an empty column droppable)
  columns.forEach((col) => {
    columnTaskIds[col.id] = [];
  });

  // 2. Fill in the tasks
  for (const task of tasks) {
    tasksById[task.id] = task;

    if (!columnTaskIds[task.columnId]) {
      columnTaskIds[task.columnId] = [];
    }

    columnTaskIds[task.columnId].push(task.id);
  }

  // 3. Sort existing tasks by order
  for (const columnId in columnTaskIds) {
    columnTaskIds[columnId].sort((a, b) => {
      return tasksById[a].order - tasksById[b].order;
    });
  }

  return { tasksById, columnTaskIds };
}
