"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { boardReducer, initialState } from "./BoardReducer";
import { createBoardActions } from "./boardActions";

export const BoardStateContext = createContext(initialState);
export const BoardActionsContext = createContext(null);

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const actions = useMemo(() => {
    return createBoardActions(stateRef, dispatch);
  }, [dispatch]);

  useEffect(() => {
    async function init() {
      dispatch({ type: "SET_BOARD_LOADING", payload: true });
      try {
        await actions.loadBoards();
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load boards" });
      } finally {
        dispatch({ type: "SET_BOARD_LOADING", payload: false });
      }
    }

    init();
  }, [actions]);

  useEffect(() => {
    async function fetchData() {
      if (!state.activeBoardId) return;

      try {
        dispatch({ type: "SET_DATA_LOADING", payload: true });
        await actions.loadBoardData(state.activeBoardId);
      } catch (err) {
        console.error("Failed to load board:", err);
      } finally {
        // This ensures the spinner stops whether it worked OR crashed
        dispatch({ type: "SET_DATA_LOADING", payload: false });
      }
    }

    fetchData();
  }, [state.activeBoardId]);

  const activeBoard =
    state.boards.find((b) => b.id === state.activeBoardId) ?? null;

  // const tasks = useMemo(() => Object.values(state.tasksById), [state]);

  return (
    <BoardStateContext.Provider value={{ ...state, activeBoard }}>
      <BoardActionsContext.Provider value={actions}>
        {children}
      </BoardActionsContext.Provider>
    </BoardStateContext.Provider>
  );
}
