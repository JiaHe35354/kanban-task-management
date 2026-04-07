import { useCallback } from "react";

export function useModalCleanup(
  dialogRef,
  resetForm = () => {},
  onClose = () => {},
) {
  const handleBackdropClick = useCallback(
    (e) => {
      if (!dialogRef.current) return;

      const rect = dialogRef.current.getBoundingClientRect();
      const isClickOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (isClickOutside) {
        dialogRef.current.close();
        resetForm();
        onClose();
      }
    },
    [dialogRef, resetForm, onClose],
  );

  const handleEscKey = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return { handleBackdropClick, handleEscKey };
}
