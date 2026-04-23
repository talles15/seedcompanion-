import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LotRow } from "@/lib/lot-shared";

export * from "@/lib/lot-shared";

const LOT_SELECT = `
  id, numerolote, cultivar, classe, peneira, unidade, empresa, statuslt,
  germ_ofic, bas, databas, mer,
  tz_rounds ( round, vigor, viabilidade, c1_c2, c1_c2_c3, c3r, soma_1a3r,
              dm_c1_8, umid_c1_8, perc_c1_8, mort_mecanico, mort_umidade,
              percevejo, sem_duras, esverdeadas, helicoverpa, data ),
  ea72_rounds ( round, normais, fortes, fracas, data ),
  ea48_rounds ( round, normais, fortes, fracas, data ),
  ea24_rounds ( round, normais, fortes, fracas, data ),
  areia_rounds ( round, l1, l2, resultado, data ),
  umidade ( round, valor, data ),
  dm ( round, valor, data ),
  gp_rounds ( round, normais, data, pc_pureza )
`;

export async function fetchAllLots(): Promise<LotRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lots")
    .select(LOT_SELECT)
    .order("numerolote", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as LotRow[];
}

export async function fetchLotByNumero(
  numerolote: string
): Promise<LotRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lots")
    .select(LOT_SELECT)
    .eq("numerolote", numerolote)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as LotRow) ?? null;
}
