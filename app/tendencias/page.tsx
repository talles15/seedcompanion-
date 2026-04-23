import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassificationBars } from "@/components/trends/classification-bars";
import { CultivarRanking } from "@/components/trends/cultivar-ranking";
import {
  ParametersComparison,
  type ComparisonRow,
} from "@/components/trends/parameters-comparison";
import { bestValue, fetchAllLots, type LotRow } from "@/lib/lots";
import {
  classify,
  CLASSIFICATION_COLORS,
  computeScore,
  type Classification,
} from "@/lib/classification";
import { formatDash } from "@/lib/format";

export const dynamic = "force-dynamic";

function scoreLot(l: LotRow): number | null {
  return computeScore({
    vigor: bestValue(l.tz_rounds, (r) => r.vigor),
    viabilidade: bestValue(l.tz_rounds, (r) => r.viabilidade),
    ea72: bestValue(l.ea72_rounds, (r) => r.normais),
    ea48: bestValue(l.ea48_rounds, (r) => r.normais),
    areia: bestValue(l.areia_rounds, (r) => r.resultado),
    germ: bestValue(l.gp_rounds, (r) => r.normais),
  });
}

export default async function TrendsPage() {
  const lots = await fetchAllLots();

  const counts: Record<Classification, number> = {
    Excelente: 0,
    Bom: 0,
    Regular: 0,
    "Atenção": 0,
    Reprovado: 0,
  };

  const byCultivar = new Map<string, { sum: number; n: number; params: ComparisonRow }>();
  const ranking: Array<{ numerolote: string; cultivar: string; nota: number | null }> = [];

  for (const l of lots) {
    const s = scoreLot(l);
    counts[classify(s)] += 1;
    ranking.push({
      numerolote: l.numerolote,
      cultivar: l.cultivar ?? "-",
      nota: s,
    });

    const cKey = l.cultivar ?? "-";
    const entry = byCultivar.get(cKey) ?? {
      sum: 0,
      n: 0,
      params: {
        cultivar: cKey,
        VIGOR: null,
        EA72: null,
        EA48: null,
        AREIA: null,
        "Germinação": null,
      },
    };
    if (s !== null) {
      entry.sum += s;
      entry.n += 1;
    }
    const vigor = bestValue(l.tz_rounds, (r) => r.vigor);
    const ea72 = bestValue(l.ea72_rounds, (r) => r.normais);
    const ea48 = bestValue(l.ea48_rounds, (r) => r.normais);
    const areia = bestValue(l.areia_rounds, (r) => r.resultado);
    const germ = bestValue(l.gp_rounds, (r) => r.normais);
    entry.params.VIGOR = avg(entry.params.VIGOR, vigor);
    entry.params.EA72 = avg(entry.params.EA72, ea72);
    entry.params.EA48 = avg(entry.params.EA48, ea48);
    entry.params.AREIA = avg(entry.params.AREIA, areia);
    entry.params["Germinação"] = avg(entry.params["Germinação"], germ);
    byCultivar.set(cKey, entry);
  }

  const cultivarData = Array.from(byCultivar.entries())
    .map(([cultivar, e]) => ({
      cultivar,
      nota: e.n > 0 ? Math.round(e.sum / e.n) : 0,
    }))
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 10);

  const comparison: ComparisonRow[] = Array.from(byCultivar.values())
    .map((e) => e.params)
    .slice(0, 12);

  ranking.sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Tendências de Qualidade</h1>
          <p className="text-xs text-gray-500">
            Visão global e comparativo entre cultivares
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClassificationBars counts={counts} />
        <CultivarRanking data={cultivarData} />
      </div>

      <ParametersComparison data={comparison} />

      <div className="bg-white border rounded-lg">
        <div className="px-4 py-2 border-b text-sm font-medium">
          Ranking Geral de Lotes
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 sticky top-0 bg-white border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">Lote</th>
                <th className="px-4 py-2 text-left font-medium">Cultivar</th>
                <th className="px-4 py-2 text-right font-medium">Nota</th>
                <th className="px-4 py-2 text-left font-medium">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => {
                const cls = classify(r.nota);
                return (
                  <tr key={r.numerolote} className="border-b last:border-0">
                    <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/lote/${encodeURIComponent(r.numerolote)}`}
                        className="text-brand-green hover:underline"
                      >
                        {r.numerolote}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{r.cultivar}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {r.nota !== null ? `${formatDash(r.nota, 1)}%` : "-"}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: CLASSIFICATION_COLORS[cls] }}
                    >
                      {cls}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function avg(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return (a + b) / 2;
}
