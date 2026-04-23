type Kpi = { label: string; value: number | string; tint?: string };

export function KpiHeader({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((k) => (
        <div
          key={k.label}
          className="bg-white border rounded-lg px-4 py-3 shadow-sm"
        >
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {k.label}
          </div>
          <div
            className="text-2xl font-semibold mt-1"
            style={{ color: k.tint ?? "#111827" }}
          >
            {k.value}
          </div>
        </div>
      ))}
    </div>
  );
}
