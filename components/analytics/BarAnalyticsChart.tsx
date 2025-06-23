import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceDot,
} from "recharts";
import Loader from "../shared/loader";

interface ChartDataItem {
  month: string;
  value: number;
  actualValue: number;
  isHighlighted: boolean;
  hasData: boolean;
  count?: number;
}

interface ReusableBarChartProps {
  chartData: ChartDataItem[];
  isLoading: boolean;
  title: string;
  tooltipSuffix?: string; // "cards" or "%"
  height?: string;
  children?: React.ReactNode;
  isCard?: boolean; // For additional buttons/controls
}

const CustomTooltip = ({active, payload, label, tooltipSuffix = ""}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.hasData) {
      return (
        <div className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-0">
          <div>{`${label}: ${data.actualValue}${tooltipSuffix}`}</div>
        </div>
      );
    }
  }
  return null;
};

const ReusableBarChart: React.FC<ReusableBarChartProps> = ({
  chartData,
  isLoading,
  title,
  tooltipSuffix = "",
  height = "h-80",
  children,
  isCard,
}) => {
  return (
    <div
      className={`bg-[#191919] rounded-[30px] w-full justify-between ${
        isCard ? "lg:w-2/3 p-4 pt-8" : ""
      }`}
    >
      {/* SVG Pattern Definitions */}
      <svg width="0" height="0">
        <defs>
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="#2a2a2a" />
            <rect width="2" height="6" fill="#404040" />
          </pattern>
        </defs>
      </svg>

      <div className="flex justify-between mb-6">
        <h3 className="text-[24px] font-medium text-white">{title}</h3>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>

      <div
        className={`relative w-full ${height} transition-opacity duration-300 flex justify-between ${
          isLoading ? "opacity-100" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col justify-center items-center w-full h-full gap-4">
            <Loader size={40} />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 60,
                right: 30,
                left: 30,
                bottom: 30,
              }}
              barCategoryGap="15%"
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{fill: "#888", fontSize: 14, fontWeight: 400}}
                dy={10}
                tickFormatter={(label) => label.split(" ")[0]}
              />
              <Tooltip
                content={<CustomTooltip tooltipSuffix={tooltipSuffix} />}
                cursor={{fill: "transparent"}}
                position={{x: undefined, y: undefined}}
                allowEscapeViewBox={{x: false, y: true}}
                offset={-20}
                coordinate={{x: undefined, y: undefined}}
                isAnimationActive={false}
              />
              <Bar
                dataKey="value"
                radius={[12, 12, 12, 12]}
                stroke="none"
                style={{cursor: "pointer"}}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isHighlighted ? "#F9DB6F" : "url(#diagonalHatch)"
                    }
                    stroke="none"
                    style={{cursor: "pointer"}}
                  />
                ))}
              </Bar>

              {/* Add dots on top of bars */}
              {chartData.map((entry, index) => (
                <ReferenceDot
                  key={`dot-${index}`}
                  x={entry.month}
                  y={entry.value + 2}
                  r={4}
                  fill="#F9DB6F"
                  stroke="none"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        )}
      </div>

      <style jsx>{`
        .recharts-bar-rectangle {
          cursor: pointer !important;
        }
        .recharts-responsive-container {
          cursor: default;
        }
        .recharts-bar-rectangle:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
};

export default ReusableBarChart;
