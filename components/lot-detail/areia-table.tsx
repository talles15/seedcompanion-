import { formatDash, formatDateBR } from "@/lib/format";
import type { AreiaRoundRow } from "@/lib/lot-shared";

export function AreiaTable({ rounds }: { rounds: AreiaRoundRow[] }) {
  const byRound = new Map(rounds.map((r) => [r.round, r]));
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Areia — Repetições
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-gray-500">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-medium">Rep</th>
              <th className="px-3 py-2 text-left font-medium">Resultado</th>
              <th className="px-3 py-2 text-left font-medium">L1</th>
              <th className="px-3 py-2 text-left font-medium">L2</th>
              <th className="px-3 py-2 text-left font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }, (_, i) => {
              const r = byRound.get(i + 1);
              return (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">R{i + 1}</td>
                  <td className="px-3 py-2">{formatDash(r?.resultado ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.l1 ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.l2 ?? null)}</td>
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
