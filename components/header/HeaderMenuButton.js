import { useContext, useEffect, useRef, useState } from "react";
import { BoardContext } from "@/app/context/BoardContext";
import EditBoardModal from "./modal/EditBoardModal";
import EllipsisIcon from "@/assets/icon-vertical-ellipsis.svg";

import classes from "./HeaderMenuButton.module.css";

export default function HeaderMenuButton({ onOpenEdit, onOpenDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      >
        <EllipsisIcon />
      </button>

      <ul
        ref={menuRef}
        role="menu"
        id="board-options-menu"
        className={`${classes.dropdownMenu} ${isMenuOpen ? classes.open : ""} `}
      >
        <li className={classes.menuItem} onClick={onOpenEdit}>
          Edit Board
        </li>
        <li
          className={`${classes.menuItem} ${classes.danger}`}
          onClick={onOpenDelete}
        >
          Delete Board
        </li>
      </ul>
    </div>
  );
}
