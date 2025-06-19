import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { COLORS } from "./statistics-data";

interface PieChartProps {
  data: any[];
  height?: number;
  width?: number;
  dataKey: string;
  nameKey: string;
  showLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
}

export function PieChart({
  data,
  height = 300,
  width = 300,
  dataKey,
  nameKey,
  showLabels = true,
  showLegend = true,
  legendPosition = "bottom",
}: PieChartProps) {
  // Custom Legend formatter to display values with percentages
  const renderLegendContent = (props: any) => {
    const { payload } = props;

    // Calculate total for percentage
    const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

    return (
      <ul className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const percentValue = ((data[index][dataKey] / total) * 100).toFixed(
            1
          );

          return (
            <li
              key={`legend-item-${index}`}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.value} ({percentValue}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      style={{
        height: height + (showLegend && legendPosition === "bottom" ? 60 : 0),
        width: "100%",
        maxWidth: width,
        margin: "0 auto",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={
              showLabels
                ? ({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                : undefined
            }
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}`, ""]} />
          {showLegend && (
            <Legend
              content={renderLegendContent}
              verticalAlign={
                legendPosition === "top" || legendPosition === "bottom"
                  ? legendPosition
                  : "middle"
              }
              align={
                legendPosition === "left" || legendPosition === "right"
                  ? legendPosition
                  : "center"
              }
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
