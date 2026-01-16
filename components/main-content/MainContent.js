"use client";

import { useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ShowSidebarIcon from "@/assets/icon-show-sidebar.svg";

import classes from "./MainContent.module.css";

export default function MainContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 740px:
  const isMobile = useMediaQuery("(max-width:46.25em");

  function handleHideSidebar() {
    setIsSidebarOpen(false);
  }

  function handleShowSidebar() {
    setIsSidebarOpen(true);
  }

  return (
    <div
      className={`${classes.appLayout} ${
        isSidebarOpen ? classes.sidebarOpen : classes.sidebarClosed
      }`}
    >
      <Header onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

      {!isMobile && (
        <aside className={classes.sidebarColumn}>
          <div
            className={`${classes.sidebarBody} ${
              isSidebarOpen ? classes.open : classes.closed
            }`}
          >
            <Sidebar onHide={handleHideSidebar} />
          </div>
        </aside>
      )}

      {isMobile && isMobileSidebarOpen && (
        <div className={classes.mobileSideBar}>
          <Sidebar onHide={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      <main className={classes.mainContent}>
        {children}

        {!isSidebarOpen && (
          <button className={classes.btnShow} onClick={handleShowSidebar}>
            <ShowSidebarIcon />
          </button>
        )}
      </main>
    </div>
  );
}
