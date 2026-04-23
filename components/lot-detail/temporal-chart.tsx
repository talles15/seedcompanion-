"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TemporalPoint = {
  date: string;
  VIGOR?: number | null;
  VIABILIDADE?: number | null;
  EA72?: number | null;
  EA48?: number | null;
  Germinação?: number | null;
  AREIA?: number | null;
};

const SERIES: Array<{ key: keyof TemporalPoint; color: string }> = [
  { key: "VIGOR", color: "#16a34a" },
  { key: "VIABILIDADE", color: "#0891b2" },
  { key: "EA72", color: "#a855f7" },
  { key: "EA48", color: "#3b82f6" },
  { key: "Germinação", color: "#f97316" },
  { key: "AREIA", color: "#ef4444" },
];

export function TemporalChart({ points }: { points: TemporalPoint[] }) {
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Evolução Temporal da Qualidade
      </div>
      <div className="h-64 px-4 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid stroke="#eee" vertical={false} />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis domain={[0, 100]} fontSize={11} />
            <Tooltip />
            <Legend />
            {SERIES.map((s) => (
              <Line
                key={s.key as string}
                type="monotone"
                dataKey={s.key as string}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
