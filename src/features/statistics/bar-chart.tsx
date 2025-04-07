import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: any[];
  height?: number;
  layout?: "horizontal" | "vertical";
  bars: {
    dataKey: string;
    name: string;
    color: string;
    yAxisId?: string;
  }[];
}

export function BarChart({
  data,
  height = 300,
  layout = "horizontal",
  bars,
}: BarChartProps) {
  return (
    <div style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: layout === "horizontal" ? 5 : 50,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={layout === "vertical"}
            horizontal={layout === "horizontal"}
          />
          {layout === "horizontal" ? (
            <>
              <XAxis dataKey="name" />
              <YAxis />
            </>
          ) : (
            <>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
            </>
          )}
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              yAxisId={bar.yAxisId}
              radius={layout === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
