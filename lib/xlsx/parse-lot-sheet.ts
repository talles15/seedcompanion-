import * as XLSX from "xlsx";
import type {
  AreiaRound,
  EARound,
  GPRound,
  LotRecord,
  Maybe,
  SimpleRound,
  TZRound,
} from "./schema";

type Row = Array<string | number | boolean | Date | null | undefined>;

function normalize(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
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
    const parsed = XLSX.SSF.parse_date_code(v);
    if (!parsed) return null;
    const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s || s === "-") return null;
  const br = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(s);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Name-based accessor: looks up a column's index by header name and reads its cell. */
class RowReader {
  constructor(
    private readonly row: Row,
    private readonly headers: Map<string, number>
  ) {}

  get(...names: string[]): unknown {
    for (const n of names) {
      const idx = this.headers.get(normalize(n));
      if (idx !== undefined) {
        const v = this.row[idx];
        if (v !== null && v !== undefined && v !== "") return v;
      }
    }
    return null;
  }

  str(...names: string[]) {
    return toStr(this.get(...names));
  }
  num(...names: string[]) {
    return toNum(this.get(...names));
  }
  date(...names: string[]) {
    return toDate(this.get(...names));
  }

  hasAny(...names: string[]): boolean {
    return names.some((n) => this.headers.has(normalize(n)));
  }
}

function tzRound(r: RowReader, round: 1 | 2 | 3 | 4): TZRound | null {
  const s = `_R${round}`;
  const protocolo = r.str(`PROTOCOLOTZ${s}`);
  const vigor = r.num(`VIGOR${s}`);
  const viab = r.num(`VIABILIDADE${s}`);
  const data = r.date(`DATAANALISETETRA${s}`, `DATATETRA${s}`, `DATATZ${s}`);
  if (!protocolo && vigor === null && viab === null && !data) return null;
  return {
    round,
    protocolo,
    vigor,
    viabilidade: viab,
    c1_c2: r.num(`SOMAC1C2${s}`),
    c1_c2_c3: r.num(`SOMAC1C2C3${s}`),
    c3r: r.num(`TRESR${s}`, `3R${s}`),
    soma_1a3r: r.num(`SOMA1A3R${s}`),
    dm_c1_8: r.num(`DANOMECANICO_1A8${s}`, `DM_1A8${s}`),
    umid_c1_8: r.num(`UMIDADE_1A8${s}`, `UMID_1A8${s}`),
    perc_c1_8: r.num(`PERCEVEJO_1A8${s}`, `PERC_1A8${s}`),
    mort_mecanico: r.num(`MORTA_MECANICO_6A8${s}`, `MORTAMECANICO${s}`),
    mort_umidade: r.num(`MORTA_UMIDADE_6_8${s}`, `MORTA_UMIDADE_6A8${s}`),
    percevejo: r.num(`MORTA_PERCEVEJO_6A8${s}`, `PERCEVEJO${s}`),
    sem_duras: r.num(`SEMENTESDURAS${s}`, `SEM_DURAS${s}`),
    esverdeadas: r.num(`SEMENTEESVERDEADA${s}`, `ESVERDEADAS${s}`, `ESVERDEADO${s}`),
    helicoverpa: r.num(`HELICOVERPA${s}`),
    data,
  };
}

function eaRound(r: RowReader, prefix: "EA72" | "EA48" | "EA24", round: number): EARound | null {
  const s = `_R${round}`;
  const protocolo = r.str(`PROTOCOLO${prefix}${s}`);
  const normais = r.num(`${prefix}_NORMAIS${s}`);
  const fortes = r.num(`${prefix}_FORTES${s}`);
  const fracas = r.num(`${prefix}_FRACAS${s}`);
  const data = r.date(`DATA${prefix}${s}`, `${prefix}_DATA${s}`);
  if (!protocolo && normais === null && fortes === null && fracas === null && !data) {
    return null;
  }
  return { round, protocolo, normais, fortes, fracas, data };
}

function areiaRound(r: RowReader, round: number): AreiaRound | null {
  const s = `_R${round}`;
  const protocolo = r.str(`PROTOCOLOAR${s}`, `PROTOCOLOAREIA${s}`);
  const l1 = r.num(`AREIAL1${s}`);
  const l2 = r.num(`AREIAL2${s}`);
  const resultado = r.num(`AREIARESULT${s}`, `AREIARESULTADO${s}`);
  const data = r.date(`AREIADATA${s}`, `DATAAREIA${s}`);
  if (!protocolo && l1 === null && l2 === null && resultado === null && !data) return null;
  return { round, protocolo, l1, l2, resultado, data };
}

function umidadeRound(r: RowReader, round: number): SimpleRound | null {
  const s = `_R${round}`;
  const valor = r.num(`UMIDADE${s}`);
  const data = r.date(`DATAUMIDADE${s}`, `UMIDADE_DATA${s}`);
  if (valor === null && !data) return null;
  return { round, valor, data };
}

function dmRound(r: RowReader, round: number): SimpleRound | null {
  const s = `_R${round}`;
  const valor = r.num(`DM${s}`, `DANOMECANICO${s}`);
  const data = r.date(`DATADM${s}`, `DM_DATA${s}`);
  if (valor === null && !data) return null;
  return { round, valor, data };
}

function gpRound(r: RowReader, round: number): GPRound | null {
  const s = `_R${round}`;
  const protocolo = r.str(`PROTOCOLOGP${s}`);
  const normais = r.num(`GP_NORMAIS${s}`, `GERMP_NORMAIS${s}`);
  const data = r.date(`DATAGP${s}`, `GP_DATA${s}`);
  const pc_pureza = r.num(`PC_PUREZA${s}`, `PUREZA${s}`);
  if (!protocolo && normais === null && !data && pc_pureza === null) return null;
  return { round, protocolo, normais, data, pc_pureza };
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
  if (rows.length < 2) return [];

  const headerRow = rows[0] ?? [];
  const headers = new Map<string, number>();
  for (let i = 0; i < headerRow.length; i++) {
    const name = normalize(headerRow[i]);
    if (name && !headers.has(name)) headers.set(name, i);
  }

  if (!headers.has("NUMEROLOTE")) {
    throw new Error(
      'Cabeçalho não encontrado: coluna "NUMEROLOTE" não existe na primeira linha.'
    );
  }

  const lotsByLote = new Map<string, LotRecord>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const reader = new RowReader(row, headers);
    const numerolote = reader.str("NUMEROLOTE");
    if (!numerolote) continue;

    const tz = ([1, 2, 3, 4] as const)
      .map((n) => tzRound(reader, n))
      .filter((x): x is TZRound => !!x);

    const ea72 = [1, 2]
      .map((n) => eaRound(reader, "EA72", n))
      .filter((x): x is EARound => !!x);
    const ea24 = [1]
      .map((n) => eaRound(reader, "EA24", n))
      .filter((x): x is EARound => !!x);
    const ea48 = [1, 2, 3]
      .map((n) => eaRound(reader, "EA48", n))
      .filter((x): x is EARound => !!x);
    const areia = [1, 2, 3, 4, 5, 6, 7, 8]
      .map((n) => areiaRound(reader, n))
      .filter((x): x is AreiaRound => !!x);
    const umidade = [1, 2, 3, 4]
      .map((n) => umidadeRound(reader, n))
      .filter((x): x is SimpleRound => !!x);
    const dm = [1, 2, 3, 4]
      .map((n) => dmRound(reader, n))
      .filter((x): x is SimpleRound => !!x);
    const gp = [1, 2, 3]
      .map((n) => gpRound(reader, n))
      .filter((x): x is GPRound => !!x);

    const pmsProto = reader.str("PROTOCOLOPM_R1");
    const pmsVal = reader.num("PMS_R1");

    const incoming: LotRecord = {
      numerolote,
      cultivar: reader.str("CULTIVAR"),
      classe: reader.str("CLASSE"),
      peneira: reader.str("PENEIRA"),
      unidade: reader.str("UNIDADE"),
      empresa: reader.str("EMPRESA", "UNIDADE"),
      represents_original: reader.str("REPRES_ORIGINAL"),
      represents_sc40: reader.str("REPRES_SC40"),
      pesobag: reader.num("PESOBAG"),
      pesolote: reader.num("PESOLOTE"),
      mer: reader.num("MER"),
      tsim: reader.str("TSIM"),
      statuslt: reader.str("STATUSLT"),
      tsi: reader.str("TSI"),
      ccheck: reader.str("CCHECK"),
      germ_ofic: reader.num("GERM_OFIC", "GERMINACAO_OFICIAL"),
      bas: reader.num("BAS"),
      databas: reader.date("DATABAS", "DATA_BAS"),
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
    lotsByLote.set(numerolote, existing ? mergeLot(existing, incoming) : incoming);
  }

  return Array.from(lotsByLote.values());
}

function mergeLot(existing: LotRecord, incoming: LotRecord): LotRecord {
  const pick = <T,>(a: T | null, b: T | null): T | null => b ?? a;
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
