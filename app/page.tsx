import Link from "next/link";
import { KpiHeader } from "@/components/kpi-header";
import { LotListTable } from "@/components/lot-list-table";
import { UploadButton } from "@/components/upload-button";
import { fetchAllLots } from "@/lib/lots";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const lots = await fetchAllLots();

  const kpis = [
    { label: "Total de lotes", value: lots.length },
    {
      label: "Com TZ",
      value: lots.filter((l) => l.tz_rounds.length > 0).length,
      tint: "#22c55e",
    },
    {
      label: "Com AREIA",
      value: lots.filter((l) => l.areia_rounds.length > 0).length,
      tint: "#f97316",
    },
    {
      label: "Com EA72",
      value: lots.filter((l) => l.ea72_rounds.length > 0).length,
      tint: "#a855f7",
    },
    {
      label: "Com EA48",
      value: lots.filter((l) => l.ea48_rounds.length > 0).length,
      tint: "#3b82f6",
    },
    {
      label: "Com EA24",
      value: lots.filter((l) => l.ea24_rounds.length > 0).length,
      tint: "#0ea5e9",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Lotes de Sementes</h1>
          <p className="text-sm text-gray-500">
            Visão geral da base atual. Clique em um lote para ver os detalhes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tendencias"
            className="inline-flex items-center gap-2 bg-white border rounded px-3 py-2 text-sm hover:bg-gray-50"
          >
            Ver tendências
          </Link>
          {user && <UploadButton />}
        </div>
      </div>

      <KpiHeader items={kpis} />
      <LotListTable lots={lots} />
    </div>
  );
}
