"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { generateHistoryPdf } from "@/components/pdf/history-pdf";
import type { LotRow } from "@/lib/lot-shared";
import type { ThresholdMap } from "@/lib/thresholds";

export function ExportPdfButton({
  lot,
  thresholds,
}: {
  lot: LotRow;
  thresholds: ThresholdMap;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await generateHistoryPdf(lot, thresholds);
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex items-center gap-2 bg-white border rounded px-3 py-2 text-sm hover:bg-gray-50"
    >
      <Download className="h-4 w-4" /> Exportar histórico (PDF)
    </button>
  );
}
