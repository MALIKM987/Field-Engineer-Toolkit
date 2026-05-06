# Field Engineer Toolkit

Mobile-first web MVP for field and laboratory engineers. The app helps create measurement projects, record measurements, run everyday electrical calculations, and export simple PDF reports.

The current version supports creating, editing, and deleting both projects and measurements.
It also includes language selection, light/dark/system appearance modes, and an expanded Vpp/Vrms calculator for common waveform types.

## Features

- Create measurement projects with name, description, and date.
- Edit and delete measurement projects with confirmation.
- Add measurements with name, value, unit, comment, timestamp.
- Edit and delete measurements with confirmation.
- Browse measurement history in a responsive table.
- Switch the UI language between Polish, English, German, Spanish, and French.
- Use light, dark, or system appearance mode.
- Use engineering calculators:
  - Ohm's law,
  - electrical power,
  - voltage divider,
  - RC filter cutoff frequency,
  - frequency <-> period conversion,
  - Vpp <-> Vrms conversion for sine, square, triangle, sawtooth, DC, PWM, and custom conversion factors.
- Export a project report to PDF.
- Export all projects to JSON and import projects from JSON with structure validation.
- Store data locally in the browser with `localStorage`.
- Mobile-first UI with touch-friendly controls and desktop layout support.

## Tech Stack

- React 18
- TypeScript
- Vite
- Vite PWA
- Tailwind CSS
- React Router
- Capacitor Android
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

Sync the web build into the Android project:

```bash
npm run android:sync
```

Open the Android project in Android Studio:

```bash
npm run android:open
```

Build and run through Capacitor:

```bash
npm run android:run
```

## Project Structure

```text
src/
  components/        Reusable UI components
  hooks/             Shared React hooks
  i18n/              Local dictionaries and language provider
  lib/
    calculators/     Pure calculator logic independent from UI
    reports/         PDF report generation
    storage/         Local data persistence adapter
  screens/           Route-level screens
  theme/             Light, dark, and system theme provider
  types/             Domain and calculator types
  utils/             Validation, dates, IDs, number helpers
android/             Capacitor Android project for Android Studio
```

The main application code stays in `src/`. The `android/` folder is only used to run, sync, and build the mobile wrapper in Android Studio.

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

Language and appearance preferences are also stored locally in the browser.

## JSON Backup

Use `Settings -> Import i eksport danych` to export all projects to a JSON backup file. Import validates the JSON structure before replacing current browser data and asks for confirmation before overwriting.

## Tests

Unit tests are written with Vitest and cover calculator logic, calculator input validation, and JSON project import validation. Run them with:

```bash
npm run test
```

Current tests also cover the extended Vpp/Vrms waveform calculations.

## Personalization

The settings screen lets the user choose the interface language and appearance mode.

Supported languages:

- Polish
- English
- German
- Spanish
- French

Appearance modes:

- Light
- Dark
- System

The selected language and theme are saved in `localStorage`, so they persist across refreshes and remain independent from project backup files.

## Waveform Vpp / Vrms Calculator

The Vpp/Vrms calculator supports idealized waveform conversions for:

- sine wave,
- symmetrical square wave,
- triangle wave,
- sawtooth wave,
- DC,
- PWM / rectangular waveform with duty cycle,
- custom conversion factor.

For AC waveforms, the calculator can include a DC offset and returns total RMS using the AC RMS component and the offset. The formulas assume ideal waveforms.

## PWA

The app is configured as a PWA with `vite-plugin-pwa`. Production builds generate a web manifest and service worker, so the app has an offline-ready shell and can be installed by supported browsers.

PWA metadata:

- `name`: Field Engineer Toolkit
- `short_name`: Field Toolkit
- `display`: standalone
- `theme_color`: `#0f766e`
- `background_color`: `#f5f7f4`

## Android / Capacitor

The Android target uses Capacitor and keeps the React application in `src/`. Do not move application logic into `android/`; Android Studio uses that folder as the native wrapper around the built web app.

Capacitor configuration:

- `appId`: `com.fieldengineer.toolkit`
- `appName`: `Field Engineer Toolkit`
- `webDir`: `dist`

After changing React, TypeScript, Tailwind, or assets in `src/` or `public/`, run this before testing in Android Studio:

```bash
npm run android:sync
```

Then open the generated Android project:

```bash
npm run android:open
```

For a device or emulator run through Capacitor:

```bash
npm run android:run
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
