export function getActiveBoard(state) {
  return state.boards.find((board) => board.id === state.activeBoardId);
}

export function getTasksByColumn(tasks, columnId) {
  return tasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}
