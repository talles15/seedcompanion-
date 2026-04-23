import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { parseLotSheet } from "@/lib/xlsx/parse-lot-sheet";
import type { LotRecord } from "@/lib/xlsx/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // The middleware already guards this route, but double-check the session.
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }

  let lots: LotRecord[];
  try {
    const buffer = await file.arrayBuffer();
    lots = parseLotSheet(buffer);
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao ler a planilha", details: String(err) },
      { status: 400 }
    );
  }

  if (lots.length === 0) {
    return NextResponse.json({ error: "Planilha sem lotes" }, { status: 400 });
  }

  // Use the service role to bypass RLS for the bulk replace. The user session
  // has already been authenticated above.
  const admin = createSupabaseServiceClient();

  // Replace snapshot: delete all existing lots (cascades round tables) then insert.
  const del = await admin.from("lots").delete().not("id", "is", null);
  if (del.error) {
    return NextResponse.json({ error: del.error.message }, { status: 500 });
  }

  const upload = await admin
    .from("uploads")
    .insert({ filename: file.name, row_count: lots.length })
    .select("id")
    .single();
  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }
  const uploadId = upload.data.id as string;

  const lotRows = lots.map((l) => ({
    numerolote: l.numerolote,
    cultivar: l.cultivar,
    classe: l.classe,
    peneira: l.peneira,
    unidade: l.unidade,
    empresa: l.empresa,
    represents_original: l.represents_original,
    represents_sc40: l.represents_sc40,
    pesobag: l.pesobag,
    pesolote: l.pesolote,
    mer: l.mer,
    tsim: l.tsim,
    statuslt: l.statuslt,
    tsi: l.tsi,
    ccheck: l.ccheck,
    germ_ofic: l.germ_ofic,
    bas: l.bas,
    databas: l.databas,
    upload_id: uploadId,
  }));

  const ins = await admin
    .from("lots")
    .insert(lotRows)
    .select("id, numerolote");
  if (ins.error) {
    return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  const idByLote = new Map(ins.data.map((r) => [r.numerolote, r.id as string]));

  const tz: any[] = [];
  const ea72: any[] = [];
  const ea24: any[] = [];
  const ea48: any[] = [];
  const areia: any[] = [];
  const pms: any[] = [];
  const umidade: any[] = [];
  const dm: any[] = [];
  const gp: any[] = [];

  for (const l of lots) {
    const lotId = idByLote.get(l.numerolote);
    if (!lotId) continue;
    for (const r of l.tz) tz.push({ ...r, lot_id: lotId });
    for (const r of l.ea72) ea72.push({ ...r, lot_id: lotId });
    for (const r of l.ea24) ea24.push({ ...r, lot_id: lotId });
    for (const r of l.ea48) ea48.push({ ...r, lot_id: lotId });
    for (const r of l.areia) areia.push({ ...r, lot_id: lotId });
    if (l.pms) pms.push({ ...l.pms, lot_id: lotId });
    for (const r of l.umidade) umidade.push({ ...r, lot_id: lotId });
    for (const r of l.dm) dm.push({ ...r, lot_id: lotId });
    for (const r of l.gp) gp.push({ ...r, lot_id: lotId });
  }

  const writes: Array<Promise<{ error: { message: string } | null }>> = [];
  if (tz.length) writes.push(admin.from("tz_rounds").insert(tz));
  if (ea72.length) writes.push(admin.from("ea72_rounds").insert(ea72));
  if (ea24.length) writes.push(admin.from("ea24_rounds").insert(ea24));
  if (ea48.length) writes.push(admin.from("ea48_rounds").insert(ea48));
  if (areia.length) writes.push(admin.from("areia_rounds").insert(areia));
  if (pms.length) writes.push(admin.from("pms").insert(pms));
  if (umidade.length) writes.push(admin.from("umidade").insert(umidade));
  if (dm.length) writes.push(admin.from("dm").insert(dm));
  if (gp.length) writes.push(admin.from("gp_rounds").insert(gp));

  const results = await Promise.all(writes);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return NextResponse.json({ error: firstError.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, uploadId, count: lots.length });
}
