// components/ui/ConfirmDialog.jsx
import { Button } from "./Button";

export function ConfirmDialog({
  title        = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel  = "Cancelar",
  onConfirm,
  onCancel,
}) {
  return (

    <div className="modal-overlay">
      <div className="confirm-card">

        {/* Ícono de advertencia */}
        <div className="confirm-icon">⚠️</div>

        <h3 className="confirm-title">{title}</h3>

        {message && (
          <p className="confirm-msg">{message}</p>
        )}

        <div className="confirm-actions">
          {/* ghost = acción segura */}
          <Button variant="ghost"  onClick={onCancel}>
            {cancelLabel}
          </Button>

          {/* danger = acción destructiva */}
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}