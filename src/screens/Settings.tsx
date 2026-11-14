import { useState } from "react";
import { useStore } from "../lib/store";
import { Button, Card, Icon, PageHeader, Segmented, Toggle } from "../components/ui";
import { BANK_SIZE } from "../data";
import { TIMER_SECONDS } from "../lib/quiz";
import type { ThemeSetting } from "../types";

export default function Settings() {
  const { state, setSettings, resetProgress, resetAll } = useStore();
  const [message, setMessage] = useState<string | null>(null);
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  const exportProgress = () => {
    const payload = {
      app: "Administrative Ethics MCQ Practice",
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      creatorUnlocked: state.creatorUnlocked,
      bookmarks: state.bookmarks,
      latest: state.latest,
      history: state.history,
      custom: state.custom,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ethics-mcq-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMessage("Progress exported as a JSON file.");
  };

  const confirmReset = () => {
    if (window.confirm("Reset all progress? Answers, bookmarks, history and creator unlock will be cleared. Personal MCQs are kept.")) {
      resetProgress();
      setMessage("Progress has been reset.");
    }
  };

  const confirmEraseAll = () => {
    if (window.confirm("Erase everything stored on this device, including personal MCQs and settings? This cannot be undone.")) {
      resetAll();
      setMessage("All local data has been erased.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" subtitle="Appearance, timing and your local data. Nothing is sent to a server." />

      {message && (
        <div className="animate-fade-up flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          <Icon name="check" className="h-5 w-5" />
          {message}
        </div>
      )}

      <Card className="space-y-5">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">Appearance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Light, dark, or follow your device.</p>
        </div>
        <Segmented<ThemeSetting>
          value={state.settings.theme}
          onChange={(v) => setSettings({ theme: v })}
          options={[
            { value: "light", label: "Light", icon: "sun" },
            { value: "dark", label: "Dark", icon: "moon" },
            { value: "system", label: "System", icon: "monitor" },
          ]}
        />
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">Practice timing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Each question gets a {TIMER_SECONDS}-second timer. When it runs out, your current selection is submitted (or the question counts as unanswered).
          </p>
        </div>
        <Toggle
          checked={state.settings.timer}
          onChange={(v) => setSettings({ timer: v })}
          label={`${TIMER_SECONDS}-second timer per question`}
          description="Applies to Practice All, Topic, Wrong-Answer and Bookmark sessions. Exam Mode always uses the timer."
        />
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">Your data</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Progress is saved automatically in this browser. Export a backup file at any time.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="secondary" onClick={exportProgress}>
            <Icon name="download" className="h-4 w-4" />
            Export progress
          </Button>
          <Button variant="secondary" onClick={confirmReset}>
            <Icon name="refresh" className="h-4 w-4" />
            Reset progress
          </Button>
          <Button variant="danger" onClick={confirmEraseAll}>
            <Icon name="trash" className="h-4 w-4" />
            Erase all data
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-white">Offline use</h2>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`} />
          {online ? "Connected" : "Offline — the app is still fully usable"}
        </div>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          After the first visit the app caches itself, so it keeps working without an internet connection. All {BANK_SIZE} questions
          and your progress live on this device.
        </p>
      </Card>

      <p className="px-1 text-center text-xs text-slate-400">
        Administrative Ethics MCQ Practice · {BANK_SIZE} questions · no account, no tracking
      </p>
    </div>
  );
}
