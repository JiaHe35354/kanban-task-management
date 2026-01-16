"use client";

import { useRef } from "react";
import { useSelector } from "react-redux";

import { selectActiveBoard } from "@/store/boardSelector";
import NewTaskModal from "./modal/NewTaskModal";
import EditBoardModal from "./modal/EditBoardModal";
import DeleteBoardModal from "./modal/DeleteBoardModal";
import HeaderLogo from "./HeaderLogo";
import AddTaskMobileIcon from "@/assets/icon-add-task-mobile.svg";
import HeaderMenuButton from "./HeaderMenuButton";
import ChevronDownIcon from "@/assets/icon-chevron-down.svg";

import classes from "./Header.module.css";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Header({ onToggleSidebar }) {
  const newTaskModal = useRef();
  const editBoardModal = useRef();
  const deleteBoardModal = useRef();

  const activeBoard = useSelector(selectActiveBoard);
  const boardName = activeBoard.name;
  const isMobile = useMediaQuery("(max-width: 46.25em");

  function handleOpenNewTask() {
    newTaskModal.current.open();
  }

  function handleOpenEditBoard() {
    editBoardModal.current.open();
  }

  function handleOpenDeleteBoard() {
    deleteBoardModal.current.open();
  }

  return (
    <>
      <NewTaskModal ref={newTaskModal} />
      <EditBoardModal ref={editBoardModal} />
      <DeleteBoardModal ref={deleteBoardModal} boardName={boardName} />

      <header className={classes.header}>
        <HeaderLogo />

        <div className={classes.divider}></div>

        <div className={classes.mainHeader}>
          <div className={classes.heading} onClick={onToggleSidebar}>
            <h1>{activeBoard.name}</h1>
            {isMobile && <ChevronDownIcon />}
          </div>

          <div className={classes.btnGroup}>
            {isMobile ? (
              <button className={classes.plusBtn}>
                <AddTaskMobileIcon className={classes.plusIcon} />
              </button>
            ) : (
              <button className={classes.addBtn} onClick={handleOpenNewTask}>
                + Add New Tasks
              </button>
            )}

            <HeaderMenuButton
              onEditBoard={handleOpenEditBoard}
              onDeleteBoard={handleOpenDeleteBoard}
            />
          </div>
        </div>
      </header>
    </>
  );
}
