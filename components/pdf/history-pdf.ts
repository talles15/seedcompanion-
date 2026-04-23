import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LotRow } from "@/lib/lots";
import { applyThreshold, type ThresholdMap } from "@/lib/thresholds";

type HistoryRow = {
  lote: string;
  cultivar: string;
  vigor?: number | null;
  viabilidade?: number | null;
  dataTz?: string | null;
  ea72?: number | null;
  dataEa72?: string | null;
  ea48?: number | null;
  dataEa48?: string | null;
  ea24?: number | null;
  dataEa24?: string | null;
  areia?: number | null;
  dataAreia?: string | null;
  areia2?: number | null;
  dataAreia2?: string | null;
  germ?: number | null;
  bas?: number | null;
  dataBas?: string | null;
};

function fmtDateCell(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

function cellNum(
  test: Parameters<typeof applyThreshold>[0] | null,
  value: number | null | undefined,
  thresholds: ThresholdMap,
  digits = 0
): string {
  if (value === null || value === undefined) return "";
  if (!test) return value.toFixed(digits);
  return applyThreshold(test, value, thresholds, digits);
}

// Build the TSV-style history: one row per "period" (the latest round per test
// type is used as the representative result for that test; if there are more
// rounds we emit additional rows so each test result still appears).
function buildRows(lot: LotRow): HistoryRow[] {
  const rows: HistoryRow[] = [];

  const maxRounds = Math.max(
    lot.tz_rounds.length,
    lot.ea72_rounds.length,
    lot.ea48_rounds.length,
    lot.ea24_rounds.length,
    lot.areia_rounds.length,
    lot.gp_rounds.length,
    1
  );

  const sortedTz = [...lot.tz_rounds].sort((a, b) => a.round - b.round);
  const sortedEa72 = [...lot.ea72_rounds].sort((a, b) => a.round - b.round);
  const sortedEa48 = [...lot.ea48_rounds].sort((a, b) => a.round - b.round);
  const sortedEa24 = [...lot.ea24_rounds].sort((a, b) => a.round - b.round);
  const sortedAreia = [...lot.areia_rounds].sort((a, b) => a.round - b.round);
  const sortedGp = [...lot.gp_rounds].sort((a, b) => a.round - b.round);

  for (let i = 0; i < maxRounds; i++) {
    const tz = sortedTz[i];
    const ea72 = sortedEa72[i];
    const ea48 = sortedEa48[i];
    const ea24 = sortedEa24[i];
    const areia = sortedAreia[i];
    const areia2 = sortedAreia[i + maxRounds];
    const gp = sortedGp[i];

    rows.push({
      lote: lot.numerolote,
      cultivar: lot.cultivar ?? "",
      vigor: tz?.vigor ?? null,
      viabilidade: tz?.viabilidade ?? null,
      dataTz: tz?.data ?? null,
      ea72: ea72?.normais ?? null,
      dataEa72: ea72?.data ?? null,
      ea48: ea48?.normais ?? null,
      dataEa48: ea48?.data ?? null,
      ea24: ea24?.normais ?? null,
      dataEa24: ea24?.data ?? null,
      areia: areia?.resultado ?? null,
      dataAreia: areia?.data ?? null,
      areia2: areia2?.resultado ?? null,
      dataAreia2: areia2?.data ?? null,
      germ: gp?.normais ?? lot.germ_ofic ?? null,
      bas: i === 0 ? lot.bas ?? null : null,
      dataBas: i === 0 ? lot.databas ?? null : null,
    });
  }

  return rows;
}

function drawHeader(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Left: "Sementes São Francisco" placeholder logo area. We don't ship a
  // binary; we draw a styled text block so the header stays faithful even
  // without the asset.
  doc.setFillColor(27, 158, 62);
  doc.rect(40, 30, 90, 46, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Sementes", 85, 48, { align: "center" });
  doc.text("São Francisco", 85, 62, { align: "center" });

  // Center header
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LAS - Laboratório de Análise de Sementes", pageWidth / 2, 42, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("SEMENTES SÃO FRANCISCO", pageWidth / 2, 58, { align: "center" });
  doc.text(
    "FONE: 64 2101-2900-ROD BR 060 KM 422, S/N,  RIO VERDE - GO",
    pageWidth / 2,
    72,
    { align: "center" }
  );

  // Disclaimer
  doc.setLineWidth(0.5);
  doc.rect(40, 88, pageWidth - 80, 24);
  doc.setFontSize(10);
  doc.text(
    "PROIBIDA A COMERCIALIZAÇÃO Art. 76, §1°, do Decreto n°10.586 de 18.12.20",
    pageWidth / 2,
    104,
    { align: "center" }
  );

  // Green banner
  doc.setFillColor(163, 217, 169);
  doc.rect(40, 120, pageWidth - 80, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.text("LABORATÓRIO SÃO FRANCISCO", pageWidth / 2, 133, { align: "center" });
}

function drawFooter(doc: jsPDF, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const notes = [
    "**TPG - TESTE PADRÃO DE GERMINAÇÃO OFICIAL - Teste conduzido em sala de germinação a 25°C , substrato Rolo de Papel , e contagem",
    "em 5 dias. Resultado expresso em plântulas normais.",
    "***TESTE DE ENVELHECIMENTO ACELERADO 48 H - Teste conduzido em BOD a 41°C por 48 horas e plantado em canteiro de areia, resultado expresso em plântulas normais.",
    "***TESTE DE ENVELHECIMENTO ACELERADO 72 H - Teste conduzido em BOD a 41°C por 72 horas e plantado em canteiro de areia, resultado expresso em plântulas normais.",
    "***TESTE DE ENVELHECIMENTO ACELERADO 24 H - Teste conduzido em BOD a 41°C por 24horas e plantado em canteiro de areia, resultado expresso em plântulas normais.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let y = startY + 10;
  for (const line of notes) {
    doc.text(line, 40, y, { maxWidth: pageWidth - 80 });
    y += 10;
  }

  const today = new Date();
  const dateLine = `Rio Verde,               ${format(
    today,
    "eeee, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )}`;
  doc.setFontSize(9);
  doc.text(dateLine, 40, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Exportado em ${format(today, "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    pageWidth - 40,
    y + 6,
    { align: "right" }
  );
}

export async function generateHistoryPdf(lot: LotRow, thresholds: ThresholdMap) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  drawHeader(doc);

  const rows = buildRows(lot);
  const body = rows.map((r) => [
    r.lote,
    r.cultivar,
    cellNum("VIGOR", r.vigor, thresholds),
    cellNum(null, r.viabilidade, thresholds),
    fmtDateCell(r.dataTz),
    cellNum("EA72", r.ea72, thresholds),
    fmtDateCell(r.dataEa72),
    cellNum("EA48", r.ea48, thresholds),
    fmtDateCell(r.dataEa48),
    cellNum("EA24", r.ea24, thresholds),
    fmtDateCell(r.dataEa24),
    cellNum("AREIA", r.areia, thresholds),
    fmtDateCell(r.dataAreia),
    cellNum("AREIA", r.areia2, thresholds),
    fmtDateCell(r.dataAreia2),
    cellNum("GERM", r.germ, thresholds),
    r.bas !== null && r.bas !== undefined ? String(r.bas) : "",
    fmtDateCell(r.dataBas),
  ]);

  autoTable(doc, {
    startY: 148,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 8, cellPadding: 3, halign: "center", valign: "middle" },
    headStyles: { fillColor: [163, 217, 169], textColor: 0, fontStyle: "bold" },
    head: [
      [
        "LOTE",
        "CULTIVAR",
        "VIGOR",
        "VIABILIDADE",
        "DATA",
        "EA72 H",
        "DATA",
        "EA48 H",
        "DATA",
        "EA24 H",
        "DATA",
        "AREIA",
        "DATA",
        "AREIA",
        "DATA",
        "GERMINAÇÃO OFICIAL",
        "BAS",
        "DATA BAS",
      ],
    ],
    body,
    theme: "grid",
  });

  // @ts-expect-error autoTable attaches lastAutoTable
  const endY = doc.lastAutoTable?.finalY ?? 160;
  drawFooter(doc, endY);

  doc.save(`historico_${lot.numerolote}.pdf`);
}
