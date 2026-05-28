import { PRESETS, appById } from "../catalog";
import { useQueue } from "../store/queue";

export function PresetChips() {
  const selectMany = useQueue((s) => s.selectMany);
  const installed = useQueue((s) => s.installed);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Наборы</h2>
        <span className="text-xs text-[var(--color-muted)]">
          Один клик — выделить группу приложений
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const total = preset.appIds.length;
          const remaining = preset.appIds.filter((id) => {
            const a = appById(id);
            return a && !installed.has(a.wingetId);
          }).length;
          return (
            <button
              key={preset.id}
              onClick={() => selectMany(preset.appIds)}
              title={preset.description}
              className="group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-4 pr-3 text-sm transition-colors hover:border-white/40 hover:bg-[var(--color-surface-2)]"
            >
              <span className="font-medium">{preset.label}</span>
              <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-muted)] group-hover:bg-black/40">
                {remaining}/{total}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
