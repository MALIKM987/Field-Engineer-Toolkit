# Field Engineer Toolkit

Mobile-first web MVP for field and laboratory engineers. The app helps create measurement projects, record measurements, run everyday electrical calculations, and export simple PDF reports.

The current version supports creating, editing, and deleting both projects and measurements.

## Features

- Create measurement projects with name, description, and date.
- Edit and delete measurement projects with confirmation.
- Add measurements with name, value, unit, comment, timestamp.
- Edit and delete measurements with confirmation.
- Browse measurement history in a responsive table.
- Use engineering calculators:
  - Ohm's law,
  - electrical power,
  - voltage divider,
  - RC filter cutoff frequency,
  - frequency <-> period conversion,
  - Vpp <-> Vrms conversion for sine waves.
- Export a project report to PDF.
- Export all projects to JSON and import projects from JSON with structure validation.
- Store data locally in the browser with `localStorage`.
- Mobile-first UI with touch-friendly controls and desktop layout support.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- jsPDF + jsPDF AutoTable
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run unit tests:

```bash
npm run test
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  components/        Reusable UI components
  hooks/             Shared React hooks
  lib/
    calculators/     Pure calculator logic independent from UI
    reports/         PDF report generation
    storage/         Local data persistence adapter
  screens/           Route-level screens
  types/             Domain and calculator types
  utils/             Validation, dates, IDs, number helpers
```

## Routes

- `/` - projects list and project creation
- `/projects/:projectId` - project details, measurements, PDF export
- `/calculators` - engineering calculators
- `/settings` - app status and future migration notes

## Data Storage

The MVP stores projects in browser `localStorage` under:

```text
field-engineer-toolkit.projects
```

The storage logic is isolated in `src/lib/storage`, so it can later be replaced with IndexedDB, a PWA-friendly storage layer, or Capacitor storage.

The app can export all projects to a JSON file and import projects from JSON after validating the file structure and asking for overwrite confirmation.

## JSON Backup

Use `Settings -> Import i eksport danych` to export all projects to a JSON backup file. Import validates the JSON structure before replacing current browser data and asks for confirmation before overwriting.

## Tests

Unit tests are written with Vitest and cover calculator logic, calculator input validation, and JSON project import validation. Run them with:

```bash
npm run test
```

## Roadmap

1. Web MVP: React + TypeScript + Vite + Tailwind.
2. PWA: manifest, service worker, offline-ready shell, install prompt.
3. Android: Capacitor integration and APK/AAB generation.

Planned product improvements:

- Configurable units and calculator presets.
- Richer PDF report templates.
- Optional IndexedDB storage migration.

## License

No license has been selected yet.
