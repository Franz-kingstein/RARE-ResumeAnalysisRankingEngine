import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Target } from "lucide-react";
import type { SkillGapPoint } from "../types";

export default function SkillGapRadar({
  data,
  candidateName,
}: {
  data: SkillGapPoint[];
  candidateName: string;
}) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-6 shadow-panel">
      <div className="mb-1 flex items-center gap-2">
        <Target size={18} className="text-orchid-500" />
        <h3 className="font-display text-base font-semibold text-ink">
          Skill Gap Analysis
        </h3>
      </div>
      <p className="mb-3 text-xs text-ink/40">
        {candidateName} vs. role requirements
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#EAD2C7" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#1D1A39", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#1D1A39", fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Required"
              dataKey="required"
              stroke="#C26A9A"
              fill="#C26A9A"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Radar
              name="Candidate"
              dataKey="candidate"
              stroke="#532057"
              fill="#532057"
              fillOpacity={0.32}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EBD9EC",
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
              iconType="circle"
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
