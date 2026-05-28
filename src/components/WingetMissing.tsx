import { openMsStoreAppInstaller } from "../lib/tauri";

interface Props {
  onRetry: () => void;
}

export function WingetMissing({ onRetry }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex max-w-lg flex-col gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Не найден winget
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          uskit использует <span className="text-white">winget</span> (App
          Installer от Microsoft) для установки приложений. На этой системе он
          недоступен. Установите App Installer из Microsoft Store и перезапустите
          приложение.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => openMsStoreAppInstaller()}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90"
          >
            Открыть Microsoft Store
          </button>
          <button
            onClick={onRetry}
            className="rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)]"
          >
            Проверить снова
          </button>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          После установки откройте обычный cmd и убедитесь, что{" "}
          <code className="rounded bg-black/40 px-1 py-0.5">winget --version</code>{" "}
          работает.
        </p>
      </div>
    </div>
  );
}
