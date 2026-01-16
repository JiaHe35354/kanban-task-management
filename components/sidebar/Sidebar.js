"use client";

import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { boardActions } from "@/store/boardSlice";

import NewBoardModal from "./new-board-modal/NewBoardModal";
import ThemeToggle from "./theme-toggle/ThemeToggle";
import BoardIcon from "@/assets/icon-board.svg";
import HideSidebarIcon from "@/assets/icon-hide-sidebar.svg";

import classes from "./Sidebar.module.css";

export default function Sidebar({ onHide }) {
  const modal = useRef();

  const boards = useSelector((state) => state.board.boards);
  const activeBoardIndex = useSelector((state) => state.board.activeBoardIndex);
  const dispatch = useDispatch();

  function handleActiveBoard(index) {
    dispatch(boardActions.setActiveBoard(index));
  }

  function handleOpenModal() {
    modal.current.open();
  }

  return (
    <>
      <NewBoardModal ref={modal} />
      <nav className={classes.navbar}>
        <div className={classes.boardsBtns}>
          <h2 className={classes.navTitle}>All boards (3)</h2>

          <ul className={classes.list}>
            {boards.map((board, index) => (
              <li
                key={board.name}
                onClick={() => handleActiveBoard(index)}
                className={`${classes.listItem} ${
                  index === activeBoardIndex ? classes.active : ""
                }`}
              >
                <BoardIcon className={classes.iconBoard} />
                {board.name}
              </li>
            ))}
          </ul>

          <button className={classes.createBtn} onClick={handleOpenModal}>
            <BoardIcon className={classes.iconBoard} />+ Create New Board
          </button>
        </div>

        <div className={classes.controlsSection}>
          <ThemeToggle />
          <button className={classes.hideSidebarBtn} onClick={onHide}>
            <HideSidebarIcon className={classes.iconHide} /> Hide Sidebar
          </button>
        </div>
      </nav>
    </>
  );
}
