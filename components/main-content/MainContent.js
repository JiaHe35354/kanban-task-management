"use client";

import { useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ShowSidebarIcon from "@/assets/icon-show-sidebar.svg";
import NewBoardModal from "./new-board-modal/NewBoardModal";

import classes from "./MainContent.module.css";

export default function MainContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const modal = useRef();

  // 740px:
  const isMobile = useMediaQuery("(max-width:46.25em)");

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
      <NewBoardModal ref={modal} />
      <div
        className={`${classes.appLayout} ${
          isSidebarOpen ? classes.sidebarOpen : classes.sidebarClosed
        }`}
      >
        <Header
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
                onHide={handleHideSidebar}
                onCreateBoard={handleOpenModal}
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
              <Sidebar onCreateBoard={handleOpenModal} isMobile={isMobile} />
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
