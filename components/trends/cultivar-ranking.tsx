"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CultivarRanking({
  data,
}: {
  data: { cultivar: string; nota: number }[];
}) {
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium">
        Nota Média por Cultivar
      </div>
      <div className="h-64 px-3 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid stroke="#eee" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} fontSize={11} />
            <YAxis type="category" dataKey="cultivar" fontSize={11} width={120} />
            <Tooltip />
            <Bar dataKey="nota" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
