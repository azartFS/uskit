export type Category =
  | "comm"
  | "games"
  | "browsers"
  | "utils"
  | "dev";

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "comm",     label: "Связь",       icon: "M" },
  { id: "games",    label: "Игры",        icon: "G" },
  { id: "browsers", label: "Браузеры",    icon: "B" },
  { id: "utils",    label: "Утилиты",     icon: "U" },
  { id: "dev",      label: "Разработка",  icon: "D" },
];

export interface AppItem {
  id: string;
  name: string;
  description: string;
  wingetId: string;
  iconUrl: string;
  category: Category;
  popular?: boolean;
}

const icon = (slug: string, color = "ffffff") =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

export const CATALOG: AppItem[] = [
  // ───── Связь ─────
  {
    id: "telegram",
    name: "Telegram",
    description: "Быстрый и безопасный мессенджер",
    wingetId: "Telegram.TelegramDesktop",
    iconUrl: icon("telegram", "26A5E4"),
    category: "comm",
    popular: true,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Голос, видео и текст для геймеров",
    wingetId: "Discord.Discord",
    iconUrl: icon("discord", "5865F2"),
    category: "comm",
    popular: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Десктопный клиент мессенджера",
    wingetId: "WhatsApp.WhatsApp",
    iconUrl: icon("whatsapp", "25D366"),
    category: "comm",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Видеоконференции и встречи",
    wingetId: "Zoom.Zoom",
    iconUrl: icon("zoom", "2D8CFF"),
    category: "comm",
  },

  // ───── Игры ─────
  {
    id: "steam",
    name: "Steam",
    description: "Магазин и лаунчер от Valve",
    wingetId: "Valve.Steam",
    iconUrl: icon("steam", "ffffff"),
    category: "games",
    popular: true,
  },
  {
    id: "epic",
    name: "Epic Games",
    description: "Лаунчер Epic Games Store",
    wingetId: "EpicGames.EpicGamesLauncher",
    iconUrl: icon("epicgames", "ffffff"),
    category: "games",
    popular: true,
  },
  {
    id: "gog",
    name: "GOG Galaxy",
    description: "Универсальный игровой клиент",
    wingetId: "GOG.Galaxy",
    iconUrl: icon("gogdotcom", "86328A"),
    category: "games",
  },
  {
    id: "battlenet",
    name: "Battle.net",
    description: "Лаунчер Blizzard",
    wingetId: "Blizzard.BattleNet",
    iconUrl: icon("battledotnet", "00AEFF"),
    category: "games",
  },

  // ───── Браузеры ─────
  {
    id: "chrome",
    name: "Google Chrome",
    description: "Самый популярный браузер",
    wingetId: "Google.Chrome",
    iconUrl: icon("googlechrome", "4285F4"),
    category: "browsers",
    popular: true,
  },
  {
    id: "firefox",
    name: "Mozilla Firefox",
    description: "Открытый браузер с фокусом на приватность",
    wingetId: "Mozilla.Firefox",
    iconUrl: icon("firefox", "FF7139"),
    category: "browsers",
    popular: true,
  },
  {
    id: "brave",
    name: "Brave",
    description: "Браузер со встроенным блокировщиком",
    wingetId: "Brave.Brave",
    iconUrl: icon("brave", "FB542B"),
    category: "browsers",
  },
  {
    id: "yandex",
    name: "Yandex Browser",
    description: "Браузер от Яндекса",
    wingetId: "Yandex.Browser",
    iconUrl: icon("yandex", "FFCC00"),
    category: "browsers",
  },

  // ───── Утилиты ─────
  {
    id: "7zip",
    name: "7-Zip",
    description: "Архиватор с открытым исходным кодом",
    wingetId: "7zip.7zip",
    iconUrl: icon("7zip", "ffffff"),
    category: "utils",
    popular: true,
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    description: "Лёгкий торрент-клиент",
    wingetId: "qBittorrent.qBittorrent",
    iconUrl: icon("qbittorrent", "2F67BA"),
    category: "utils",
  },
  {
    id: "obs",
    name: "OBS Studio",
    description: "Запись и стриминг видео",
    wingetId: "OBSProject.OBSStudio",
    iconUrl: icon("obsstudio", "302E31"),
    category: "utils",
    popular: true,
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Стриминговый музыкальный сервис",
    wingetId: "Spotify.Spotify",
    iconUrl: icon("spotify", "1DB954"),
    category: "utils",
    popular: true,
  },
  {
    id: "vlc",
    name: "VLC media player",
    description: "Универсальный медиаплеер",
    wingetId: "VideoLAN.VLC",
    iconUrl: icon("vlcmediaplayer", "FF8800"),
    category: "utils",
  },
  {
    id: "notepadpp",
    name: "Notepad++",
    description: "Текстовый редактор для разработчиков",
    wingetId: "Notepad++.Notepad++",
    iconUrl: icon("notepadplusplus", "90E59A"),
    category: "utils",
  },

  // ───── Разработка ─────
  {
    id: "vscode",
    name: "Visual Studio Code",
    description: "Лёгкий редактор от Microsoft",
    wingetId: "Microsoft.VisualStudioCode",
    iconUrl: icon("vscodium", "2F80ED"),
    category: "dev",
    popular: true,
  },
  {
    id: "git",
    name: "Git",
    description: "Система контроля версий",
    wingetId: "Git.Git",
    iconUrl: icon("git", "F05032"),
    category: "dev",
  },
  {
    id: "nodejs",
    name: "Node.js (LTS)",
    description: "JavaScript runtime",
    wingetId: "OpenJS.NodeJS.LTS",
    iconUrl: icon("nodedotjs", "5FA04E"),
    category: "dev",
  },
  {
    id: "docker",
    name: "Docker Desktop",
    description: "Контейнеры на десктопе",
    wingetId: "Docker.DockerDesktop",
    iconUrl: icon("docker", "2496ED"),
    category: "dev",
  },
  {
    id: "postman",
    name: "Postman",
    description: "Платформа для работы с API",
    wingetId: "Postman.Postman",
    iconUrl: icon("postman", "FF6C37"),
    category: "dev",
  },
  {
    id: "python",
    name: "Python 3.12",
    description: "Интерпретатор Python",
    wingetId: "Python.Python.3.12",
    iconUrl: icon("python", "3776AB"),
    category: "dev",
  },
];

export function appsByCategory(cat: Category): AppItem[] {
  return CATALOG.filter((a) => a.category === cat);
}

export function popularApps(): AppItem[] {
  return CATALOG.filter((a) => a.popular);
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  appIds: string[];
}

export const PRESETS: Preset[] = [
  {
    id: "essentials",
    label: "Базовый",
    description: "Браузер, мессенджеры, архиватор, медиаплеер",
    appIds: ["chrome", "telegram", "discord", "7zip", "vlc", "spotify"],
  },
  {
    id: "gamer",
    label: "Геймер",
    description: "Игровые лаунчеры, Discord, OBS",
    appIds: ["steam", "epic", "battlenet", "discord", "obs"],
  },
  {
    id: "developer",
    label: "Разработчик",
    description: "VS Code, Git, Node.js, Docker, Postman, 7-Zip",
    appIds: ["vscode", "git", "nodejs", "docker", "postman", "7zip"],
  },
  {
    id: "streamer",
    label: "Стример",
    description: "OBS, Discord, Spotify, браузер",
    appIds: ["obs", "discord", "spotify", "chrome"],
  },
];

export function appById(id: string): AppItem | undefined {
  return CATALOG.find((a) => a.id === id);
}
