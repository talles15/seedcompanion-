import { formatDash, formatDateBR } from "@/lib/format";
import type { TZRoundRow } from "@/lib/lots";

const ROUND_COUNT = 4;

export function TZTable({ rounds }: { rounds: TZRoundRow[] }) {
  const byRound = new Map(rounds.map((r) => [r.round, r]));
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Tetrazólio — Repetições
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead className="text-gray-500">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-medium">Rep</th>
              <th className="px-3 py-2 text-left font-medium">VIGOR</th>
              <th className="px-3 py-2 text-left font-medium">VIABILIDADE</th>
              <th className="px-3 py-2 text-left font-medium">C1+C2</th>
              <th className="px-3 py-2 text-left font-medium">C1+C2+C3</th>
              <th className="px-3 py-2 text-left font-medium">DM 1-8</th>
              <th className="px-3 py-2 text-left font-medium">MORTA MECANICO 6_8</th>
              <th className="px-3 py-2 text-left font-medium">UMIDADE 1-8</th>
              <th className="px-3 py-2 text-left font-medium">MORTA UMIDADE 6_8</th>
              <th className="px-3 py-2 text-left font-medium">3R</th>
              <th className="px-3 py-2 text-left font-medium">PERCEVEJO 1_8</th>
              <th className="px-3 py-2 text-left font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROUND_COUNT }, (_, i) => {
              const r = byRound.get(i + 1);
              return (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">R{i + 1}</td>
                  <td className="px-3 py-2">{formatDash(r?.vigor ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.viabilidade ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.c1_c2 ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.c1_c2_c3 ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.dm_c1_8 ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.mort_mecanico ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.umid_c1_8 ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.mort_umidade ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.c3r ?? null)}</td>
                  <td className="px-3 py-2">{formatDash(r?.percevejo ?? null)}</td>
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
