import { Pencil, Trash2 } from "lucide-react";
import type { Measurement } from "../types";
import { formatDateTime } from "../utils/date";
import { formatEngineeringNumber } from "../utils/numbers";

interface MeasurementTableProps {
  editingMeasurementId?: string | null;
  measurements: Measurement[];
  onDeleteMeasurement?: (measurement: Measurement) => void;
  onEditMeasurement?: (measurement: Measurement) => void;
}

export function MeasurementTable({
  editingMeasurementId,
  measurements,
  onDeleteMeasurement,
  onEditMeasurement,
}: MeasurementTableProps) {
  const sortedMeasurements = [...measurements].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );

  if (sortedMeasurements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Brak pomiarów w projekcie.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 font-bold">Nazwa</th>
              <th className="px-4 py-3 font-bold">Wartość</th>
              <th className="px-4 py-3 font-bold">Jednostka</th>
              <th className="px-4 py-3 font-bold">Komentarz</th>
              <th className="px-4 py-3 font-bold">Data i godzina</th>
              <th className="px-4 py-3 text-right font-bold">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMeasurements.map((measurement) => {
              const isEditing = measurement.id === editingMeasurementId;

              return (
                <tr className={isEditing ? "bg-teal-50/70" : undefined} key={measurement.id}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{measurement.name}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-800">
                    {formatEngineeringNumber(measurement.value)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{measurement.unit}</td>
                  <td className="max-w-80 px-4 py-3 text-slate-600">
                    {measurement.comment || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(measurement.timestamp)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEditMeasurement ? (
                        <button
                          className="secondary-button min-h-10 px-3 py-2"
                          onClick={() => onEditMeasurement(measurement)}
                          type="button"
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Edytuj
                        </button>
                      ) : null}
                      {onDeleteMeasurement ? (
                        <button
                          className="danger-button min-h-10 px-3 py-2"
                          onClick={() => onDeleteMeasurement(measurement)}
                          type="button"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Usuń
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
