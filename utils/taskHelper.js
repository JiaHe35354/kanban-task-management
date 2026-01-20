export function getSubtaskStats(subtasks = []) {
  return {
    total: subtasks.length,
    completed: subtasks.filter((s) => s?.isCompleted).length,
  };
}
