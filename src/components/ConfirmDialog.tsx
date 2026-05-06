import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  confirmLabel = "Usuń",
  description,
  title,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center">
      <div
        aria-modal="true"
        className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:max-w-md sm:p-5"
        role="dialog"
      >
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="secondary-button w-full sm:w-auto" onClick={onCancel} type="button">
            Anuluj
          </button>
          <button className="danger-button w-full sm:w-auto" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
