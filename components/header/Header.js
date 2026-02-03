"use client";

import { useContext, useRef } from "react";

import NewTaskModal from "./modal/NewTaskModal";
import EditBoardModal from "./modal/EditBoardModal";
import DeleteBoardModal from "./modal/DeleteBoardModal";
import { BoardContext } from "@/app/context/BoardContext";
import HeaderLogo from "./HeaderLogo";
import AddTaskMobileIcon from "@/assets/icon-add-task-mobile.svg";
import HeaderMenuButton from "./HeaderMenuButton";
import ChevronDownIcon from "@/assets/icon-chevron-down.svg";

import classes from "./Header.module.css";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Header({ onToggleSidebar, isOpen }) {
  const { activeBoard } = useContext(BoardContext);

  const newTaskModal = useRef();
  const editBoardModal = useRef();
  const deleteBoardModal = useRef();

  const isMobile = useMediaQuery("(max-width: 46.25em)");

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
      <DeleteBoardModal ref={deleteBoardModal} />

      <header className={classes.header}>
        <HeaderLogo />

        <div className={classes.divider}></div>

        <div className={classes.mainHeader}>
          <button className={classes.heading} onClick={onToggleSidebar}>
            <h1>{activeBoard ? activeBoard.name : "No board found"}</h1>
            {isMobile && (
              <ChevronDownIcon
                className={`${classes.chevronIcon} ${
                  isOpen ? classes.open : ""
                }`}
              />
            )}
          </button>

          <div className={classes.btnGroup}>
            {isMobile ? (
              <button className={classes.plusBtn} onClick={handleOpenNewTask}>
                <AddTaskMobileIcon className={classes.plusIcon} />
              </button>
            ) : (
              <button className={classes.addBtn} onClick={handleOpenNewTask}>
                + Add New Tasks
              </button>
            )}

            <HeaderMenuButton
              onOpenDelete={handleOpenDeleteBoard}
              onOpenEdit={handleOpenEditBoard}
            />
          </div>
        </div>
      </header>
    </>
  );
}
