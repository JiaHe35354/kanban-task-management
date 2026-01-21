const { createSlice } = require("@reduxjs/toolkit");

import initialData from "@/data/data.json" assert { type: "json" };
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

      board.columns.push({
        id: crypto.randomUUID(),
        name: columnName,
        color: COLUMN_COLORS[board.columns.length % COLUMN_COLORS.length],
      });
    },
  },
});

export const boardActions = boardSlice.actions;

export default boardSlice.reducer;
