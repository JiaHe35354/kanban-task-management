import { useContext, useRef } from "react";

import { BoardStateContext } from "@/context/BoardContext.js";
import NewColumnModal from "./new-column/NewColumnModal.js";
import Column from "./Column.js";

import classes from "./Column.module.css";

export default function ColumnList({ activeId, overId, activeSize }) {
  const { columns } = useContext(BoardStateContext);

  const modal = useRef();

  function handleOpenModal() {
    modal.current.open();
  }

  return (
    <>
      <NewColumnModal ref={modal} />

      <ul className={classes.columnList}>
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            activeId={activeId}
            overId={overId}
            activeSize={activeSize}
          />
        ))}

        <li className={classes.newColumn}>
          <button className={classes.addColumnBtn} onClick={handleOpenModal}>
            + New Column
          </button>
        </li>
      </ul>
    </>
  );
}
