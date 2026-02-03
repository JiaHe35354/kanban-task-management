"use client";


import ColumnList from "./column/ColumnList";

import classes from "./Board.module.css";

export default function Board() {


  return (
    <div className={classes.board}>
      <ColumnList  />
    </div>
  );
}
