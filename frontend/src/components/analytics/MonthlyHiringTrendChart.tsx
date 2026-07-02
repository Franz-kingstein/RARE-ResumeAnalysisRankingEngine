import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HiringTrendPoint } from "../../types";

export default function MonthlyHiringTrendChart({
  data,
}: {
  data: HiringTrendPoint[];
}) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-4 font-display text-base font-semibold text-ink">
        Monthly Hiring Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F0E7EE" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#1D1A39", fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: "#EAD2C7" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#1D1A39aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #EBD9EC", fontSize: 12 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="candidates"
              name="Candidates"
              stroke="#532057"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#532057" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="shortlisted"
              name="Shortlisted"
              stroke="#F39F5A"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#F39F5A" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
