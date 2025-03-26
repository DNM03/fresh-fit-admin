import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

export function ExerciseTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalParticipants = 750;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="font-medium">{data.planName}</p>
        <p className="text-xs">Participants: {data.chosenBy}</p>
        <p className="text-xs">Duration: {data.duration}</p>
        <p className="text-xs">Type: {data.type}</p>
        <p className="text-xs font-medium">
          Share: {((data.chosenBy / totalParticipants) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

export function MealTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-xs">Calories: {payload[0].value}</p>
        <p className="text-xs">Participants: {payload[1].value}</p>
        <p className="text-xs">Meal Type: {payload[0].payload.type}</p>
      </div>
    );
  }
  return null;
}
