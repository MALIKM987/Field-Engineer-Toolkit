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
- Export a project report to PDF in the browser or through Android system sharing.
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
- Capacitor Filesystem + Share
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
    files/           Shared web/native file export helpers
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
- `/settings` - language, appearance, JSON backup, and app information

## Data Storage

The MVP stores projects in browser `localStorage` under:

```text
field-engineer-toolkit.projects
```

The storage logic is isolated in `src/lib/storage`, so it can later be replaced with IndexedDB, a PWA-friendly storage layer, or Capacitor storage.

The app can export all projects to a JSON file and import projects from JSON after validating the file structure and asking for overwrite confirmation.

File export uses a shared layer in `src/lib/files`:

- Web/PWA: PDF and JSON are downloaded through browser file download.
- Android/Capacitor: the user can choose `Save` or `Share`.
- Android `Save`: writes the file to the app cache with `@capacitor/filesystem`. This is app-owned cache storage, not the public Downloads folder.
- Android `Share`: writes the file to the app cache, resolves it with `Filesystem.getUri()`, and opens the Android system share sheet with `@capacitor/share`.

Language and appearance preferences are also stored locally in the browser.

## JSON Backup

Use `Settings -> Import i eksport danych` to export all projects to a JSON backup file. Import validates the JSON structure before replacing current browser data and asks for confirmation before overwriting.

On Android, JSON backup export has separate save and share actions. Sharing opens the system share menu so the user can send the file to another app or save it through a system/file-manager target.

## Tests

Unit tests are written with Vitest and cover calculator logic, calculator input validation, JSON project import validation, and file export helpers. Run them with:

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

Native file export uses:

- `@capacitor/filesystem` for temporary cache writes,
- `@capacitor/share` for the Android share menu.

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

## Android Release Candidate

Before testing or building an Android release candidate, run:

```bash
npm run build
npm run test
npm run android:sync
```

Versioning:

- Web/package version: `0.1.0` in `package.json`.
- Android `versionName`: `0.1.0` in `android/app/build.gradle`.
- Android `versionCode`: `1` for the first internal release candidate. Increase it by 1 for every uploaded Google Play build.

Signed AAB generation:

1. Run `npm run android:sync`.
2. Open Android Studio with `npm run android:open`.
3. In Android Studio, choose `Build > Generate Signed Bundle / APK`.
4. Select `Android App Bundle`.
5. Use a local release keystore stored outside the repository.
6. Build the signed `.aab`.

Do not commit keystores, passwords, `key.properties`, or signing credentials. Keep signing files outside the project or in ignored local-only paths.

Physical phone RC checklist:

- Fresh install starts correctly.
- Projects can be created, edited, and deleted.
- Measurements can be created, edited, and deleted.
- JSON backup `Save` shows a clear app-cache success message.
- JSON backup `Share` opens the Android share sheet.
- PDF report `Save` shows a clear app-cache success message.
- PDF report `Share` opens the Android share sheet.
- Imported JSON keeps validation and overwrite confirmation.
- Calculators work, including waveform Vpp/Vrms.
- Light, dark, and system themes remain readable.
- PL/EN/DE/ES/FR language switching works.
- App works offline after first launch.

Branding and icons:

- Web/PWA icons live in `public/icons/`.
- The source logo asset is in `assets/icon-only.png`.
- Android launcher icons live in `android/app/src/main/res/mipmap-*`.
- Android adaptive icon XML lives in `android/app/src/main/res/mipmap-anydpi-v26/`.
- Google Play will also require store assets such as a 512x512 high-resolution app icon, feature graphic, screenshots, app description, privacy details, and content rating.

## Roadmap

Planned product improvements:

- Measurement photos.
- PDF reports with photos.
- IndexedDB for larger local datasets.
- Report and backup sharing from Android.
- Project attachments.
- New calculators:
  - LED resistor,
  - ADC/DAC,
  - dBm <-> W,
  - voltage drop on a cable,
  - battery runtime.

## License

No license has been selected yet.
