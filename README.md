# uskit

Quick installer for popular Windows apps. One click — `winget install`.

Built for the moment after a fresh Windows install / new PC, when you need Steam, Discord, Telegram, Chrome, VS Code etc. and don't want to download each setup file by hand.

## Features

- Catalog of ~25 popular apps in 5 categories (Связь / Игры / Браузеры / Утилиты / Разработка)
- Presets ("Базовый", "Геймер", "Разработчик", "Стример") — select a whole group in one click
- Multi-select with floating install bar
- Detection of already-installed packages (via `winget export`)
- Sequential install queue with live log per card
- Pure black/white theme
- Falls back to `%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe` when `winget` is not on PATH

## Stack

Tauri 2 + Rust + React 18 + TypeScript + Vite + Tailwind v4 + Zustand.

## Requirements

- Windows 10 (1809+) or Windows 11
- App Installer from Microsoft Store (provides `winget`)
- Rust 1.75+, Node 20+

If `winget` is missing, uskit shows a screen with a Microsoft Store link.

## Run

```sh
npm install
npm run tauri dev
```

## Build

```sh
npm run tauri build
```

Produces an `.msi` / `.exe` in `src-tauri/target/release/bundle/`.

## Project layout

```
src/                — React UI
  catalog.ts        — apps + presets
  components/       — AppCard, Feed, CategoryNav, SelectionBar, PresetChips, ...
  store/queue.ts    — Zustand: queue, selection, installed
  lib/tauri.ts      — invoke/listen wrappers
src-tauri/src/      — Rust backend
  winget.rs         — check_winget, list_installed, fallback resolver
  installer.rs      — tokio mpsc queue, streams stdout/stderr to UI
  events.rs         — event payload types
```
