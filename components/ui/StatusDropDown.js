import { useEffect, useRef, useState } from "react";

import ChevronDownIcon from "@/assets/icon-chevron-down.svg";
import classes from "./StatusDropDown.module.css";

export default function StatusDropDown({ value, options, onChange, disabled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);

  const buttonRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function toggleMenu() {
    if (disabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownOffset = 10;

    setDropdownPos({
      top: rect.bottom + dropdownOffset,
      left: rect.left,
      width: rect.width,
    });

    setMenuOpen((prev) => !prev);
  }

  function handleSelect(option, e) {
    e.stopPropagation();

    onChange(option.id);
    setMenuOpen(false);
  }

  return (
    <div className={classes.dropdown} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className={classes.statusBtn}
        disabled={disabled}
        onClick={toggleMenu}
      >
        <span className={classes.statusValue}>{value}</span>
        <span className={classes.icon}>
          <ChevronDownIcon />
        </span>
      </button>

      {!disabled && menuOpen && (
        <ul
          className={classes.statusList}
          onClick={(e) => e.stopPropagation()}
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {options.map((option) => (
            <li key={option.id} className={classes.statusItem}>
              <button
                type="button"
                className={classes.statusItemBtn}
                onClick={(e) => handleSelect(option, e)}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
