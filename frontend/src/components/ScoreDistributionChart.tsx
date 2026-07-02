import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { Candidate } from "../types";

const barColor: Record<Candidate["matchLevel"], string> = {
  strong: "#532057",
  partial: "#9B4C7D",
  weak: "#AE445A",
};

export default function ScoreDistributionChart({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const data = candidates.map((c) => ({
    name: c.name.split(" ")[0],
    score: Math.round(c.score * 100),
    level: c.matchLevel,
  }));

  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-6 shadow-panel">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-orchid-500" />
        <h3 className="font-display text-base font-semibold text-ink">
          Score Distribution
        </h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F0E7EE" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#1D1A39", fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: "#EAD2C7" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#1D1A39aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: "#F6EFF6" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EBD9EC",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}`, "Match score"]}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={56}>
              {data.map((entry, index) => (
                <Cell key={index} fill={barColor[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
