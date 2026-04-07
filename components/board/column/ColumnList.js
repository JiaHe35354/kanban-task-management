import { useContext, useRef } from "react";

import { BoardStateContext } from "@/context/board/BoardProvider";
import NewColumnModal from "./new-column/NewColumnModal.js";
import Column from "./Column.js";

import classes from "./Column.module.css";

export default function ColumnList() {
  const { boards, columns, isDataLoading } = useContext(BoardStateContext);

  const modal = useRef();

  function handleOpenModal() {
    modal.current.open();
  }

  return (
    <>
      <NewColumnModal ref={modal} />

      <ul className={classes.columnList}>
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}

        {!isDataLoading && boards.length > 0 && (
          <li className={classes.newColumn}>
            <button className={classes.addColumnBtn} onClick={handleOpenModal}>
              + New Column
            </button>
          </li>
        )}
      </ul>
    </>
  );
}
