import { useQueue } from "../store/queue";
import type { AppItem } from "../catalog";

interface Props {
  app: AppItem;
}

export function AppCard({ app }: Props) {
  const item = useQueue((s) => s.items[app.id]);
  const enqueue = useQueue((s) => s.enqueue);
  const installed = useQueue((s) => s.installed.has(app.wingetId));
  const selected = useQueue((s) => s.selection.has(app.id));
  const toggleSelect = useQueue((s) => s.toggleSelect);
  const status = item?.status ?? (installed ? "success" : "idle");
  const isActive = status === "queued" || status === "running";

  return (
    <div
      className={
        "group relative flex flex-col gap-3 rounded-xl border bg-[var(--color-surface)] p-4 transition-all " +
        (selected
          ? "border-white shadow-[0_0_0_1px_white_inset]"
          : "border-[var(--color-border)] hover:border-white/30")
      }
    >
      <button
        onClick={() => toggleSelect(app.id)}
        disabled={isActive}
        className={
          "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded border transition-all " +
          (selected
            ? "border-white bg-white text-black"
            : "border-[var(--color-border)] bg-[var(--color-surface-2)] opacity-0 group-hover:opacity-100 " +
              (isActive ? "" : "hover:border-white/60"))
        }
        title={selected ? "Убрать из выделения" : "Выделить"}
        aria-label="Выделить"
      >
        {selected && (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2.5 6.5L5 9l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex items-start gap-3 pr-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)] p-2">
          <img
            src={app.iconUrl}
            alt=""
            className="max-h-8 max-w-8"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight">
            {app.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-muted)]">
            {app.description}
          </p>
        </div>
      </div>

      {status === "running" && item?.lastLine && (
        <div className="truncate font-mono text-[10px] text-[var(--color-muted)]">
          {item.lastLine}
        </div>
      )}

      <InstallButton
        status={status}
        installed={installed}
        onInstall={() => enqueue(app.id, app.wingetId)}
        errorMessage={item?.message ?? undefined}
        errorCode={item?.code ?? undefined}
      />
    </div>
  );
}

function InstallButton({
  status,
  installed,
  onInstall,
  errorMessage,
  errorCode,
}: {
  status: string;
  installed: boolean;
  onInstall: () => void;
  errorMessage?: string;
  errorCode?: number | null;
}) {
  if (status === "queued") {
    return (
      <button
        disabled
        className="rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-muted)]"
      >
        В очереди…
      </button>
    );
  }
  if (status === "running") {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-sm text-white"
      >
        <Spinner /> Установка…
      </button>
    );
  }
  if (status === "success") {
    return (
      <button
        onClick={onInstall}
        className="flex items-center justify-center gap-2 rounded-md border border-[var(--color-success)]/40 bg-transparent px-3 py-2 text-sm text-[var(--color-success)] hover:bg-[var(--color-success)]/10"
      >
        <Check /> {installed ? "Установлено" : "Готово · переустановить"}
      </button>
    );
  }
  if (status === "error") {
    const tooltip = [
      errorCode != null ? `Код: ${errorCode}` : null,
      errorMessage,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <button
        onClick={onInstall}
        title={tooltip}
        className="rounded-md border border-[var(--color-danger)]/50 bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20"
      >
        Ошибка · повторить
      </button>
    );
  }
  return (
    <button
      onClick={onInstall}
      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
    >
      Установить
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden
    />
  );
}

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2.5 6.5L5 9l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
