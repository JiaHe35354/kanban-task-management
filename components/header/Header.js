"use client";

import { useRef } from "react";
import { useSelector } from "react-redux";

import { selectActiveBoard } from "@/store/boardSelector";
import NewTaskModal from "./modal/NewTaskModal";
import EditBoardModal from "./modal/EditBoardModal";
import DeleteBoardModal from "./modal/DeleteBoardModal";
import HeaderLogo from "./HeaderLogo";
import HeaderMenuButton from "./HeaderMenuButton";

import classes from "./Header.module.css";

export default function Header() {
  const newTaskModal = useRef();
  const editBoardModal = useRef();
  const deleteBoardModal = useRef();

  const activeBoard = useSelector(selectActiveBoard);
  const boardName = activeBoard.name;

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
          <h1>{activeBoard.name}</h1>
          <div className={classes.btnGroup}>
            <button className={classes.addBtn} onClick={handleOpenNewTask}>
              + Add New Tasks
            </button>

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
