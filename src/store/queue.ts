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
  settings: {
    autoInstall: true,
    downloadDir: "",
  },

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

  clearSelection: () => set({ selection: new Set() }),

  setInstalled: (wingetIds) => {
    const detected = new Set(wingetIds);
    // Auto-mark catalog apps as success if they appear installed and we have no
    // active state for them (so card shows "Installed" green border).
    set((s) => {
      const items = { ...s.items };
      for (const app of CATALOG) {
        if (detected.has(app.wingetId)) {
          const cur = items[app.id]?.status;
          if (!cur) {
            items[app.id] = {
              status: "success",
              lastLine: "",
            };
          }
        }
      }
      return { installed: detected, items };
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
    set((s) => ({ settings: { ...s.settings, autoInstall: v } })),

  setDownloadDir: (v) =>
    set((s) => ({ settings: { ...s.settings, downloadDir: v } })),

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
