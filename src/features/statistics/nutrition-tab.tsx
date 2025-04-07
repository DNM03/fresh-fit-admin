import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";
import { TrendItem } from "./trend-item";
import {
  calorieData,
  nutritionAdherenceData,
  topMealsData,
} from "./statistics-data";

interface NutritionTabProps {
  timeRange: string;
}

export function NutritionTab({ timeRange }: NutritionTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calorie Intake vs. Burned</CardTitle>
            <CardDescription>Daily calorie balance</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={calorieData}
              bars={[
                {
                  dataKey: "intake",
                  name: "Calories Consumed",
                  color: "#FF6B6B",
                },
                {
                  dataKey: "burned",
                  name: "Calories Burned",
                  color: "#4ECDC4",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition Plan Adherence</CardTitle>
            <CardDescription>Weekly nutrition plan adherence</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={nutritionAdherenceData}
              yAxisDomain={[0, 100]}
              lines={[
                {
                  dataKey: "adherence",
                  name: "Adherence %",
                  color: "#4ECDC4",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Meal Plans</CardTitle>
          <CardDescription>
            Most popular and highly rated meal plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMealsData.map((meal, i) => (
              <TrendItem
                key={i}
                icon={Utensils}
                name={meal.name}
                subtitle={`${meal.adherence}% adherence`}
                rating={meal.rating}
                growth={meal.growth}
                trend={meal.trend as "up" | "down"}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            View all meal plans
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Macronutrient Distribution</CardTitle>
          <CardDescription>Average macronutrient breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart
            data={[
              { name: "Protein", value: 30 },
              { name: "Carbs", value: 45 },
              { name: "Fat", value: 25 },
            ]}
            dataKey="value"
            nameKey="name"
          />
        </CardContent>
      </Card>
    </div>
  );
}
