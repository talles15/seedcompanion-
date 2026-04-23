export type Maybe<T> = T | null;

export interface LotRecord {
  numerolote: string;
  cultivar: Maybe<string>;
  classe: Maybe<string>;
  peneira: Maybe<string>;
  unidade: Maybe<string>;
  empresa: Maybe<string>;
  represents_original: Maybe<string>;
  represents_sc40: Maybe<string>;
  pesobag: Maybe<number>;
  pesolote: Maybe<number>;
  mer: Maybe<number>;
  tsim: Maybe<string>;
  statuslt: Maybe<string>;
  tsi: Maybe<string>;
  ccheck: Maybe<string>;
  germ_ofic: Maybe<number>;
  bas: Maybe<number>;
  databas: Maybe<string>;
  tz: TZRound[];
  ea72: EARound[];
  ea24: EARound[];
  ea48: EARound[];
  areia: AreiaRound[];
  pms: Maybe<{ protocolo: Maybe<string>; pms: Maybe<number> }>;
  umidade: SimpleRound[];
  dm: SimpleRound[];
  gp: GPRound[];
}

export interface TZRound {
  round: 1 | 2 | 3 | 4;
  protocolo: Maybe<string>;
  vigor: Maybe<number>;
  viabilidade: Maybe<number>;
  dm_c1_8: Maybe<number>;
  umid_c1_8: Maybe<number>;
  perc_c1_8: Maybe<number>;
  c1_c2: Maybe<number>;
  c1_c2_c3: Maybe<number>;
  c3r: Maybe<number>;
  soma_1a3r: Maybe<number>;
  sem_duras: Maybe<number>;
  esverdeadas: Maybe<number>;
  helicoverpa: Maybe<number>;
  mort_mecanico: Maybe<number>;
  mort_umidade: Maybe<number>;
  percevejo: Maybe<number>;
  data: Maybe<string>;
}

export interface EARound {
  round: number;
  protocolo: Maybe<string>;
  normais: Maybe<number>;
  fortes: Maybe<number>;
  fracas: Maybe<number>;
  data: Maybe<string>;
}

export interface AreiaRound {
  round: number;
  protocolo: Maybe<string>;
  l1: Maybe<number>;
  l2: Maybe<number>;
  resultado: Maybe<number>;
  data: Maybe<string>;
}

export interface SimpleRound {
  round: number;
  valor: Maybe<number>;
  data: Maybe<string>;
}

export interface GPRound {
  round: number;
  protocolo: Maybe<string>;
  normais: Maybe<number>;
  data: Maybe<string>;
  pc_pureza: Maybe<number>;
}
