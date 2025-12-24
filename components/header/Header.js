import classes from "./header.module.css";

export default function Header() {
  return (
    <header className={classes.header}>
      <h1>Platform Launch</h1>
      <div className={classes["btn-group"]}>
        <button className="add-btn btn-inactive">+ Add New Task</button>
        <button className={classes["kebab-btn"]} aria-label="Board options">
          <img src="/assets/icon-vertical-ellipsis.svg" alt="" />
        </button>
      </div>
    </header>
  );
}
