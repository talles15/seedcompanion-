"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CLASSIFICATION_COLORS, type Classification } from "@/lib/classification";

export function ClassificationBars({
  counts,
}: {
  counts: Record<Classification, number>;
}) {
  const order: Classification[] = [
    "Excelente",
    "Bom",
    "Regular",
    "Atenção",
    "Reprovado",
  ];
  const data = order.map((c) => ({ name: c, Lotes: counts[c] ?? 0 }));
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Distribuição por Classificação
      </div>
      <div className="h-64 px-3 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#eee" vertical={false} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Bar dataKey="Lotes" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={CLASSIFICATION_COLORS[d.name as Classification]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
