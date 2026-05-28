import { CATEGORIES, type Category } from "../catalog";

export type View = "feed" | "all" | Category | "settings";

interface Props {
  view: View;
  onSelect: (v: View) => void;
}

export function CategoryNav({ view, onSelect }: Props) {
  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <NavItem active={view === "feed"} onClick={() => onSelect("feed")}>
        Лента
      </NavItem>
      <NavItem active={view === "all"} onClick={() => onSelect("all")}>
        Все приложения
      </NavItem>

      <div className="mt-4 px-3 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
        Категории
      </div>

      {CATEGORIES.map((c) => (
        <NavItem
          key={c.id}
          active={view === c.id}
          onClick={() => onSelect(c.id)}
        >
          {c.label}
        </NavItem>
      ))}

      <div className="mt-auto">
        <NavItem
          active={view === "settings"}
          onClick={() => onSelect("settings")}
        >
          Настройки
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-md px-3 py-2 text-left text-sm transition-colors " +
        (active
          ? "bg-white text-black"
          : "text-[var(--color-text)] hover:bg-[var(--color-surface)]")
      }
    >
      {children}
    </button>
  );
}
