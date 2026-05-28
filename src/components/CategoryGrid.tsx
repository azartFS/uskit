import { AppCard } from "./AppCard";
import type { AppItem } from "../catalog";

interface Props {
  title: string;
  apps: AppItem[];
}

export function CategoryGrid({ title, apps }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {apps.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </div>
    </section>
  );
}
