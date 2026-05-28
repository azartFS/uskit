import { useQueue } from "../store/queue";
import { appById, CATALOG } from "../catalog";

export function SelectionBar() {
  const selection = useQueue((s) => s.selection);
  const installed = useQueue((s) => s.installed);
  const enqueueMany = useQueue((s) => s.enqueueMany);
  const clearSelection = useQueue((s) => s.clearSelection);
  const selectMany = useQueue((s) => s.selectMany);

  if (selection.size === 0) return null;

  // Count how many of the selection still need installation
  const ids = Array.from(selection);
  const toInstall = ids.filter((id) => {
    const a = appById(id);
    return a && !installed.has(a.wingetId);
  });

  const skipped = ids.length - toInstall.length;

  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-4 pr-2 shadow-2xl backdrop-blur">
      <span className="text-sm">
        Выбрано: <span className="font-semibold">{selection.size}</span>
        {skipped > 0 && (
          <span className="ml-2 text-xs text-[var(--color-muted)]">
            ({skipped} уже стоит)
          </span>
        )}
      </span>
      <button
        onClick={() => selectMany(CATALOG.map((a) => a.id))}
        className="rounded-full px-3 py-1 text-xs text-[var(--color-muted)] hover:text-white"
      >
        Выбрать все
      </button>
      <button
        onClick={() => clearSelection()}
        className="rounded-full px-3 py-1 text-xs text-[var(--color-muted)] hover:text-white"
      >
        Снять
      </button>
      <button
        onClick={() => enqueueMany(ids)}
        disabled={toInstall.length === 0}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-40"
      >
        Установить ({toInstall.length})
      </button>
    </div>
  );
}
