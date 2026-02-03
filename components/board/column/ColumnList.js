import { useContext } from "react";

import { BoardContext } from "@/app/context/BoardContext.js";
import Column from "./Column.js";

import classes from "./Column.module.css";

export default function ColumnList() {
  const { columns } = useContext(BoardContext);

  return (
    <ul className={classes.columnList}>
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}

      <li className={classes.emptyColumn}>
        <button className={classes.addColumnBtn}>+ New Column</button>
      </li>
    </ul>
  );
}
