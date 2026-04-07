"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import {
  BoardActionsContext,
  BoardStateContext,
} from "@/context/board/BoardProvider";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ShowSidebarIcon from "@/assets/icon-show-sidebar.svg";
import NewBoardModal from "./new-board-modal/NewBoardModal";
import SkeletonColumn from "../ui/skeletons/SkeletonColumn";

import "@/app/globals.css";
import classes from "./MainContent.module.css";

export default function MainContent({ children }) {
  const { boards, isBoardLoading, isDataLoading, error } =
    useContext(BoardStateContext);
  const { selectBoard, loadBoards, loadBoardData } =
    useContext(BoardActionsContext);

  const modal = useRef();

  // 740px:
  const isMobile = useMediaQuery("(max-width:46.25em)");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const BoardSkeleton = (
    <div className={classes.boardSkeletonWrapper}>
      <div className={classes.columnListSkeleton}>
        <SkeletonColumn />
        <SkeletonColumn />
        <SkeletonColumn />
      </div>
    </div>
  );

  if (error && boards.length === 0) {
    return (
      <div className={classes.errorOverlay}>
        <div className={classes.errorCard}>
          <h2>Oops! Something went wrong</h2>
          <p className={classes.text}>{error}</p>
          <button
            className="addBtn"
            onClick={() => {
              loadBoards();
            }}
          >
            Please Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewBoardModal ref={modal} />

      <div
        className={`${classes.appLayout} ${
          isSidebarOpen ? classes.sidebarOpen : classes.sidebarClosed
        }`}
      >
        <Header
          error={error}
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
            <aside
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
                isBoardLoading={isBoardLoading}
              />
            </div>
          </>
        )}

        <main
          className={`${classes.mainContent} ${boards.length === 0 || error ? classes.center : ""} `}
        >
          {error ? (
            <div className={classes.centerEmpty}>
              <div className={classes.emptyContent}>
                <h2>Board Load Failed</h2>
                <p className={classes.text}>{error}</p>
                <button
                  className="addBtn"
                  onClick={() => loadBoardData(activeBoardId)}
                >
                  Retry Loading Columns
                </button>
              </div>
            </div>
          ) : (
            <>
              {(isBoardLoading || isDataLoading) && BoardSkeleton}

              {!isBoardLoading && !isDataLoading && boards.length === 0 && (
                <div className={classes.centerEmpty}>
                  <div className={classes.emptyContent}>
                    <p className={classes.text}>
                      There are no boards available. Create a new board to get
                      started.
                    </p>
                    <button className="addBtn" onClick={handleOpenModal}>
                      + Create New Board
                    </button>
                  </div>
                </div>
              )}

              {!isBoardLoading &&
                !isDataLoading &&
                boards.length > 0 &&
                children}

              {!isSidebarOpen && !isMobile && (
                <button className={classes.btnShow} onClick={handleShowSidebar}>
                  <ShowSidebarIcon />
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
