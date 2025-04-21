import {
  Cell,
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
}

export function PieChart({
  data,
  height = 300,
  width = 300,
  dataKey,
  nameKey,
  showLabels = true,
}: PieChartProps) {
  return (
    <div
      style={{
        height: height,
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
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
