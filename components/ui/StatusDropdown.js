import { useRef, useState } from "react";

import ChevronDownIcon from "@/assets/icon-chevron-down.svg";
import classes from "./StatusDropdown.module.css";

export default function StatusDropDown({ value, options, onChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const buttonRef = useRef();

  function toggleMenu() {
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownOffset = 10;

    setDropdownPos({
      top: rect.bottom + dropdownOffset,
      left: rect.left,
      width: rect.width,
    });

    setMenuOpen((prev) => !prev);
  }

  function handleSelect(option) {
    onChange(option.name);
    setMenuOpen(false);
  }

  return (
    <div className={classes.dropdown}>
      <button
        type="button"
        ref={buttonRef}
        className={classes.statusBtn}
        onClick={toggleMenu}
      >
        <span>{value}</span>
        <span className={classes.icon}>
          <ChevronDownIcon />
        </span>
      </button>

      {menuOpen && (
        <ul
          className={classes.statusList}
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {options.map((option) => (
            <li key={option.name} className={classes.statusItem}>
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
