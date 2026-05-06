import type { Measurement } from "../types";
import { formatDateTime } from "../utils/date";
import { formatEngineeringNumber } from "../utils/numbers";

interface MeasurementTableProps {
  measurements: Measurement[];
}

export function MeasurementTable({ measurements }: MeasurementTableProps) {
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
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 font-bold">Nazwa</th>
              <th className="px-4 py-3 font-bold">Wartość</th>
              <th className="px-4 py-3 font-bold">Jednostka</th>
              <th className="px-4 py-3 font-bold">Komentarz</th>
              <th className="px-4 py-3 font-bold">Data i godzina</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMeasurements.map((measurement) => (
              <tr key={measurement.id}>
                <td className="px-4 py-3 font-semibold text-slate-950">{measurement.name}</td>
                <td className="px-4 py-3 tabular-nums text-slate-800">
                  {formatEngineeringNumber(measurement.value)}
                </td>
                <td className="px-4 py-3 text-slate-700">{measurement.unit}</td>
                <td className="max-w-80 px-4 py-3 text-slate-600">
                  {measurement.comment || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(measurement.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
