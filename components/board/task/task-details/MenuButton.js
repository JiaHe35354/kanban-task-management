import { useEffect, useRef, useState } from "react";
import EllipsisIcon from "@/assets/icon-vertical-ellipsis.svg";

import classes from "./MenuButton.module.css";

export default function MenuButton({ onOpenEdit, onOpenDelete, disabled }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  function toggleMenu(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownOffset = 18;
    const dropdownWidth = 192;

    setDropdownPos({
      top: rect.bottom + dropdownOffset,
      left: rect.left + rect.width / 2 - dropdownWidth / 2,
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
        disabled={disabled}
      >
        <EllipsisIcon />
      </button>

      <ul
        ref={menuRef}
        role="menu"
        id="options-menu"
        className={`${classes.dropdownMenu} ${isMenuOpen ? classes.open : ""}`}
        style={
          dropdownPos
            ? {
                top: dropdownPos.top,
                left: dropdownPos.left,
              }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <li className={classes.menuItem}>
          <button
            type="button"
            className={classes.menuBtn}
            onClick={() => {
              setIsMenuOpen(false);
              onOpenEdit();
            }}
          >
            Edit Task
          </button>
        </li>
        <li className={`${classes.menuItem} ${classes.danger}`}>
          <button
            type="button"
            className={classes.menuBtn}
            onClick={() => {
              setIsMenuOpen(false);
              onOpenDelete();
            }}
          >
            Delete Task
          </button>
        </li>
      </ul>
    </div>
  );
}
