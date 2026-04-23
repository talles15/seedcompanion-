import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { MetricsGrid } from "@/components/lot-detail/metrics-grid";
import { AlertsPanel, type Alert } from "@/components/lot-detail/alerts-panel";
import { TemporalChart, type TemporalPoint } from "@/components/lot-detail/temporal-chart";
import { TZTable } from "@/components/lot-detail/tz-table";
import { EATable } from "@/components/lot-detail/ea-table";
import { AreiaTable } from "@/components/lot-detail/areia-table";
import { ExportPdfButton } from "@/components/lot-detail/export-pdf-button";
import {
  bestValue,
  byRound,
  fetchLotByNumero,
  latest,
} from "@/lib/lots";
import { computeScore, classify, CLASSIFICATION_COLORS } from "@/lib/classification";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ThresholdMap, TestType } from "@/lib/thresholds";

export const dynamic = "force-dynamic";

export default async function LotDetailPage({
  params,
}: {
  params: { numero: string };
}) {
  const numero = decodeURIComponent(params.numero);
  const lot = await fetchLotByNumero(numero);
  if (!lot) notFound();

  const supabase = createSupabaseServerClient();
  const { data: thresholdRows } = await supabase
    .from("test_thresholds")
    .select("test_type, min_value");
  const thresholds: ThresholdMap = {};
  for (const r of thresholdRows ?? []) {
    thresholds[r.test_type as TestType] = r.min_value;
  }

  const vigor = bestValue(lot.tz_rounds, (r) => r.vigor);
  const viabilidade = bestValue(lot.tz_rounds, (r) => r.viabilidade);
  const datz = bestValue(lot.tz_rounds, (r) => r.soma_1a3r);
  const c1c2 = byRound(lot.tz_rounds, 1)?.c1_c2 ?? null;
  const c3r = byRound(lot.tz_rounds, 1)?.c3r ?? null;
  const dm18 = byRound(lot.tz_rounds, 1)?.dm_c1_8 ?? null;
  const umidade = latest(lot.umidade)?.valor ?? null;
  const ea48 = bestValue(lot.ea48_rounds, (r) => r.normais);
  const ea72 = bestValue(lot.ea72_rounds, (r) => r.normais);
  const ea24 = bestValue(lot.ea24_rounds, (r) => r.normais);
  const areia = bestValue(lot.areia_rounds, (r) => r.resultado);
  const germ = bestValue(lot.gp_rounds, (r) => r.normais);

  const score = computeScore({
    vigor,
    viabilidade,
    ea72,
    ea48,
    areia,
    germ,
  });
  const classification = classify(score);

  const alerts: Alert[] = [];
  const esverdeado = bestValue(lot.tz_rounds, (r) => r.esverdeadas);
  if (esverdeado !== null && esverdeado > 5) {
    alerts.push({
      level: "danger",
      message: `ESVERDEADO: ESVERDEADO acima do máximo: ${esverdeado.toFixed(0)} (máx: 5)`,
    });
  }
  const vigorMin = thresholds.VIGOR;
  if (typeof vigorMin === "number" && vigor !== null && vigor < vigorMin) {
    alerts.push({
      level: "warning",
      message: `VIGOR: ${vigor.toFixed(0)} abaixo do mínimo configurado (${vigorMin})`,
    });
  }

  const points = buildTemporal(lot);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-800"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Lote {lot.numerolote}</h1>
            <p className="text-xs text-gray-500">
              {[lot.cultivar, lot.classe, lot.peneira, lot.unidade]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: CLASSIFICATION_COLORS[classification] }}
          >
            <Trophy className="h-5 w-5" />
            {classification}
            <span className="text-gray-500 font-normal ml-1">
              {score !== null ? `${score.toFixed(1)}%` : "-"}
            </span>
          </div>
          <ExportPdfButton lot={lot} thresholds={thresholds} />
        </div>
      </div>

      <MetricsGrid
        metrics={[
          { label: "VIGOR", value: vigor },
          { label: "VIABILIDADE", value: viabilidade },
          { label: "DATZ", value: datz },
          { label: "EA48", value: ea48 },
          { label: "AREIA", value: areia },
          { label: "Germinação", value: germ },
          { label: "C1+C2", value: c1c2 },
          { label: "3R", value: c3r },
          { label: "DM 1-8", value: dm18 },
          { label: "UMIDADE", value: umidade },
          { label: "MER", value: lot.mer },
          { label: "Status", value: null },
        ]}
      />

      <AlertsPanel alerts={alerts} />

      <TemporalChart points={points} />

      <TZTable rounds={lot.tz_rounds} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EATable title="EA72" rounds={lot.ea72_rounds} slots={2} />
        <EATable title="EA48" rounds={lot.ea48_rounds} slots={3} />
      </div>
      <EATable title="EA24" rounds={lot.ea24_rounds} slots={1} />

      <AreiaTable rounds={lot.areia_rounds} />
    </div>
  );
}

function buildTemporal(lot: Awaited<ReturnType<typeof fetchLotByNumero>>): TemporalPoint[] {
  if (!lot) return [];
  const byDate = new Map<string, TemporalPoint>();
  const upsert = (date: string | null, patch: Partial<TemporalPoint>) => {
    if (!date) return;
    const prev = byDate.get(date) ?? { date };
    byDate.set(date, { ...prev, ...patch });
  };
  for (const r of lot.tz_rounds) {
    upsert(r.data, { VIGOR: r.vigor, VIABILIDADE: r.viabilidade });
  }
  for (const r of lot.ea72_rounds) upsert(r.data, { EA72: r.normais });
  for (const r of lot.ea48_rounds) upsert(r.data, { EA48: r.normais });
  for (const r of lot.areia_rounds) upsert(r.data, { AREIA: r.resultado });
  for (const r of lot.gp_rounds) upsert(r.data, { "Germinação": r.normais });
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
