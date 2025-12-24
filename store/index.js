const { configureStore } = require("@reduxjs/toolkit");

import boardReducer from "./board-slice";

const store = configureStore({
  reducer: { board: boardReducer },
});
