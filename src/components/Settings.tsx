import { useQueue } from "../store/queue";

export function Settings() {
  const settings = useQueue((s) => s.settings);
  const setAutoInstall = useQueue((s) => s.setAutoInstall);
  const setDownloadDir = useQueue((s) => s.setDownloadDir);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h2 className="text-lg font-semibold tracking-tight">Настройки</h2>

      <Row
        title="Автоматически устанавливать"
        hint="Если включено, uskit запускает winget install (тихая установка). Если выключено — winget download в указанную папку."
      >
        <Toggle
          checked={settings.autoInstall}
          onChange={setAutoInstall}
        />
      </Row>

      {!settings.autoInstall && (
        <Row
          title="Папка для скачивания"
          hint="Полный путь, например D:\\Setups. Должен существовать."
        >
          <input
            type="text"
            value={settings.downloadDir}
            onChange={(e) => setDownloadDir(e.target.value)}
            placeholder={"D:\\Setups"}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/40"
          />
        </Row>
      )}
    </div>
  );
}

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        {hint && (
          <div className="mt-1 text-xs text-[var(--color-muted)]">{hint}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={
        "relative h-6 w-11 rounded-full transition-colors " +
        (checked ? "bg-white" : "bg-[var(--color-surface-2)]")
      }
    >
      <span
        className={
          "absolute top-0.5 h-5 w-5 rounded-full transition-all " +
          (checked
            ? "left-[22px] bg-black"
            : "left-0.5 bg-[var(--color-muted)]")
        }
      />
    </button>
  );
}
