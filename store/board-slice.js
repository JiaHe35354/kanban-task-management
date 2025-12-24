const { createSlice } = require("@reduxjs/toolkit");

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    addTask(state, action) {},
    updateTask(state, action) {},
    deleteTask(state, action) {},
    moveTask(state, action) {},
  },
});

export const boardActions = boardSlice.actions;

export default boardSlice.reducer;
