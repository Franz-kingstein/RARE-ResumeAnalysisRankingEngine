import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SkillDistributionPoint } from "../../types";

export default function SkillDistributionChart({
  data,
  colors,
}: {
  data: SkillDistributionPoint[];
  colors: string[];
}) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-4 font-display text-base font-semibold text-ink">
        Skill Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="#F0E7EE" />
            <XAxis
              type="number"
              tick={{ fill: "#1D1A39aa", fontSize: 11 }}
              axisLine={{ stroke: "#EAD2C7" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="skill"
              width={78}
              tick={{ fill: "#1D1A39", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#F6EFF6" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #EBD9EC", fontSize: 12 }}
              formatter={(value: number) => [`${value}`, "Candidates"]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={16}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
