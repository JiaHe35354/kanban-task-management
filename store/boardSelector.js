export const selectActiveBoard = (state) =>
  state.board.boards[state.board.activeBoardIndex];

export const selectColumnsOfActiveBoard = (state) =>
  state.board.boards[state.board.activeBoardIndex]?.columns ?? [];
