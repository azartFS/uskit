import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export type InstallStatusKind =
  | "queued"
  | "running"
  | "success"
  | "error";

export interface StatusEvent {
  id: string;
  status: InstallStatusKind;
  code?: number | null;
  message?: string | null;
}

export interface LogEvent {
  id: string;
  line: string;
  stream: "stdout" | "stderr";
}

export interface InstallJob {
  id: string;
  wingetId: string;
  autoInstall: boolean;
  downloadDir?: string;
}

export async function checkWinget(): Promise<string | null> {
  return await invoke<string | null>("check_winget");
}

export async function listInstalled(): Promise<string[]> {
  return await invoke<string[]>("list_installed");
}

export async function openMsStoreAppInstaller(): Promise<void> {
  await invoke("open_ms_store_app_installer");
}

export async function enqueueInstall(job: InstallJob): Promise<void> {
  await invoke("enqueue_install", {
    job: {
      id: job.id,
      winget_id: job.wingetId,
      auto_install: job.autoInstall,
      download_dir: job.downloadDir ?? null,
    },
  });
}

export function onStatus(handler: (e: StatusEvent) => void): Promise<UnlistenFn> {
  return listen<StatusEvent>("install:status", (e) => handler(e.payload));
}

export function onLog(handler: (e: LogEvent) => void): Promise<UnlistenFn> {
  return listen<LogEvent>("install:log", (e) => handler(e.payload));
}
