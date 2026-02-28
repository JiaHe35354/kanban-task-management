"use client";

import { useContext } from "react";

import { BoardStateContext } from "@/context/BoardContext";
import ThemeToggle from "./theme-toggle/ThemeToggle";
import BoardIcon from "@/assets/icon-board.svg";
import HideSidebarIcon from "@/assets/icon-hide-sidebar.svg";

import classes from "./Sidebar.module.css";

export default function Sidebar({
  onSelectBoard,
  onHide,
  onOpenModal,
  isMobile,
}) {
  const { boards, activeBoardId } = useContext(BoardStateContext);

  return (
    <nav className={classes.navbar}>
      <div className={classes.boardsBtns}>
        <h2 className={classes.navTitle}>All boards ({boards.length})</h2>

        <ul className={classes.list}>
          {boards.map((board) => (
            <li
              key={board.id}
              className={`${classes.listItem} ${
                board.id === activeBoardId ? classes.active : ""
              }`}
              onClick={() => onSelectBoard(board.id)}
            >
              <BoardIcon className={classes.iconBoard} />
              {board.name}
            </li>
          ))}
        </ul>

        <button className={classes.createBtn} onClick={onOpenModal}>
          <BoardIcon className={classes.iconBoard} /> + Create New Board
        </button>
      </div>

      <div className={classes.controlsSection}>
        <ThemeToggle />
        {!isMobile && onHide && (
          <button className={classes.hideSidebarBtn} onClick={onHide}>
            <HideSidebarIcon className={classes.iconHide} /> Hide Sidebar
          </button>
        )}
      </div>
    </nav>
  );
}
