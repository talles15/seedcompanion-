export interface LotRow {
  id: string;
  numerolote: string;
  cultivar: string | null;
  classe: string | null;
  peneira: string | null;
  unidade: string | null;
  empresa: string | null;
  statuslt: string | null;
  germ_ofic: number | null;
  bas: number | null;
  databas: string | null;
  mer: number | null;
  tz_rounds: TZRoundRow[];
  ea72_rounds: EARoundRow[];
  ea48_rounds: EARoundRow[];
  ea24_rounds: EARoundRow[];
  areia_rounds: AreiaRoundRow[];
  umidade: SimpleRoundRow[];
  dm: SimpleRoundRow[];
  gp_rounds: GPRoundRow[];
}

export interface TZRoundRow {
  round: number;
  vigor: number | null;
  viabilidade: number | null;
  c1_c2: number | null;
  c1_c2_c3: number | null;
  c3r: number | null;
  soma_1a3r: number | null;
  dm_c1_8: number | null;
  umid_c1_8: number | null;
  perc_c1_8: number | null;
  mort_mecanico: number | null;
  mort_umidade: number | null;
  percevejo: number | null;
  sem_duras: number | null;
  esverdeadas: number | null;
  helicoverpa: number | null;
  data: string | null;
}

export interface EARoundRow {
  round: number;
  normais: number | null;
  fortes: number | null;
  fracas: number | null;
  data: string | null;
}

export interface AreiaRoundRow {
  round: number;
  l1: number | null;
  l2: number | null;
  resultado: number | null;
  data: string | null;
}

export interface SimpleRoundRow {
  round: number;
  valor: number | null;
  data: string | null;
}

export interface GPRoundRow {
  round: number;
  normais: number | null;
  data: string | null;
  pc_pureza: number | null;
}

export function bestValue<T>(
  rounds: T[] | null | undefined,
  pick: (r: T) => number | null
): number | null {
  if (!rounds || rounds.length === 0) return null;
  const values = rounds
    .map(pick)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (values.length === 0) return null;
  return Math.max(...values);
}

export function latest<T extends { round: number }>(
  rounds: T[] | null | undefined
): T | null {
  if (!rounds || rounds.length === 0) return null;
  return [...rounds].sort((a, b) => b.round - a.round)[0];
}

export function byRound<T extends { round: number }>(
  rounds: T[] | null | undefined,
  round: number
): T | null {
  return rounds?.find((r) => r.round === round) ?? null;
}
