"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ComparisonRow = {
  cultivar: string;
  VIGOR: number | null;
  EA72: number | null;
  EA48: number | null;
  AREIA: number | null;
  Germinação: number | null;
};

const SERIES: Array<{ key: keyof Omit<ComparisonRow, "cultivar">; color: string }> = [
  { key: "VIGOR", color: "#16a34a" },
  { key: "EA72", color: "#a855f7" },
  { key: "EA48", color: "#3b82f6" },
  { key: "AREIA", color: "#f97316" },
  { key: "Germinação", color: "#ef4444" },
];

export function ParametersComparison({ data }: { data: ComparisonRow[] }) {
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Comparativo de Parâmetros por Cultivar
      </div>
      <div className="h-72 px-3 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#eee" vertical={false} />
            <XAxis dataKey="cultivar" fontSize={10} angle={-15} textAnchor="end" height={50} />
            <YAxis domain={[0, 100]} fontSize={11} />
            <Tooltip />
            <Legend />
            {SERIES.map((s) => (
              <Bar key={s.key as string} dataKey={s.key as string} fill={s.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
