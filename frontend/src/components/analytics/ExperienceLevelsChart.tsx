import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExperienceLevelPoint } from "../../types";

export default function ExperienceLevelsChart({
  data,
}: {
  data: ExperienceLevelPoint[];
}) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-4 font-display text-base font-semibold text-ink">
        Experience Levels
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F0E7EE" />
            <XAxis
              dataKey="bracket"
              tick={{ fill: "#1D1A39", fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: "#EAD2C7" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#1D1A39aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              cursor={{ fill: "#F6EFF6" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #EBD9EC", fontSize: 12 }}
              formatter={(value: number) => [`${value}`, "Candidates"]}
            />
            <Bar dataKey="count" fill="#532057" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
