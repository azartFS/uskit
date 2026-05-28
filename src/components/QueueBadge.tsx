import { useQueue, activeCount } from "../store/queue";

export function QueueBadge() {
  const items = useQueue((s) => s.items);
  const active = activeCount(items);
  if (active === 0) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
      <span>В очереди: {active}</span>
    </div>
  );
}
