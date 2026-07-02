import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ScoreDistributionSlice } from "../../types";

export default function ScoreDistributionDonut({
  data,
}: {
  data: ScoreDistributionSlice[];
}) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-2 font-display text-base font-semibold text-ink">
        Score Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="band"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={3}
              cornerRadius={4}
              stroke="none"
            >
              {data.map((slice, i) => (
                <Cell key={i} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #EBD9EC", fontSize: 12 }}
              formatter={(value: number, _name, entry) => [
                `${value} candidates`,
                (entry?.payload as ScoreDistributionSlice)?.band,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((slice) => (
          <span key={slice.band} className="flex items-center gap-1.5 text-[11px] font-medium text-ink/60">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            {slice.band}
          </span>
        ))}
      </div>
    </div>
  );
}
