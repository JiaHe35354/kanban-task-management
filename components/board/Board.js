"use client";

import { useSelector } from "react-redux";
import { selectColumnsOfActiveBoard } from "@/store/boardSelector";
import ColumnList from "./column/ColumnList";

import classes from "./Board.module.css";

export default function Board() {
  const columns = useSelector(selectColumnsOfActiveBoard);

  return (
    <div className={classes.board}>
      <ColumnList columns={columns} />
    </div>
  );
}
