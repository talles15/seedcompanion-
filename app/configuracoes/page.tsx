import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThresholdsForm } from "@/components/thresholds-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TEST_TYPES, type TestType } from "@/lib/thresholds";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("test_thresholds")
    .select("test_type, min_value");

  const initial: Record<TestType, string> = {
    VIGOR: "",
    EA72: "",
    EA48: "",
    EA24: "",
    AREIA: "",
    GERM: "",
  };
  for (const r of data ?? []) {
    const t = r.test_type as TestType;
    if (TEST_TYPES.includes(t) && r.min_value !== null) {
      initial[t] = String(r.min_value);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Configurações</h1>
          <p className="text-xs text-gray-500">
            Valores abaixo do mínimo serão exibidos como *** no PDF exportado.
          </p>
        </div>
      </div>
      <ThresholdsForm initial={initial} />
    </div>
  );
}
