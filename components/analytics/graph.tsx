import React from "react";
import {
  XAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  CartesianGrid,
  Area,
} from "recharts";

interface GraphProps {
  departmentId: string | null;
  data: {name: string; value: number}[];
}

const Graph = ({departmentId, data}: GraphProps) => {
  return (
    <div>
      <div className="rounded-xl p-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{top: 10, right: 10, left: 0, bottom: 5}}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#333" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{fill: "#9CA3AF", fontSize: 10}}
            />
            <YAxis
              domain={[0, "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{fill: "#9CA3AF", fontSize: 10}}
            />

            {/* ✅ Area Fill */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fill="url(#colorValue)"
            />

            {/* ✅ Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{stroke: "#F59E0B", fill: "#F59E0B", r: 4}}
              activeDot={{
                r: 6,
                fill: "#FFF",
                stroke: "#F59E0B",
                strokeWidth: 2,
              }}
            />

            {/* ✅ Tooltip */}
            <Tooltip
              content={({active, payload}) =>
                active && payload?.length ? (
                  <div className="bg-gray-800 p-2 rounded text-xs border border-gray-700 shadow-lg">
                    <p className="text-[#F9DB6F] font-medium">
                      {payload[0].payload.name}: {payload[0].value}
                    </p>
                  </div>
                ) : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;
