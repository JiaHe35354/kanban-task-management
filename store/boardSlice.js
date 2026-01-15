const { createSlice } = require("@reduxjs/toolkit");

import initialData from "@/data/data.json";
import { COLUMN_COLORS } from "@/constants/columnColors";

const boardSlice = createSlice({
  name: "board",
  initialState: {
    boards: initialData.boards,
    activeBoardIndex: 0,
  },
  reducers: {
    setActiveBoard(state, action) {
      state.activeBoardIndex = action.payload;
    },

    addColumn(state, action) {
      const { boardId, columnName } = action.payload;

      const board = state.boards.find((b) => b.id === boardId);

      const columnIndex = board.columns.length;

      board.columns.push({
        id: crypto.randomUUID(),
        name: columnName,
        color: COLUMN_COLORS[columnIndex % COLUMN_COLORS.length],
        tasks: [],
      });
    },
  },
});

export const boardActions = boardSlice.actions;

export default boardSlice.reducer;
