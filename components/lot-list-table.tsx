"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LotRow } from "@/lib/lot-shared";
import { bestValue } from "@/lib/lot-shared";
import { formatDash } from "@/lib/format";

export function LotListTable({ lots }: { lots: LotRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [cultivar, setCultivar] = useState("Todas");

  const cultivars = useMemo(() => {
    const set = new Set<string>();
    for (const l of lots) if (l.cultivar) set.add(l.cultivar);
    return ["Todas", ...Array.from(set).sort()];
  }, [lots]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    for (const l of lots) if (l.statuslt) set.add(l.statuslt);
    return ["Todos", ...Array.from(set).sort()];
  }, [lots]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lots.filter((l) => {
      if (status !== "Todos" && l.statuslt !== status) return false;
      if (cultivar !== "Todas" && l.cultivar !== cultivar) return false;
      if (!q) return true;
      return (
        l.numerolote.toLowerCase().includes(q) ||
        (l.cultivar?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [lots, query, status, cultivar]);

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
        <div className="relative flex-1">
          <input
            placeholder="Buscar lote ou cultivar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded pl-9 pr-3 py-2 text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={cultivar}
          onChange={(e) => setCultivar(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {cultivars.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 text-xs uppercase">
            <tr className="border-b">
              <th className="px-4 py-2 font-medium">Lote</th>
              <th className="px-4 py-2 font-medium">Cultivar</th>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Peneira</th>
              <th className="px-4 py-2 font-medium text-right">VIGOR</th>
              <th className="px-4 py-2 font-medium text-right">EA72</th>
              <th className="px-4 py-2 font-medium text-right">EA48</th>
              <th className="px-4 py-2 font-medium text-right">Germ.</th>
              <th className="px-4 py-2 font-medium text-right">AREIA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const vigor = bestValue(l.tz_rounds, (r) => r.vigor);
              const ea72 = bestValue(l.ea72_rounds, (r) => r.normais);
              const ea48 = bestValue(l.ea48_rounds, (r) => r.normais);
              const germ = bestValue(l.gp_rounds, (r) => r.normais);
              const areia = bestValue(l.areia_rounds, (r) => r.resultado);
              return (
                <tr
                  key={l.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    <Link
                      href={`/lote/${encodeURIComponent(l.numerolote)}`}
                      className="text-brand-green hover:underline"
                    >
                      {l.numerolote}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{l.cultivar ?? "-"}</td>
                  <td className="px-4 py-2">{l.empresa ?? "-"}</td>
                  <td className="px-4 py-2">{l.peneira ?? "-"}</td>
                  <td className="px-4 py-2 text-right">{formatDash(vigor)}</td>
                  <td className="px-4 py-2 text-right">{formatDash(ea72)}</td>
                  <td className="px-4 py-2 text-right">{formatDash(ea48)}</td>
                  <td className="px-4 py-2 text-right">{formatDash(germ)}</td>
                  <td className="px-4 py-2 text-right">{formatDash(areia)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-500 text-sm"
                >
                  Nenhum lote encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
