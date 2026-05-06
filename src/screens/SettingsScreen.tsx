import { Database, HardDrive, Smartphone } from "lucide-react";

export function SettingsScreen() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Ustawienia</h1>
        <p className="mt-1 text-sm text-slate-600">Status aplikacji i kierunek rozwoju.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="panel">
          <div className="flex items-center gap-3">
            <Database className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Magazyn danych</h2>
              <p className="mt-1 text-sm text-slate-600">localStorage</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center gap-3">
            <HardDrive className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Tryb</h2>
              <p className="mt-1 text-sm text-slate-600">Web MVP</p>
            </div>
          </div>
        </div>

        <div className="panel sm:col-span-2">
          <div className="flex items-center gap-3">
            <Smartphone className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">Kolejne etapy</h2>
              <p className="mt-1 text-sm text-slate-600">PWA, Capacitor, Android APK/AAB</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
