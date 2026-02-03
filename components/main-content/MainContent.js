"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createBoard, getBoardsByUser } from "@/lib/firestore/boards";
import { createColumn } from "@/lib/firestore/columns";

import { BoardContext } from "@/app/context/BoardContext";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ShowSidebarIcon from "@/assets/icon-show-sidebar.svg";
import NewBoardModal from "./new-board-modal/NewBoardModal";

import classes from "./MainContent.module.css";

export default function MainContent({ children }) {
  const { selectBoard, cerateNewBoard } = useContext(BoardContext);

  const modal = useRef();

  // 740px:
  const isMobile = useMediaQuery("(max-width:46.25em)");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // async function handleCreateTask({ title, description, status, subtasks }) {
  //   const column = columns.find((c) => c.name === status);
  //   if (!column) return;

  //   const order = tasks.filter((t) => t.columnId === column.id).length;

  //   // 🔹 optimistic UI later
  //   await createTask(activeBoardId, column.id, title, description, order);

  //   // then create subtasks
  // }

  function handleSelectBoard(boardId) {
    selectBoard(boardId);

    if (isMobile) setIsMobileSidebarOpen(false);
  }

  function handleOpenModal() {
    if (isMobile) setIsMobileSidebarOpen(false);

    //Wait for DOM update:
    requestAnimationFrame(() => {
      modal.current.open();
    });
  }

  function handleHideSidebar() {
    setIsSidebarOpen(false);
  }

  function handleShowSidebar() {
    setIsSidebarOpen(true);
  }

  function handleHideMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  return (
    <>
      <NewBoardModal ref={modal} onCreateBoard={cerateNewBoard} />

      <div
        className={`${classes.appLayout} ${
          isSidebarOpen ? classes.sidebarOpen : classes.sidebarClosed
        }`}
      >
        <Header
          isOpen={isMobileSidebarOpen}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {!isMobile && (
          <aside className={classes.sidebarColumn}>
            <div
              className={`${classes.sidebarBody} ${
                isSidebarOpen ? classes.open : classes.closed
              }`}
            >
              <Sidebar
                onSelectBoard={handleSelectBoard}
                onHide={handleHideSidebar}
                onOpenModal={handleOpenModal}
                isMobile={isMobile}
              />
            </div>
          </aside>
        )}

        {isMobile && isMobileSidebarOpen && (
          <>
            <div
              className={`${classes.backdrop} ${
                isMobileSidebarOpen ? "fade-in" : "fade-out"
              }`}
              onClick={handleHideMobileSidebar}
            />
            <div className={`${classes.mobileSidebar} fade-in`}>
              <Sidebar
                onSelectBoard={handleSelectBoard}
                onOpenModal={handleOpenModal}
                isMobile={isMobile}
              />
            </div>
          </>
        )}

        <main className={classes.mainContent}>
          {children}

          {!isSidebarOpen && !isMobile && (
            <button className={classes.btnShow} onClick={handleShowSidebar}>
              <ShowSidebarIcon />
            </button>
          )}
        </main>
      </div>
    </>
  );
}
