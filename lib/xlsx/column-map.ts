// 1-based column indices following the user-provided spreadsheet map.
// TZ R1 is the authoritative layout — 23 fields — and R2/R3/R4 mirror it.
// Some offsets have gaps (R2 uses 41–62, R3 starts at 64).

export const IDENTIFICACAO = {
  NUMEROLOTE: 1,
  CULTIVAR: 2,
  CLASSE: 3,
  PENEIRA: 4,
  UNIDADE: 5,
  REPRES_ORIGINAL: 6,
  REPRES_SC40: 7,
  PESOBAG: 8,
  PESOLOTE: 9,
} as const;

export const STATUS_CONTROLE = {
  MER: 10,
  TSIM: 11,
  STATUSLT: 12,
  TSI: 13,
  CCHECK: 14,
  GERM_OFIC: 15,
  BAS: 16,
  DATABAS: 17,
} as const;

export interface TZRoundOffsets {
  protocolo: number;
  vigor: number;
  viabilidade: number;
  dm_c1_8: number;
  umid_c1_8: number;
  perc_c1_8: number;
  c1_c2: number;
  c1_c2_c3: number;
  c3r: number;
  soma_1a3r: number;
  mort_mecanico: number;
  mort_umidade: number;
  percevejo: number;
  sem_duras: number;
  esverdeadas: number;
  helicoverpa: number;
  data: number;
}

// Each round has 23 fields; we map the key ones used by the app.
// Offsets below are expressed as (start + offset) where start is round's first column.
const TZ_OFFSETS: TZRoundOffsets = {
  protocolo: 0,
  vigor: 1,
  viabilidade: 2,
  c1_c2: 3,
  c1_c2_c3: 4,
  c3r: 5,
  soma_1a3r: 6,
  dm_c1_8: 7,
  umid_c1_8: 8,
  perc_c1_8: 9,
  mort_mecanico: 10,
  mort_umidade: 11,
  percevejo: 12,
  sem_duras: 13,
  esverdeadas: 14,
  helicoverpa: 15,
  data: 22,
};

export const TZ_ROUNDS: Array<{ round: 1 | 2 | 3 | 4; start: number }> = [
  { round: 1, start: 18 },
  { round: 2, start: 41 },
  { round: 3, start: 64 },
  { round: 4, start: 87 },
];

export function tzCol(start: number, field: keyof TZRoundOffsets): number {
  return start + TZ_OFFSETS[field];
}

// 5-field EA-style rounds: protocolo, normais, fortes, fracas, data
export const EA_FIELDS = [
  "protocolo",
  "normais",
  "fortes",
  "fracas",
  "data",
] as const;

export const EA72_ROUNDS = [
  { round: 1, start: 110 },
  { round: 2, start: 115 },
];

export const EA24_ROUNDS = [{ round: 1, start: 120 }];

export const EA48_ROUNDS = [
  { round: 1, start: 125 },
  { round: 2, start: 130 },
  { round: 3, start: 135 },
];

// Areia: 8 rounds x 5 fields (protocolo, l1, l2, resultado, data), 140..179
export const AREIA_FIELDS = ["protocolo", "l1", "l2", "resultado", "data"] as const;
export const AREIA_ROUNDS = Array.from({ length: 8 }, (_, i) => ({
  round: i + 1,
  start: 140 + i * 5,
}));

export const PMS = { PROTOCOLOPM_R1: 180, PMS_R1: 181 } as const;

// Umidade: 4 rounds x 2 fields (valor, data), 182..189
export const UMIDADE_ROUNDS = Array.from({ length: 4 }, (_, i) => ({
  round: i + 1,
  start: 182 + i * 2,
}));

// DM: 4 rounds x 2 fields (valor, data), 190..197
export const DM_ROUNDS = Array.from({ length: 4 }, (_, i) => ({
  round: i + 1,
  start: 190 + i * 2,
}));

// GP: 3 rounds x 4 fields (protocolo, normais, data, pc_pureza), 198..209
export const GP_ROUNDS = Array.from({ length: 3 }, (_, i) => ({
  round: i + 1,
  start: 198 + i * 4,
}));
