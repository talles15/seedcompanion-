import { formatDash, formatDateBR } from "@/lib/format";
import type { EARoundRow } from "@/lib/lots";

export function EATable({
  title,
  rounds,
  slots,
}: {
  title: string;
  rounds: EARoundRow[];
  slots: number;
}) {
  const byRound = new Map(rounds.map((r) => [r.round, r]));
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-gray-500">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-medium">Rep</th>
              <th className="px-3 py-2 text-left font-medium">Normais</th>
              <th className="px-3 py-2 text-left font-medium">Fortes</th>
              <th className="px-3 py-2 text-left font-medium">Fracas</th>
              <th className="px-3 py-2 text-left font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: slots }, (_, i) => {
              const r = byRound.get(i + 1);
              return (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">R{i + 1}</td>
                  <td className="px-3 py-2">{formatDash(r?.normais ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.fortes ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.fracas ?? null)}</td>
                  <td className="px-3 py-2">{r?.data ? formatDateBR(r.data) : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
