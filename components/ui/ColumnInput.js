export default function ColumnInput({
  column,
  isInvalid,
  disabled,
  onUpdate,
  onRemove,
  showRemove,
}) {
  return (
    <div className="row">
      <div className="inputWrapper">
        <input
          type="text"
          disabled={disabled}
          value={column.name}
          onChange={(e) => onUpdate(column.id, e.target.value)}
          className={isInvalid ? "inputError" : ""}
        />
        {isInvalid && <p className="errorText">Can't be empty</p>}
      </div>
      {showRemove && (
        <button
          type="button"
          className="closeBtn"
          disabled={disabled}
          onClick={() => onRemove(column.id)}
        >
          <CrossIcon />
        </button>
      )}
    </div>
  );
}
