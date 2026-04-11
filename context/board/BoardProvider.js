"use client";

import { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useAuth } from "../AuthContext";
import { boardReducer, initialState } from "./boardReducer";
import { createBoardActions } from "./boardActions";

export const BoardStateContext = createContext(initialState);
export const BoardActionsContext = createContext(null);

export function BoardProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const actions = useMemo(() => {
    return createBoardActions(stateRef, dispatch, user?.uid);
  }, [user?.uid]);

  useEffect(() => {
    const isProtectedPage = window.location.pathname.startsWith("/boards");

    if (user?.uid && isProtectedPage) {
      actions.loadBoards();
    }
  }, [user?.uid, actions]);

  useEffect(() => {
    if (!user && !authLoading) {
      dispatch({ type: "RESET_STATE" });
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (state.activeBoardId) {
      actions.loadBoardData(state.activeBoardId);
    }
  }, [state.activeBoardId]);

  const activeBoard =
    state.boards.find((b) => b.id === state.activeBoardId) ?? null;

  if (authLoading) return <div>Authenticating...</div>;

  return (
    <BoardStateContext.Provider value={{ ...state, activeBoard }}>
      <BoardActionsContext.Provider value={actions}>
        {children}
      </BoardActionsContext.Provider>
    </BoardStateContext.Provider>
  );
}
