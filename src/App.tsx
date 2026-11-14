import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { Button, Icon, IconButton, type IconName } from "./components/ui";
import { cn } from "./utils/cn";
import type { Go, ThemeSetting, View } from "./types";
import Home from "./screens/Home";
import Topics from "./screens/Topics";
import Saved from "./screens/Saved";
import Progress from "./screens/Progress";
import Creator from "./screens/Creator";
import Settings from "./screens/Settings";
import Session from "./screens/Session";
import Results from "./screens/Results";

const NAV: { name: View["name"]; label: string; icon: IconName }[] = [
  { name: "home", label: "Home", icon: "home" },
  { name: "topics", label: "Topics", icon: "layers" },
  { name: "saved", label: "Saved", icon: "bookmark" },
  { name: "progress", label: "Progress", icon: "chart" },
  { name: "creator", label: "My MCQs", icon: "pen" },
];

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function useSystemDark(): boolean {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setDark(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

function resolveTheme(setting: ThemeSetting, systemDark: boolean): "light" | "dark" {
  if (setting === "system") return systemDark ? "dark" : "light";
  return setting;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <Icon name="target" className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-bold leading-tight text-slate-900 dark:text-white">Administrative Ethics</p>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">MCQ Practice · 230 questions</p>
        </div>
      )}
    </div>
  );
}

function Shell() {
  const { state, setSettings } = useStore();
  const [view, setView] = useState<View>({ name: "home" });
  const online = useOnline();
  const systemDark = useSystemDark();
  const resolved = resolveTheme(state.settings.theme, systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", resolved === "dark" ? "#060a14" : "#4f46e5");
  }, [resolved]);

  const go = useCallback<Go>((v) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const immersive = view.name === "session";
  const activeTab = view.name === "results" ? "progress" : view.name;
  const toggleTheme = () => setSettings({ theme: resolved === "dark" ? "light" : "dark" });
  const sessionInProgress = !!state.active && view.name !== "session";

  let content: ReactNode;
  switch (view.name) {
    case "home":
      content = <Home go={go} />;
      break;
    case "topics":
      content = <Topics go={go} />;
      break;
    case "saved":
      content = <Saved go={go} />;
      break;
    case "progress":
      content = <Progress go={go} />;
      break;
    case "creator":
      content = <Creator go={go} />;
      break;
    case "settings":
      content = <Settings />;
      break;
    case "session":
      content = <Session go={go} />;
      break;
    case "results":
      content = <Results id={view.id} go={go} />;
      break;
  }

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      {!immersive && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl md:flex dark:border-white/[0.08] dark:bg-slate-950/60">
          <div className="space-y-8">
            <button type="button" onClick={() => go({ name: "home" })} className="text-left">
              <Brand />
            </button>
            <nav className="space-y-1.5" aria-label="Main">
              {NAV.map((n) => {
                const on = activeTab === n.name;
                return (
                  <button
                    key={n.name}
                    type="button"
                    onClick={() => go({ name: n.name } as View)}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex w-full min-h-11 items-center gap-3 rounded-2xl px-3.5 text-left text-sm font-semibold transition duration-200",
                      on
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                    )}
                  >
                    <Icon name={n.icon} />
                    {n.label}
                  </button>
                );
              })}
            </nav>
            {sessionInProgress && (
              <Button variant="soft" block onClick={() => go({ name: "session" })}>
                <Icon name="play" className="h-4 w-4" />
                Resume session
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-slate-900/[0.04] px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", online ? "bg-emerald-500" : "bg-amber-500")} />
                {online ? "Online" : "Offline mode"}
              </span>

            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => go({ name: "settings" })}>
                <Icon name="sliders" className="h-4 w-4" />
                Settings
              </Button>
              <IconButton label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
                <Icon name={resolved === "dark" ? "sun" : "moon"} />
              </IconButton>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      {!immersive && (
        <header className="pt-safe sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/75 px-4 py-2.5 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-slate-950/70">
          <button type="button" onClick={() => go({ name: "home" })} className="min-w-0 text-left">
            <Brand />
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "mr-1 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex",
                online ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-emerald-500" : "bg-amber-500")} />
              {online ? "Online" : "Offline"}
            </span>
            <IconButton label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
              <Icon name={resolved === "dark" ? "sun" : "moon"} />
            </IconButton>
            <IconButton label="Settings" onClick={() => go({ name: "settings" })}>
              <Icon name="sliders" />
            </IconButton>
          </div>
        </header>
      )}

      <main className={cn("min-h-dvh", !immersive && "md:pl-72")}>
        <div
          className={cn(
            "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
            immersive ? "py-0" : "py-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:py-10 md:pb-12",
          )}
        >
          <div key={view.name + (view.name === "results" ? view.id : "")} className={immersive ? "" : "animate-fade-up"}>
            {content}
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      {!immersive && (
        <nav
          aria-label="Main"
          className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/85 px-2 pt-2 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-slate-950/85"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {NAV.map((n) => {
              const on = activeTab === n.name;
              return (
                <button
                  key={n.name}
                  type="button"
                  onClick={() => go({ name: n.name } as View)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition duration-200 active:scale-95",
                    on ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition duration-300",
                      on && "bg-indigo-500/12 dark:bg-indigo-400/15",
                    )}
                  >
                    <Icon name={n.icon} className="h-5 w-5" />
                  </span>
                  {n.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
