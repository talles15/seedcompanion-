import { formatDash } from "@/lib/format";

type Metric = { label: string; value: number | null };

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white border rounded-md px-3 py-2 text-center"
        >
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            {m.label}
          </div>
          <div className="text-base font-semibold mt-0.5">
            {formatDash(m.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
