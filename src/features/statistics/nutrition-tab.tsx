import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils } from "lucide-react";
import { BarChart } from "./bar-chart";
import { PieChart } from "./pie-chart";
import statisticService from "@/services/statistic.service";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { enrichItemsWithImages } from "@/lib/utils";

interface NutritionTabProps {
  timeRange: string;
}

interface DishByCalories {
  calories_range: string;
  count: number;
}

interface DishesCoverage {
  count: number;
  totalDishes: number;
  percentage: string;
}

interface TopRatedDish {
  _id: string;
  name: string;
  description: string;
  calories: number;
  rating: number;
  image: string;
  fat?: number;
  protein?: number;
  carbohydrate?: number;
}

interface TopUsedDish {
  totalMeals: number;
  dish_id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
}

interface NutritionStats {
  dishes_by_calories: DishByCalories[];
  dishes_with_all_nutrients: DishesCoverage;
  top_5_highest_rating_dishes: TopRatedDish[];
  top_5_most_used_dishes: TopUsedDish[];
}

const CustomDishesTooltip = ({
  active,
  payload,
}: // label,
TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded-md shadow-md">
        <p className="text-sm">
          <span className="font-medium">Calories Range:</span>{" "}
          {payload[0].payload.name}
        </p>
        <p className="text-sm">
          <span className="font-medium">Count:</span> {payload[0].value}
        </p>
        {/* <p className="text-sm">
          <span className="font-medium">Completed:</span>{" "}
          {payload[0].payload.completed} of {payload[0].payload.total}
        </p> */}
      </div>
    );
  }
  return <div className="hidden" />;
};

export function NutritionTab({ timeRange }: NutritionTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(
    null
  );

  // Format data for charts
  const calorieDistributionData =
    nutritionStats?.dishes_by_calories.map((item) => ({
      name: item.calories_range,
      count: item.count,
    })) || [];

  // Calculate average macros from top rated dishes
  const calculateAverageMacros = () => {
    if (!nutritionStats?.top_5_highest_rating_dishes.length) return null;

    const dishes = nutritionStats.top_5_highest_rating_dishes.filter(
      (dish) =>
        dish.fat !== undefined &&
        dish.protein !== undefined &&
        dish.carbohydrate !== undefined
    );

    if (dishes.length === 0) return null;

    const totalFat = dishes.reduce((sum, dish) => sum + (dish.fat || 0), 0);
    const totalProtein = dishes.reduce(
      (sum, dish) => sum + (dish.protein || 0),
      0
    );
    const totalCarbs = dishes.reduce(
      (sum, dish) => sum + (dish.carbohydrate || 0),
      0
    );
    const total = totalFat + totalProtein + totalCarbs;

    if (total === 0) return null;

    return [
      { name: "Protein", value: Math.round((totalProtein / total) * 100) },
      { name: "Carbs", value: Math.round((totalCarbs / total) * 100) },
      { name: "Fat", value: Math.round((totalFat / total) * 100) },
    ];
  };

  const macroData = calculateAverageMacros() || [
    { name: "Protein", value: 30 },
    { name: "Carbs", value: 45 },
    { name: "Fat", value: 25 },
  ];

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    return text?.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text || "";
  };

  useEffect(() => {
    const fetchNutritionStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await statisticService.getNutritionStats();
        if (response.data?.result) {
          const enriched = await enrichItemsWithImages<any>(
            response.data.result.top_5_highest_rating_dishes,
            (item) => item.name
          );
          const topUsedEnriched = await enrichItemsWithImages<any>(
            response.data.result.top_5_most_used_dishes,
            (item) => item.name
          );
          response.data.result.top_5_highest_rating_dishes = enriched;
          response.data.result.top_5_most_used_dishes = topUsedEnriched;
          setNutritionStats(response.data.result);
        }
      } catch (err) {
        console.error("Error fetching nutrition statistics:", err);
        setError("Failed to load nutrition statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionStats();
  }, [timeRange]);

  if (loading) {
    return <NutritionSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-100 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dishes by Calorie Range</CardTitle>
            <CardDescription>
              Distribution of dishes by calorie content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calorieDistributionData.length > 0 ? (
              <BarChart
                data={calorieDistributionData}
                height={300}
                bars={[
                  {
                    dataKey: "count",
                    name: "Number of Dishes",
                    color: "#FF6B6B",
                  },
                ]}
                customTooltip={CustomDishesTooltip}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No calorie distribution data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Macronutrient Distribution</CardTitle>
            <CardDescription>
              Average macronutrient breakdown from top rated dishes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart
              data={macroData}
              dataKey="value"
              nameKey="name"
              width={600}
              showLabels={false}
            />
          </CardContent>
          <CardFooter className="pt-0 border-t px-6 py-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              {nutritionStats?.dishes_with_all_nutrients ? (
                <p>
                  {nutritionStats.dishes_with_all_nutrients.count} of{" "}
                  {nutritionStats.dishes_with_all_nutrients.totalDishes} dishes
                  ({nutritionStats.dishes_with_all_nutrients.percentage}%) have
                  complete nutritional information
                </p>
              ) : (
                <p>No nutritional coverage data available</p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Used Dishes</CardTitle>
          <CardDescription>
            Most frequently selected dishes in meal plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nutritionStats?.top_5_most_used_dishes &&
          nutritionStats.top_5_most_used_dishes.length > 0 ? (
            <div className="space-y-4">
              {nutritionStats.top_5_most_used_dishes.map((dish) => (
                <div
                  key={dish.dish_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/100x100/png?text=Dish";
                          }}
                        />
                      ) : (
                        <Utensils className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium line-clamp-1"
                        title={dish.name}
                      >
                        {truncateText(dish.name, 40)}
                      </h4>
                      <p
                        className="text-sm text-muted-foreground line-clamp-1"
                        title={dish.description}
                      >
                        {truncateText(dish.description, 60)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-lg">
                        {dish.totalMeals}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        uses
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-500 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="ml-1 text-sm font-medium">
                        {dish.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Utensils className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No dish usage data</h3>
              <p className="text-sm text-muted-foreground">
                Dish usage data will appear here once available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Rated Dishes</CardTitle>
          <CardDescription>Dishes with highest user ratings</CardDescription>
        </CardHeader>
        <CardContent>
          {nutritionStats?.top_5_highest_rating_dishes &&
          nutritionStats.top_5_highest_rating_dishes.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {nutritionStats.top_5_highest_rating_dishes.map((dish) => (
                <Card key={dish._id} className="overflow-hidden">
                  <div className="w-full h-36 bg-muted flex items-center justify-center">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/300x200/png?text=Dish";
                        }}
                      />
                    ) : (
                      <Utensils className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                        {dish.calories} cal
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-yellow-500 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="ml-1 text-sm font-bold">
                          {dish.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <h4
                      className="font-medium line-clamp-2 h-12"
                      title={dish.name}
                    >
                      {dish.name}
                    </h4>
                    {dish.description && (
                      <p
                        className="text-sm text-muted-foreground mt-2 line-clamp-3"
                        title={dish.description}
                      >
                        {truncateText(dish.description, 120)}
                      </p>
                    )}
                    {dish.fat !== undefined &&
                      dish.protein !== undefined &&
                      dish.carbohydrate !== undefined && (
                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                          <div className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-center">
                            Fat: {dish.fat}g
                          </div>
                          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-center">
                            Carbs: {dish.carbohydrate}g
                          </div>
                          <div className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-center">
                            Protein: {dish.protein}g
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Utensils className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No dish ratings data</h3>
              <p className="text-sm text-muted-foreground text-center">
                Dish ratings data will appear here once available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NutritionSkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg mb-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-6 w-full" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
