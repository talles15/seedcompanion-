"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TEST_TYPES, type TestType } from "@/lib/thresholds";

export function ThresholdsForm({
  initial,
}: {
  initial: Record<TestType, string>;
}) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const supabase = createSupabaseBrowserClient();
    const rows = TEST_TYPES.map((t) => ({
      test_type: t,
      min_value: values[t].trim() === "" ? null : Number(values[t]),
    }));
    const { error } = await supabase
      .from("test_thresholds")
      .upsert(rows, { onConflict: "test_type" });
    setBusy(false);
    if (error) {
      setStatus(`Falha: ${error.message}`);
      return;
    }
    setStatus("Configurações salvas.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border rounded-lg p-4 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEST_TYPES.map((t) => (
          <label key={t} className="text-sm">
            <span className="block text-gray-700 mb-1">{t}</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={values[t]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [t]: e.target.value }))
              }
              placeholder="Sem mínimo"
              className="w-full border rounded px-3 py-2"
            />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-green hover:bg-brand-green-dark text-white rounded px-3 py-2 text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Salvando..." : "Salvar"}
        </button>
        {status && <span className="text-xs text-gray-600">{status}</span>}
      </div>
    </form>
  );
}
