import ThemeToggle from "../theme-toggle/ThemeToggle";

import classes from "./sidebar.module.css";

export default function Sidebar() {
  const boards = ["Platform Launch", "Marketing Plan", "Roadmap"];

  return (
    <nav className={classes.navbar}>
      <div className={classes["boards-section"]}>
        <h2 className={classes["nav-title"]}>All boards (3)</h2>
        <ul className={classes.list}>
          {boards.map((board) => (
            <li
              key={board}
              className={`${classes["list-item"]} ${classes.active}`}
            >
              <img src="/assets/icon-board.svg" alt="" />
              {board}
            </li>
          ))}
        </ul>
        <button className={classes["create-btn"]}>
          <img src="/assets/icon-board.svg" alt="" />+ Create New Board
        </button>
      </div>

      <div className={classes["controls-section"]}>
        <ThemeToggle />
        <button className={classes["hide-sidebar-btn"]}>
          <img src="assets/icon-hide-sidebar.svg" /> Hide Sidebar
        </button>
      </div>
    </nav>
  );
}
