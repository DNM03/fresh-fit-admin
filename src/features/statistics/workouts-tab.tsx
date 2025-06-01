import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, CalendarIcon } from "lucide-react";
import { BarChart } from "./bar-chart";
import { PieChart } from "./pie-chart";
import statisticService from "@/services/statistic.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface WorkoutsTabProps {
  timeRange: string;
}

interface SetLevel {
  _id: string;
  count: number;
}

interface ExerciseType {
  _id: string;
  count: number;
}

interface TopSet {
  totalCompletedSets: number;
  set_id: string;
  name: string;
  description: string;
  type: string;
  image: string;
  rating: number;
}

interface TopExercise {
  _id: string;
  name: string;
  description: string;
  rating: number;
  image: string;
  type: string;
}

interface WorkoutStats {
  set_level_statistic: SetLevel[];
  exercise_type_statistic: ExerciseType[];
  top_5_most_used_sets: TopSet[];
  top_5_highest_rating_exercises: TopExercise[];
}

interface WeeklyCompletionRate {
  totalWorkouts: number;
  completedWorkouts: number;
  dayOfWeek: number;
  completionRate: number;
  dayName: string;
}

export function WorkoutsTab({ timeRange }: WorkoutsTabProps) {
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyCompletionRate[]>([]);

  // State for weekly stats date picker
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<string>("05");
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 4, 15)); // Default to May 2025

  const exerciseTypeData =
    workoutStats?.exercise_type_statistic
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item._id,
        value: item.count,
      }))
      .sort((a, b) => b.value - a.value) || [];

  // Transform weekly completion data for the chart
  const weeklyCompletionChartData = weeklyStats.map((day) => ({
    name: day.dayName.substring(0, 3),
    completionRate: day.completionRate,
    total: day.totalWorkouts,
    completed: day.completedWorkouts,
  }));

  // Helper to get style based on workout level
  const getLevelBadgeStyle = (level: string): string => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-blue-100 text-blue-800";
      case "Advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get color based on exercise type
  const getExerciseTypeBadgeStyle = (type: string): string => {
    switch (type) {
      case "Strength":
        return "bg-red-100 text-red-800";
      case "Conditioning":
        return "bg-blue-100 text-blue-800";
      case "Plyometrics":
        return "bg-green-100 text-green-800";
      case "SMR":
        return "bg-yellow-100 text-yellow-800";
      case "Warmup":
        return "bg-orange-100 text-orange-800";
      case "Activation":
        return "bg-indigo-100 text-indigo-800";
      case "Powerlifting":
        return "bg-fuchsia-100 text-fuchsia-800";
      case "Olympic Lifting":
        return "bg-rose-100 text-rose-800";
      case "Stretching":
        return "bg-teal-100 text-teal-800";
      case "Strongman":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Handle month selection
  const handleDateSelection = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Determine which week of the month
    const day = date.getDate();
    let week = Math.ceil(day / 7);
    if (week > 4) week = 4; // Cap at 4 weeks per month

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedWeek(week);

    fetchWeeklyStats(year, month, week);
  };

  // Fetch weekly stats based on selected date
  const fetchWeeklyStats = async (
    year: number,
    month: string,
    week: number
  ) => {
    setWeeklyLoading(true);
    try {
      const response = await statisticService.getWorkoutWeeklyStats(
        year,
        month,
        week
      );
      if (response.data?.result) {
        setWeeklyStats(response.data.result);
      }
    } catch (err) {
      console.error("Error fetching weekly workout stats:", err);
      // We'll just show empty data rather than an error message
      setWeeklyStats([]);
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Fetch main workout statistics
  useEffect(() => {
    const fetchWorkoutStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await statisticService.getWorkoutStats();
        if (response.data?.result) {
          setWorkoutStats(response.data.result);
        }
      } catch (err) {
        console.error("Error fetching workout statistics:", err);
        setError("Failed to load workout statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutStats();
    fetchWeeklyStats(selectedYear, selectedMonth, selectedWeek);
  }, [timeRange]); // Refetch when time range changes

  if (loading) {
    return <WorkoutsTabSkeletonLoader />;
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
            <CardTitle>Exercise Type Distribution</CardTitle>
            <CardDescription>
              Distribution of different exercise types
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {exerciseTypeData.length > 0 ? (
              <div className="w-full">
                <PieChart
                  data={exerciseTypeData}
                  dataKey="value"
                  nameKey="name"
                />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {exerciseTypeData
                    .slice(0, 6) // Show just the top 6 to avoid overcrowding
                    .map((type) => (
                      <Badge
                        key={type.name}
                        className={getExerciseTypeBadgeStyle(type.name)}
                      >
                        {type.name}: {type.value}
                      </Badge>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No exercise type data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Workout Completion</CardTitle>
              <CardDescription>Weekly workout completion rates</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 pl-3 text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM yyyy")} - Week {selectedWeek}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-3 border-b">
                  <Label className="text-sm font-medium">
                    Select a date for workout data
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    The week containing this date will be used
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelection}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <Skeleton className="w-full h-[250px]" />
            ) : weeklyCompletionChartData.length > 0 ? (
              <BarChart
                data={weeklyCompletionChartData}
                height={250}
                bars={[
                  {
                    dataKey: "completionRate",
                    name: "Completion %",
                    color: "#FF6B6B",
                  },
                ]}
                yAxisDomain={[0, 100]}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px]">
                <p className="text-muted-foreground">
                  No workout data available for this week
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const now = new Date();
                    setSelectedYear(now.getFullYear());
                    setSelectedMonth(
                      (now.getMonth() + 1).toString().padStart(2, "0")
                    );
                    setSelectedWeek(Math.ceil(now.getDate() / 7));
                    setSelectedDate(now);
                    fetchWeeklyStats(
                      now.getFullYear(),
                      (now.getMonth() + 1).toString().padStart(2, "0"),
                      Math.ceil(now.getDate() / 7)
                    );
                  }}
                >
                  Try current week
                </Button>
              </div>
            )}

            {!weeklyLoading && weeklyCompletionChartData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="text-center p-2 rounded-md bg-blue-50">
                  <p className="text-sm font-medium text-blue-700">
                    Total Workouts
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {weeklyStats.reduce(
                      (sum, day) => sum + day.totalWorkouts,
                      0
                    )}
                  </p>
                </div>
                <div className="text-center p-2 rounded-md bg-green-50">
                  <p className="text-sm font-medium text-green-700">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {weeklyStats.reduce(
                      (sum, day) => sum + day.completedWorkouts,
                      0
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Workout Sets</CardTitle>
          <CardDescription>Most frequently used workout sets</CardDescription>
        </CardHeader>
        <CardContent>
          {workoutStats?.top_5_most_used_sets &&
          workoutStats.top_5_most_used_sets.length > 0 ? (
            <div className="space-y-4">
              {workoutStats.top_5_most_used_sets.map((set) => (
                <div
                  key={set.set_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {set.image && (
                    <div className="w-full sm:w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={set.image}
                        alt={set.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://res.cloudinary.com/dfo5tfret/image/upload/v1746290093/default-set-image.jpg";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4
                          className="font-medium line-clamp-1"
                          title={set.name}
                        >
                          {truncateText(set.name, 40)}
                        </h4>
                        <Badge className={getLevelBadgeStyle(set.type)}>
                          {set.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <span className="font-bold text-lg">
                            {set.totalCompletedSets}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            completions
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 text-yellow-500 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium">
                              {set.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {set.description && (
                      <p
                        className="text-sm text-muted-foreground mt-2 line-clamp-2"
                        title={set.description}
                      >
                        {set.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No workout sets data</h3>
              <p className="text-sm text-muted-foreground text-center">
                Workout sets data will appear here once available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Rated Exercises</CardTitle>
          <CardDescription>Exercises with highest user ratings</CardDescription>
        </CardHeader>
        <CardContent>
          {workoutStats?.top_5_highest_rating_exercises &&
          workoutStats.top_5_highest_rating_exercises.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {workoutStats.top_5_highest_rating_exercises.map((exercise) => (
                <Card key={exercise._id} className="overflow-hidden">
                  {exercise.image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://res.cloudinary.com/dfo5tfret/image/upload/v1746290093/default-set-image.jpg";
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        className={getExerciseTypeBadgeStyle(exercise.type)}
                      >
                        {exercise.type}
                      </Badge>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-yellow-500 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="ml-1 text-sm font-bold">
                          {exercise.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <h4
                      className="font-medium line-clamp-2 h-12"
                      title={exercise.name}
                    >
                      {exercise.name}
                    </h4>
                    {exercise.description && (
                      <p
                        className="text-sm text-muted-foreground mt-2 line-clamp-3"
                        title={exercise.description}
                      >
                        {exercise.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No exercise ratings data</h3>
              <p className="text-sm text-muted-foreground text-center">
                Exercise ratings data will appear here once available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkoutsTabSkeletonLoader() {
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
              <Skeleton className="h-[200px] w-[200px] mx-auto rounded-full" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
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
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 border rounded-lg mb-4"
            >
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
