"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Enviando planilha...");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus(`Falha: ${json.error ?? res.statusText}`);
      return;
    }
    setStatus(`Importados ${json.count} lotes.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white rounded px-3 py-2 text-sm font-medium disabled:opacity-60"
      >
        <Upload className="h-4 w-4" />
        {busy ? "Enviando..." : "Importar planilha"}
      </button>
      {status && <span className="text-xs text-gray-600">{status}</span>}
    </div>
  );
}
