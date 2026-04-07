"use client";

import { useContext } from "react";

import { BoardStateContext } from "@/context/board/BoardProvider";
import ThemeToggle from "./theme-toggle/ThemeToggle";
import BoardIcon from "@/assets/icon-board.svg";
import HideSidebarIcon from "@/assets/icon-hide-sidebar.svg";
import SkeletonSidebarItem from "../ui/skeletons/SkeletonSidebarItem";

import classes from "./Sidebar.module.css";

export default function Sidebar({
  onSelectBoard,
  onHide,
  onOpenModal,
  isMobile,
}) {
  const { activeBoardId, boards, isBoardLoading } =
    useContext(BoardStateContext);

  return (
    <nav className={classes.navbar}>
      <div className={classes.listWrapper}>
        {isBoardLoading ? (
          <>
            <SkeletonSidebarItem />
            <SkeletonSidebarItem />
            <SkeletonSidebarItem />
            <SkeletonSidebarItem />
          </>
        ) : (
          <>
            <h2 className={classes.navTitle}>All boards ({boards.length})</h2>

            <ul className={classes.list}>
              {boards.map((board) => (
                <li key={board.id}>
                  <button
                    type="button"
                    className={`${classes.boardBtn} ${
                      board.id === activeBoardId ? classes.active : ""
                    }`}
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <BoardIcon className={classes.iconBoard} />
                    {board.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
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
