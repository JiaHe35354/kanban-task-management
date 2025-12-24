"use client";

import { useState } from "react";

import classes from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  return (
    <fieldset
      className={classes.toggle}
      aria-label="theme toggle"
      role="radiogroup"
    >
      <label
        htmlFor="light"
        className={`${classes.label} ${classes["label-light"]}`}
      >
        <img
          src="/assets/icon-light-theme.svg"
          alt="Light theme icon"
          className={classes["icon-light"]}
        />
        <span className={classes["visually-hidden"]}>Light theme</span>
      </label>

      <div className={classes["toggle-wrapper"]} data-theme={theme}>
        <div className={classes.inputs}>
          <input
            type="radio"
            name="theme"
            id="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          <input
            type="radio"
            name="theme"
            id="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
        </div>
        <span aria-hidden="true" className={classes.background}></span>
        <span aria-hidden="true" className={classes.button}></span>
      </div>

      <label
        htmlFor="dark"
        className={`${classes.label} ${classes["label-dark"]}`}
      >
        <img
          src="/assets/icon-dark-theme.svg"
          alt="Dark theme icon"
          className={classes["icon-dark"]}
        />
        <span className={classes["visually-hidden"]}>Dark theme</span>
      </label>
    </fieldset>
  );
}
