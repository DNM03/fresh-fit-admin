import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface BarChartProps {
  data: any[];
  height?: number;
  layout?: "horizontal" | "vertical";
  yAxisDomain?: [number, number];
  bars: {
    dataKey: string;
    name: string;
    color: string;
    yAxisId?: string;
  }[];
  customTooltip?: (
    props: TooltipProps<ValueType, NameType>
  ) => React.JSX.Element;
}

export function BarChart({
  data,
  height = 300,
  layout = "horizontal",
  yAxisDomain,
  bars,
  customTooltip,
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
              <YAxis domain={yAxisDomain} />
            </>
          ) : (
            <>
              <XAxis type="number" domain={yAxisDomain} />
              <YAxis dataKey="name" type="category" width={100} />
            </>
          )}
          <Tooltip content={customTooltip} />
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
