export type Classification =
  | "Excelente"
  | "Bom"
  | "Regular"
  | "Atenção"
  | "Reprovado";

export function classify(score: number | null): Classification {
  if (score === null) return "Reprovado";
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Bom";
  if (score >= 70) return "Regular";
  if (score >= 60) return "Atenção";
  return "Reprovado";
}

export const CLASSIFICATION_COLORS: Record<Classification, string> = {
  Excelente: "#f59e0b",
  Bom: "#3b82f6",
  Regular: "#22c55e",
  "Atenção": "#f97316",
  Reprovado: "#ef4444",
};

// Computes a 0-100 score averaging the highest valid result of each main test.
export function computeScore(opts: {
  vigor?: number | null;
  viabilidade?: number | null;
  ea72?: number | null;
  ea48?: number | null;
  areia?: number | null;
  germ?: number | null;
}): number | null {
  const values = [
    opts.vigor,
    opts.viabilidade,
    opts.ea72,
    opts.ea48,
    opts.areia,
    opts.germ,
  ].filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}
