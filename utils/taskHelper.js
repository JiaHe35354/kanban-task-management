export function getSubtaskStats(subtasks = []) {
  return {
    total: subtasks.length,
    completed: subtasks.filter((s) => s?.isCompleted).length,
  };
}

export function normalizeTasks(tasks) {
  const tasksById = {};
  const columnTaskIds = {};

  for (const task of tasks) {
    tasksById[task.id] = task;

    if (!columnTaskIds[task.columnId]) {
      columnTaskIds[task.columnId] = [];
    }

    columnTaskIds[task.columnId].push(task.id);
  }

  for (const columnId in columnTaskIds) {
    columnTaskIds[columnId].sort((a, b) => {
      return tasksById[a].order - tasksById[b].order;
    });
  }

  return { tasksById, columnTaskIds };
}
