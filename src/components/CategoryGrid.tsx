import { AppCard } from "./AppCard";
import type { AppItem } from "../catalog";
import { useQueue } from "../store/queue";

interface Props {
  title: string;
  apps: AppItem[];
}

export function CategoryGrid({ title, apps }: Props) {
  const selection = useQueue((s) => s.selection);
  const selectMany = useQueue((s) => s.selectMany);
  const deselectMany = useQueue((s) => s.deselectMany);

  const ids = apps.map((a) => a.id);
  const allSelected = ids.length > 0 && ids.every((id) => selection.has(id));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {apps.length > 1 && (
          <button
            onClick={() =>
              allSelected ? deselectMany(ids) : selectMany(ids)
            }
            className="shrink-0 text-xs text-[var(--color-muted)] transition-colors hover:text-white"
          >
            {allSelected ? "Снять все" : "Выбрать все"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {apps.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </div>
    </section>
  );
}
