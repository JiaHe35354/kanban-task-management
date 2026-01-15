import { useEffect, useRef, useState } from "react";
import EllipsisIcon from "@/assets/icon-vertical-ellipsis.svg";

import classes from "./MenuButton.module.css";

export default function MenuButton({ onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  function toggleMenu(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownOffset = 18;

    setDropdownPos({
      top: rect.bottom + dropdownOffset,
      left: rect.left + rect.width / 2,
    });

    setIsMenuOpen((prev) => !prev);
  }

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
        aria-controls="options-menu"
        onClick={toggleMenu}
      >
        <EllipsisIcon />
      </button>

      {isMenuOpen && (
        <ul
          ref={menuRef}
          role="menu"
          id="options-menu"
          className={`${classes.dropdownMenu} ${
            isMenuOpen ? classes.open : ""
          } `}
          // style={{
          //   top: `${dropdownPos.top}px`,
          //   left: `${dropdownPos.left}px`,
          //   transform: "translateX(-50%)",
          //   position: "fixed",
          // }}
        >
          <li className={classes.menuItem} onClick={onEdit}>
            Edit Task
          </li>
          <li
            className={`${classes.menuItem} ${classes.danger}`}
            onClick={onDelete}
          >
            Delete Task
          </li>
        </ul>
      )}
    </div>
  );
}
