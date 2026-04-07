import { useContext, useEffect, useRef, useState } from "react";

import EllipsisIcon from "@/assets/icon-vertical-ellipsis.svg";

import classes from "./HeaderMenuButton.module.css";
import { BoardStateContext } from "@/context/board/BoardProvider";

export default function HeaderMenuButton({ error, onOpenEdit, onOpenDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const { boards } = useContext(BoardStateContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={classes.kebabMenu}>
      <button
        ref={buttonRef}
        className={classes.kebabBtn}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls="board-options-menu"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        disabled={boards.length === 0 || error}
      >
        <EllipsisIcon />
      </button>

      <ul
        ref={menuRef}
        role="menu"
        id="board-options-menu"
        className={`${classes.dropdownMenu} ${isMenuOpen ? classes.open : ""} `}
      >
        <li className={classes.menuItem}>
          <button
            className={classes.menuBtn}
            type="button"
            onClick={() => {
              onOpenEdit();
              setIsMenuOpen(false);
            }}
          >
            Edit Board
          </button>
        </li>
        <li className={`${classes.menuItem} ${classes.danger}`}>
          <button
            className={classes.menuBtn}
            type="button"
            onClick={() => {
              onOpenDelete();
              setIsMenuOpen(false);
            }}
          >
            Delete Board
          </button>
        </li>
      </ul>
    </div>
  );
}
