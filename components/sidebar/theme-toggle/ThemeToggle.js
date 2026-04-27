"use client";

import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import LightThemeIcon from "/assets/icon-light-theme.svg";
import DarkThemeIcon from "/assets/icon-dark-theme.svg";

import classes from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <fieldset
      className={classes.toggle}
      aria-label="theme toggle"
      role="radiogroup"
    >
      <label
        htmlFor="light"
        className={`${classes.label} ${classes.labelLight}`}
      >
        <LightThemeIcon className={classes.icon} />
        <span className={classes.visuallyHidden}>Light theme</span>
      </label>

      <div className={classes.toggleWrapper} data-theme={theme}>
        <div className={classes.inputs}>
          <input
            type="radio"
            name="theme"
            id="light"
            className={classes.radioInput}
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          <input
            type="radio"
            name="theme"
            id="dark"
            className={classes.radioInput}
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
        </div>
        <span aria-hidden="true" className={classes.background}></span>
        <span aria-hidden="true" className={classes.button}></span>
      </div>

      <label htmlFor="dark" className={`${classes.label} ${classes.labelDark}`}>
        <DarkThemeIcon className={classes.icon} />
        <span className={classes.visuallyHidden}>Dark theme</span>
      </label>
    </fieldset>
  );
}
