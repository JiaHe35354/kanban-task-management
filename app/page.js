import classes from "./page.module.css";

export default function Home() {
  return (
    <div className={classes["empty-content"]}>
      <p>This board is empty. Create a new column to get started.</p>
      <button className="add-btn">+ Add New Column</button>
    </div>
  );
}
