import * as XLSX from "xlsx";
import {
  AREIA_ROUNDS,
  DM_ROUNDS,
  EA24_ROUNDS,
  EA48_ROUNDS,
  EA72_ROUNDS,
  GP_ROUNDS,
  IDENTIFICACAO,
  PMS,
  STATUS_CONTROLE,
  TZ_ROUNDS,
  UMIDADE_ROUNDS,
  tzCol,
} from "./column-map";
import type { LotRecord, Maybe, TZRound } from "./schema";

type Row = Array<string | number | boolean | Date | null | undefined>;

function cell(row: Row, index1Based: number): unknown {
  return row[index1Based - 1];
}

function toStr(v: unknown): Maybe<string> {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === "-" || s.toLowerCase() === "null") return null;
  return s;
}

function toNum(v: unknown): Maybe<number> {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(",", ".").trim();
  if (!s || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toDate(v: unknown): Maybe<string> {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(v);
    if (!parsed) return null;
    const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s || s === "-") return null;
  // Accept dd/mm/yyyy, yyyy-mm-dd
  const br = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(s);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseTZRound(row: Row, start: number, round: 1 | 2 | 3 | 4): TZRound | null {
  const protocolo = toStr(cell(row, tzCol(start, "protocolo")));
  const vigor = toNum(cell(row, tzCol(start, "vigor")));
  const viab = toNum(cell(row, tzCol(start, "viabilidade")));
  const data = toDate(cell(row, tzCol(start, "data")));
  if (!protocolo && vigor === null && viab === null && !data) return null;
  return {
    round,
    protocolo,
    vigor,
    viabilidade: viab,
    c1_c2: toNum(cell(row, tzCol(start, "c1_c2"))),
    c1_c2_c3: toNum(cell(row, tzCol(start, "c1_c2_c3"))),
    c3r: toNum(cell(row, tzCol(start, "c3r"))),
    soma_1a3r: toNum(cell(row, tzCol(start, "soma_1a3r"))),
    dm_c1_8: toNum(cell(row, tzCol(start, "dm_c1_8"))),
    umid_c1_8: toNum(cell(row, tzCol(start, "umid_c1_8"))),
    perc_c1_8: toNum(cell(row, tzCol(start, "perc_c1_8"))),
    mort_mecanico: toNum(cell(row, tzCol(start, "mort_mecanico"))),
    mort_umidade: toNum(cell(row, tzCol(start, "mort_umidade"))),
    percevejo: toNum(cell(row, tzCol(start, "percevejo"))),
    sem_duras: toNum(cell(row, tzCol(start, "sem_duras"))),
    esverdeadas: toNum(cell(row, tzCol(start, "esverdeadas"))),
    helicoverpa: toNum(cell(row, tzCol(start, "helicoverpa"))),
    data,
  };
}

function parseEARounds(row: Row, rounds: { round: number; start: number }[]) {
  return rounds
    .map(({ round, start }) => {
      const protocolo = toStr(cell(row, start));
      const normais = toNum(cell(row, start + 1));
      const fortes = toNum(cell(row, start + 2));
      const fracas = toNum(cell(row, start + 3));
      const data = toDate(cell(row, start + 4));
      if (!protocolo && normais === null && fortes === null && fracas === null && !data) {
        return null;
      }
      return { round, protocolo, normais, fortes, fracas, data };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

function parseAreiaRounds(row: Row) {
  return AREIA_ROUNDS.map(({ round, start }) => {
    const protocolo = toStr(cell(row, start));
    const l1 = toNum(cell(row, start + 1));
    const l2 = toNum(cell(row, start + 2));
    const resultado = toNum(cell(row, start + 3));
    const data = toDate(cell(row, start + 4));
    if (!protocolo && l1 === null && l2 === null && resultado === null && !data) {
      return null;
    }
    return { round, protocolo, l1, l2, resultado, data };
  }).filter((x): x is NonNullable<typeof x> => !!x);
}

function parseSimpleRounds(row: Row, rounds: { round: number; start: number }[]) {
  return rounds
    .map(({ round, start }) => {
      const valor = toNum(cell(row, start));
      const data = toDate(cell(row, start + 1));
      if (valor === null && !data) return null;
      return { round, valor, data };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

function parseGPRounds(row: Row) {
  return GP_ROUNDS.map(({ round, start }) => {
    const protocolo = toStr(cell(row, start));
    const normais = toNum(cell(row, start + 1));
    const data = toDate(cell(row, start + 2));
    const pc_pureza = toNum(cell(row, start + 3));
    if (!protocolo && normais === null && !data && pc_pureza === null) return null;
    return { round, protocolo, normais, data, pc_pureza };
  }).filter((x): x is NonNullable<typeof x> => !!x);
}

export function parseLotSheet(fileBuffer: ArrayBuffer): LotRecord[] {
  const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: false });
  const first = workbook.SheetNames[0];
  if (!first) return [];
  const sheet = workbook.Sheets[first];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  const lotsByLote = new Map<string, LotRecord>();
  // Detect header row — skip the first row if NUMEROLOTE is non-numeric text in col 1
  const [firstRow, ...rest] = rows;
  const dataRows =
    firstRow && /numerolote/i.test(String(cell(firstRow, 1) ?? "")) ? rest : rows;

  for (const row of dataRows) {
    if (!row) continue;
    const numerolote = toStr(cell(row, IDENTIFICACAO.NUMEROLOTE));
    if (!numerolote) continue;

    const tz = TZ_ROUNDS.map(({ round, start }) => parseTZRound(row, start, round)).filter(
      (x): x is TZRound => !!x
    );
    const ea72 = parseEARounds(row, EA72_ROUNDS);
    const ea24 = parseEARounds(row, EA24_ROUNDS);
    const ea48 = parseEARounds(row, EA48_ROUNDS);
    const areia = parseAreiaRounds(row);
    const umidade = parseSimpleRounds(row, UMIDADE_ROUNDS);
    const dm = parseSimpleRounds(row, DM_ROUNDS);
    const gp = parseGPRounds(row);

    const pmsProto = toStr(cell(row, PMS.PROTOCOLOPM_R1));
    const pmsVal = toNum(cell(row, PMS.PMS_R1));

    const incoming: LotRecord = {
      numerolote,
      cultivar: toStr(cell(row, IDENTIFICACAO.CULTIVAR)),
      classe: toStr(cell(row, IDENTIFICACAO.CLASSE)),
      peneira: toStr(cell(row, IDENTIFICACAO.PENEIRA)),
      unidade: toStr(cell(row, IDENTIFICACAO.UNIDADE)),
      empresa: toStr(cell(row, IDENTIFICACAO.UNIDADE)),
      represents_original: toStr(cell(row, IDENTIFICACAO.REPRES_ORIGINAL)),
      represents_sc40: toStr(cell(row, IDENTIFICACAO.REPRES_SC40)),
      pesobag: toNum(cell(row, IDENTIFICACAO.PESOBAG)),
      pesolote: toNum(cell(row, IDENTIFICACAO.PESOLOTE)),
      mer: toNum(cell(row, STATUS_CONTROLE.MER)),
      tsim: toStr(cell(row, STATUS_CONTROLE.TSIM)),
      statuslt: toStr(cell(row, STATUS_CONTROLE.STATUSLT)),
      tsi: toStr(cell(row, STATUS_CONTROLE.TSI)),
      ccheck: toStr(cell(row, STATUS_CONTROLE.CCHECK)),
      germ_ofic: toNum(cell(row, STATUS_CONTROLE.GERM_OFIC)),
      bas: toNum(cell(row, STATUS_CONTROLE.BAS)),
      databas: toDate(cell(row, STATUS_CONTROLE.DATABAS)),
      tz,
      ea72,
      ea24,
      ea48,
      areia,
      pms: pmsProto || pmsVal !== null ? { protocolo: pmsProto, pms: pmsVal } : null,
      umidade,
      dm,
      gp,
    };

    const existing = lotsByLote.get(numerolote);
    if (!existing) {
      lotsByLote.set(numerolote, incoming);
    } else {
      lotsByLote.set(numerolote, mergeLot(existing, incoming));
    }
  }

  return Array.from(lotsByLote.values());
}

// Combine two spreadsheet rows for the same NUMEROLOTE: keep the most recent
// non-null identification fields and concatenate rounds, renumbering repeats
// so the DB unique(lot_id, round) constraint still holds.
function mergeLot(existing: LotRecord, incoming: LotRecord): LotRecord {
  const pick = <T,>(a: T | null, b: T | null): T | null => (b ?? a);
  return {
    numerolote: existing.numerolote,
    cultivar: pick(existing.cultivar, incoming.cultivar),
    classe: pick(existing.classe, incoming.classe),
    peneira: pick(existing.peneira, incoming.peneira),
    unidade: pick(existing.unidade, incoming.unidade),
    empresa: pick(existing.empresa, incoming.empresa),
    represents_original: pick(existing.represents_original, incoming.represents_original),
    represents_sc40: pick(existing.represents_sc40, incoming.represents_sc40),
    pesobag: pick(existing.pesobag, incoming.pesobag),
    pesolote: pick(existing.pesolote, incoming.pesolote),
    mer: pick(existing.mer, incoming.mer),
    tsim: pick(existing.tsim, incoming.tsim),
    statuslt: pick(existing.statuslt, incoming.statuslt),
    tsi: pick(existing.tsi, incoming.tsi),
    ccheck: pick(existing.ccheck, incoming.ccheck),
    germ_ofic: pick(existing.germ_ofic, incoming.germ_ofic),
    bas: pick(existing.bas, incoming.bas),
    databas: pick(existing.databas, incoming.databas),
    tz: renumber([...existing.tz, ...incoming.tz], 4) as LotRecord["tz"],
    ea72: renumber([...existing.ea72, ...incoming.ea72], 2),
    ea24: renumber([...existing.ea24, ...incoming.ea24], 1),
    ea48: renumber([...existing.ea48, ...incoming.ea48], 3),
    areia: renumber([...existing.areia, ...incoming.areia], 8),
    pms: pick(existing.pms, incoming.pms),
    umidade: renumber([...existing.umidade, ...incoming.umidade], 4),
    dm: renumber([...existing.dm, ...incoming.dm], 4),
    gp: renumber([...existing.gp, ...incoming.gp], 3),
  };
}

function renumber<T extends { round: number }>(items: T[], max: number): T[] {
  return items.slice(0, max).map((item, i) => ({ ...item, round: i + 1 }));
}
