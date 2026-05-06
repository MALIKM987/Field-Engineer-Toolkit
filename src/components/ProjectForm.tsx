import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import type { ProjectFormData } from "../types";
import { todayInputValue } from "../utils/date";
import { validateProjectInput } from "../utils/validation";

interface ProjectFormProps {
  onCreateProject: (data: ProjectFormData) => void;
}

export function ProjectForm({ onCreateProject }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    date: todayInputValue(),
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProjectInput(formData);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    onCreateProject({
      name: formData.name.trim(),
      description: formData.description.trim(),
      date: formData.date,
    });
    setFormData({ name: "", description: "", date: todayInputValue() });
  }

  return (
    <form className="panel space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold text-slate-950">Nowy projekt</h2>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <label className="block">
        <span className="field-label">Nazwa</span>
        <input
          className="field-input"
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          placeholder="Modernizacja stanowiska A"
        />
      </label>

      <label className="block">
        <span className="field-label">Opis</span>
        <textarea
          className="field-input min-h-28 resize-y"
          value={formData.description}
          onChange={(event) =>
            setFormData((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Zakres pomiarów, lokalizacja, uwagi"
        />
      </label>

      <label className="block">
        <span className="field-label">Data</span>
        <input
          className="field-input"
          type="date"
          value={formData.date}
          onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
        />
      </label>

      <button className="primary-button w-full" type="submit">
        <Plus size={18} aria-hidden="true" />
        Utwórz projekt
      </button>
    </form>
  );
}
