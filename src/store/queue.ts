import { create } from "zustand";
import {
  enqueueInstall,
  type InstallStatusKind,
} from "../lib/tauri";
import { appById, CATALOG } from "../catalog";

export interface ItemState {
  status: InstallStatusKind;
  lastLine: string;
  code?: number | null;
  message?: string | null;
}

interface PersistedSettings {
  autoInstall: boolean;
  downloadDir: string;
}

const SETTINGS_KEY = "uskit.settings";
const DEFAULT_SETTINGS: PersistedSettings = {
  autoInstall: true,
  downloadDir: "",
};

function loadSettings(): PersistedSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return {
      autoInstall:
        typeof parsed.autoInstall === "boolean"
          ? parsed.autoInstall
          : DEFAULT_SETTINGS.autoInstall,
      downloadDir:
        typeof parsed.downloadDir === "string"
          ? parsed.downloadDir
          : DEFAULT_SETTINGS.downloadDir,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings: PersistedSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

interface QueueStore {
  items: Record<string, ItemState>;
  installed: Set<string>;
  selection: Set<string>;
  settings: {
    autoInstall: boolean;
    downloadDir: string;
  };

  enqueue: (id: string, wingetId: string) => Promise<void>;
  enqueueMany: (ids: string[]) => Promise<void>;

  toggleSelect: (id: string) => void;
  selectMany: (ids: string[]) => void;
  deselectMany: (ids: string[]) => void;
  clearSelection: () => void;

  setInstalled: (wingetIds: string[]) => void;

  applyStatus: (
    id: string,
    status: InstallStatusKind,
    code?: number | null,
    message?: string | null,
  ) => void;
  applyLog: (id: string, line: string) => void;
  setAutoInstall: (v: boolean) => void;
  setDownloadDir: (v: string) => void;
  reset: (id: string) => void;
}

export const useQueue = create<QueueStore>((set, get) => ({
  items: {},
  installed: new Set<string>(),
  selection: new Set<string>(),
  settings: loadSettings(),

  enqueue: async (id, wingetId) => {
    const cur = get().items[id]?.status;
    if (cur === "queued" || cur === "running") return;

    set((s) => ({
      items: {
        ...s.items,
        [id]: { status: "queued", lastLine: "" },
      },
    }));

    try {
      await enqueueInstall({
        id,
        wingetId,
        autoInstall: get().settings.autoInstall,
        downloadDir: get().settings.downloadDir || undefined,
      });
    } catch (e) {
      set((s) => ({
        items: {
          ...s.items,
          [id]: {
            status: "error",
            lastLine: "",
            message: String(e),
          },
        },
      }));
    }
  },

  enqueueMany: async (ids) => {
    for (const id of ids) {
      const app = appById(id);
      if (!app) continue;
      // Skip already installed unless explicitly re-installed
      if (get().installed.has(app.wingetId)) continue;
      await get().enqueue(app.id, app.wingetId);
    }
    get().clearSelection();
  },

  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selection);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selection: next };
    }),

  selectMany: (ids) =>
    set((s) => {
      const next = new Set(s.selection);
      for (const id of ids) next.add(id);
      return { selection: next };
    }),

  deselectMany: (ids) =>
    set((s) => {
      const next = new Set(s.selection);
      for (const id of ids) next.delete(id);
      return { selection: next };
    }),

  clearSelection: () => set({ selection: new Set() }),

  setInstalled: (wingetIds) => {
    // winget Ids are case-insensitive; match accordingly and store the
    // canonical catalog wingetId so all consumers compare consistently.
    const detectedLower = new Set(wingetIds.map((w) => w.toLowerCase()));
    // Auto-mark catalog apps as success if they appear installed and we have no
    // active state for them (so card shows "Installed" green border).
    set((s) => {
      const items = { ...s.items };
      const installed = new Set<string>();
      for (const app of CATALOG) {
        if (detectedLower.has(app.wingetId.toLowerCase())) {
          installed.add(app.wingetId);
          const cur = items[app.id]?.status;
          if (!cur) {
            items[app.id] = {
              status: "success",
              lastLine: "",
            };
          }
        }
      }
      return { installed, items };
    });
  },

  applyStatus: (id, status, code, message) => {
    set((s) => ({
      items: {
        ...s.items,
        [id]: {
          status,
          lastLine: s.items[id]?.lastLine ?? "",
          code: code ?? null,
          message: message ?? null,
        },
      },
    }));
    if (status === "success") {
      // Mirror to installed Set so subsequent renders treat it as detected.
      const app = appById(id);
      if (app) {
        set((s) => {
          const next = new Set(s.installed);
          next.add(app.wingetId);
          return { installed: next };
        });
      }
    }
  },

  applyLog: (id, line) => {
    set((s) => {
      const prev = s.items[id];
      if (!prev) return s;
      return {
        items: {
          ...s.items,
          [id]: { ...prev, lastLine: line },
        },
      };
    });
  },

  setAutoInstall: (v) =>
    set((s) => {
      const settings = { ...s.settings, autoInstall: v };
      saveSettings(settings);
      return { settings };
    }),

  setDownloadDir: (v) =>
    set((s) => {
      const settings = { ...s.settings, downloadDir: v };
      saveSettings(settings);
      return { settings };
    }),

  reset: (id) =>
    set((s) => {
      const { [id]: _removed, ...rest } = s.items;
      return { items: rest };
    }),
}));

export function activeCount(items: Record<string, ItemState>): number {
  return Object.values(items).filter(
    (i) => i.status === "queued" || i.status === "running",
  ).length;
}
