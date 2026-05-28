import { useEffect, useMemo, useState } from "react";
import {
  CATALOG,
  CATEGORIES,
  appsByCategory,
  type Category,
} from "./catalog";
import { CategoryNav, type View } from "./components/CategoryNav";
import { CategoryGrid } from "./components/CategoryGrid";
import { Feed } from "./components/Feed";
import { QueueBadge } from "./components/QueueBadge";
import { SelectionBar } from "./components/SelectionBar";
import { Settings } from "./components/Settings";
import { WingetMissing } from "./components/WingetMissing";
import { checkWinget, listInstalled, onLog, onStatus } from "./lib/tauri";
import { useQueue } from "./store/queue";

type WingetState = "checking" | "ok" | "missing";

export default function App() {
  const [wingetState, setWingetState] = useState<WingetState>("checking");
  const [wingetVersion, setWingetVersion] = useState<string | null>(null);
  const [view, setView] = useState<View>("feed");
  const [query, setQuery] = useState("");

  const applyStatus = useQueue((s) => s.applyStatus);
  const applyLog = useQueue((s) => s.applyLog);
  const setInstalled = useQueue((s) => s.setInstalled);
  const installedCount = useQueue((s) => s.installed.size);

  useEffect(() => {
    const us1 = onStatus((e) =>
      applyStatus(e.id, e.status, e.code ?? null, e.message ?? null),
    );
    const us2 = onLog((e) => applyLog(e.id, e.line));
    return () => {
      us1.then((u) => u());
      us2.then((u) => u());
    };
  }, [applyStatus, applyLog]);

  const verify = async () => {
    setWingetState("checking");
    const v = await checkWinget();
    if (v) {
      setWingetVersion(v);
      setWingetState("ok");
      // Detect installed apps in the background
      listInstalled()
        .then((ids) => setInstalled(ids))
        .catch(() => {
          /* non-fatal: catalog still works */
        });
    } else {
      setWingetState("missing");
    }
  };

  useEffect(() => {
    verify();
  }, []);

  if (wingetState === "checking") {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-muted)]">
        Проверка winget…
      </div>
    );
  }

  if (wingetState === "missing") {
    return <WingetMissing onRetry={verify} />;
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header
        query={query}
        onQuery={setQuery}
        wingetVersion={wingetVersion}
        installedCount={installedCount}
      />
      <div className="flex flex-1 overflow-hidden">
        <CategoryNav view={view} onSelect={setView} />
        <main className="flex-1 overflow-y-auto p-6 pb-24">
          <Content view={view} query={query} />
        </main>
      </div>
      <SelectionBar />
    </div>
  );
}

function Header({
  query,
  onQuery,
  wingetVersion,
  installedCount,
}: {
  query: string;
  onQuery: (s: string) => void;
  wingetVersion: string | null;
  installedCount: number;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-5">
      <div className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-black">
          u
        </span>
        <span>uskit</span>
      </div>
      <div className="flex-1">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Поиск приложения…"
          className="w-full max-w-md rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-white/40"
        />
      </div>
      {installedCount > 0 && (
        <span
          className="text-[11px] text-[var(--color-muted)]"
          title="Уже установлено приложений из каталога"
        >
          {installedCount} установлено
        </span>
      )}
      <QueueBadge />
      {wingetVersion && (
        <span
          className="text-[11px] text-[var(--color-muted)]"
          title="Версия winget"
        >
          {wingetVersion}
        </span>
      )}
    </header>
  );
}

function Content({ view, query }: { view: View; query: string }) {
  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return CATALOG.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.wingetId.toLowerCase().includes(q),
    );
  }, [query]);

  if (filtered) {
    return <CategoryGrid title={`Поиск: ${query}`} apps={filtered} />;
  }
  if (view === "settings") return <Settings />;
  if (view === "feed") return <Feed />;
  if (view === "all")
    return <CategoryGrid title="Все приложения" apps={CATALOG} />;

  const cat = CATEGORIES.find((c) => c.id === view);
  if (cat) {
    return (
      <CategoryGrid title={cat.label} apps={appsByCategory(view as Category)} />
    );
  }
  return null;
}
