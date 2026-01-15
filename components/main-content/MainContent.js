"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ShowSidebarIcon from "@/assets/icon-show-sidebar.svg";

import classes from "./MainContent.module.css";

export default function MainContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      <Header />

      <aside className={classes.sidebarColumn}>
        <div
          className={`${classes.sidebarBody} ${
            isSidebarOpen ? classes.open : classes.closed
          }`}
        >
          <Sidebar onHide={handleHideSidebar} />
        </div>
      </aside>

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
