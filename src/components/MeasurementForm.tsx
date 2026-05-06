import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import type { MeasurementFormData } from "../types";
import { dateTimeInputValue } from "../utils/date";
import { validateMeasurementInput } from "../utils/validation";

interface MeasurementFormProps {
  onAddMeasurement: (data: MeasurementFormData) => void;
}

export function MeasurementForm({ onAddMeasurement }: MeasurementFormProps) {
  const [formData, setFormData] = useState<MeasurementFormData>({
    name: "",
    value: "",
    unit: "",
    comment: "",
    timestamp: dateTimeInputValue(),
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateMeasurementInput(formData);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    onAddMeasurement({
      name: formData.name.trim(),
      value: formData.value.trim(),
      unit: formData.unit.trim(),
      comment: formData.comment.trim(),
      timestamp: formData.timestamp,
    });

    setFormData({
      name: "",
      value: "",
      unit: "",
      comment: "",
      timestamp: dateTimeInputValue(),
    });
  }

  return (
    <form className="panel space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold text-slate-950">Nowy pomiar</h2>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Nazwa pomiaru</span>
          <input
            className="field-input"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Napięcie zasilania"
          />
        </label>

        <label className="block">
          <span className="field-label">Data i godzina</span>
          <input
            className="field-input"
            type="datetime-local"
            value={formData.timestamp}
            onChange={(event) =>
              setFormData((current) => ({ ...current, timestamp: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="grid grid-cols-[1fr_112px] gap-3">
        <label className="block">
          <span className="field-label">Wartość</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={formData.value}
            onChange={(event) =>
              setFormData((current) => ({ ...current, value: event.target.value }))
            }
            placeholder="12.4"
          />
        </label>

        <label className="block">
          <span className="field-label">Jednostka</span>
          <input
            className="field-input"
            value={formData.unit}
            onChange={(event) =>
              setFormData((current) => ({ ...current, unit: event.target.value }))
            }
            placeholder="V"
          />
        </label>
      </div>

      <label className="block">
        <span className="field-label">Komentarz</span>
        <textarea
          className="field-input min-h-24 resize-y"
          value={formData.comment}
          onChange={(event) =>
            setFormData((current) => ({ ...current, comment: event.target.value }))
          }
          placeholder="Warunki pomiaru, przyrząd, odchylenia"
        />
      </label>

      <button className="primary-button w-full" type="submit">
        <Plus size={18} aria-hidden="true" />
        Dodaj pomiar
      </button>
    </form>
  );
}
