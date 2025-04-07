import {
  Legend,
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadialBarChartProps {
  data: any[];
  height?: number;
  dataKey: string;
  nameKey: string;
}

export function RadialBarChart({
  data,
  height = 300,
  dataKey,
  nameKey,
}: RadialBarChartProps) {
  return (
    <div style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="10%"
          outerRadius="80%"
          barSize={20}
          data={data}
        >
          <RadialBar
            label={{ position: "insideStart", fill: "#fff" }}
            background
            dataKey={dataKey}
            // nameKey={nameKey}
            startAngle={90}
            endAngle={-270}
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            wrapperStyle={{ right: 0, top: 0, bottom: 0 }}
          />
          <Tooltip />
        </RechartsRadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
