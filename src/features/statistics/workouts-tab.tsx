import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";
import { TrendItem } from "./trend-item";
import {
  workoutTypeData,
  workoutCompletionData,
  topWorkoutsData,
} from "./statistics-data";

interface WorkoutsTabProps {
  timeRange: string;
}

export function WorkoutsTab({ timeRange }: WorkoutsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Type Distribution</CardTitle>
            <CardDescription>
              Popularity of different workout types
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart data={workoutTypeData} dataKey="value" nameKey="name" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Completion Trends</CardTitle>
            <CardDescription>Weekly workout completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={workoutCompletionData}
              yAxisDomain={[0, 100]}
              lines={[
                {
                  dataKey: "completed",
                  name: "Completion %",
                  color: "#FF6B6B",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Workouts</CardTitle>
          <CardDescription>
            Most popular and highly rated workouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWorkoutsData.map((workout, i) => (
              <TrendItem
                key={i}
                icon={Dumbbell}
                name={workout.name}
                subtitle={`${workout.completions.toLocaleString()} completions`}
                rating={workout.rating}
                growth={workout.growth}
                trend={workout.trend as "up" | "down"}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            View all workouts
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout Intensity Distribution</CardTitle>
          <CardDescription>
            Distribution of workout intensity levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { name: "Low", value: 25 },
              { name: "Medium", value: 45 },
              { name: "High", value: 30 },
            ]}
            bars={[
              {
                dataKey: "value",
                name: "Percentage",
                color: "#45B7D1",
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
