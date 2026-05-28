import { CATEGORIES, popularApps, appsByCategory } from "../catalog";
import { CategoryGrid } from "./CategoryGrid";
import { PresetChips } from "./PresetChips";

export function Feed() {
  const popular = popularApps();
  return (
    <div className="flex flex-col gap-10">
      <PresetChips />
      <CategoryGrid title="Популярное" apps={popular} />
      {CATEGORIES.map((c) => {
        const apps = appsByCategory(c.id).slice(0, 6);
        if (apps.length === 0) return null;
        return <CategoryGrid key={c.id} title={c.label} apps={apps} />;
      })}
    </div>
  );
}
