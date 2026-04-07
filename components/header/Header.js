"use client";

import { useContext, useRef } from "react";

import { BoardStateContext } from "@/context/board/BoardProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import NewTaskModal from "./modal/NewTaskModal";
import EditBoardModal from "./modal/EditBoardModal";
import DeleteBoardModal from "./modal/DeleteBoardModal";
import HeaderLogo from "./HeaderLogo";
import AddTaskMobileIcon from "@/assets/icon-add-task-mobile.svg";
import HeaderMenuButton from "./HeaderMenuButton";
import ChevronDownIcon from "@/assets/icon-chevron-down.svg";
import SkeletonTitle from "../ui/skeletons/SkeletonTitle";

import classes from "./Header.module.css";
import "@/app/globals.css";

export default function Header({ error, onToggleSidebar, isOpen }) {
  const { activeBoard, boards, isBoardLoading } = useContext(BoardStateContext);

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
    if (!activeBoard) return;

    deleteBoardModal.current.open(activeBoard.id);
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
            {isBoardLoading ? (
              <SkeletonTitle />
            ) : activeBoard ? (
              <h1>{activeBoard.name}</h1>
            ) : (
              <h1>No board found</h1>
            )}

            {isMobile && (
              <ChevronDownIcon
                className={`${classes.chevronIcon} ${
                  isOpen ? classes.open : ""
                }`}
              />
            )}
          </button>

          <div className={classes.btnGroup}>
            <button
              className={`${isMobile ? classes.plusBtn : "addBtn"}  `}
              onClick={handleOpenNewTask}
              disabled={!activeBoard || error || boards.length === 0}
            >
              {isMobile ? (
                <AddTaskMobileIcon className={classes.plusIcon} />
              ) : (
                "+ Add New Tasks"
              )}
            </button>

            <HeaderMenuButton
              error={error}
              onOpenDelete={handleOpenDeleteBoard}
              onOpenEdit={handleOpenEditBoard}
            />
          </div>
        </div>
      </header>
    </>
  );
}
