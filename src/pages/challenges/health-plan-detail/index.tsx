import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Trash2,
  Edit,
  Calendar,
  Activity,
  Utensils,
  Flame,
  HeartPulse,
  Dumbbell,
  Clock,
  // CalendarRange,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import healthPlanService from "@/services/health-plan.service";
import setService from "@/services/set.service";
import mealService from "@/services/meal.service";
import UpdateHealthPlanForm from "@/features/challenges/update-health-plan-form";

interface WorkoutDetail {
  _id: string;
  set: string;
  status: string;
  orderNumber: number;
  set_details?: {
    name: string;
    total_calories: number;
  };
}

interface NutritionDetail {
  _id: string;
  meal: string;
  status: string;
  orderNumber: number;
  meal_details?: {
    name: string;
    calories: number;
  };
}

interface PlanDetail {
  _id: string;
  workout_details: WorkoutDetail[];
  nutrition_details: NutritionDetail[];
  name: string;
  day: number;
  week: number;
  estimated_calories_burned: number;
  estimated_calories_intake: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HealthPlan {
  _id: string;
  user_id: string | null;
  name: string;
  description: string;
  estimated_calories_burned: number;
  estimated_calories_intake: number;
  status: string;
  level: string;
  number_of_weeks: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  details: PlanDetail[];
}

function HealthPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState("week-1");

  const [setsDetails, setSetsDetails] = useState<Record<string, any>>({});
  const [mealsDetails, setMealsDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchHealthPlanData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await healthPlanService.getHealthPlanById(id);
        if (response.data?.health_plan) {
          setHealthPlan(response.data.health_plan);
        } else {
          setError("Health plan not found");
        }
      } catch (err) {
        console.error("Error fetching health plan:", err);
        setError("Failed to load health plan details");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthPlanData();
  }, [id, isUpdateDialogOpen]);

  useEffect(() => {
    const fetchDetailsForItems = async () => {
      if (!healthPlan || !healthPlan.details) return;

      const setIds = new Set<string>();
      const mealIds = new Set<string>();

      healthPlan.details.forEach((detail) => {
        detail.workout_details.forEach((workout) => setIds.add(workout.set));
        detail.nutrition_details.forEach((nutrition) =>
          mealIds.add(nutrition.meal)
        );
      });

      if (setIds.size === 0 && mealIds.size === 0) return;

      setLoadingDetails(true);

      try {
        if (setIds.size > 0) {
          const setsArray = Array.from(setIds);
          const setsResults: Record<string, any> = {};

          for (const setId of setsArray) {
            try {
              const response = await setService.getSetById(setId);
              if (response.data?.set) {
                setsResults[setId] = response.data.set;
              }
            } catch (error) {
              console.error(`Error fetching set ${setId}:`, error);
            }
          }

          setSetsDetails(setsResults);
        }

        if (mealIds.size > 0) {
          const mealsArray = Array.from(mealIds);
          const mealsResults: Record<string, any> = {};

          for (const mealId of mealsArray) {
            try {
              const response = await mealService.getMealById(mealId);
              if (response.data?.meal) {
                mealsResults[mealId] = response.data.meal;
              }
            } catch (error) {
              console.error(`Error fetching meal ${mealId}:`, error);
            }
          }

          setMealsDetails(mealsResults);
        }
      } catch (err) {
        console.error("Error fetching detailed items:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetailsForItems();
  }, [healthPlan]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await healthPlanService.deleteHealthPlan(id);
      toast.success("Health plan deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting health plan:", err);
      toast.error("Failed to delete health plan. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getLevelColor = (level: string) => {
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

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Done":
  //       return "bg-green-100 text-green-800";
  //     case "Undone":
  //       return "bg-amber-100 text-amber-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // Group days by week for easier UI rendering
  const daysByWeek =
    healthPlan?.details.reduce((acc, day) => {
      const weekKey = `week-${day.week}`;
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(day);
      return acc;
    }, {} as Record<string, PlanDetail[]>) || {};

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !healthPlan) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600">
                {error || "Failed to load health plan"}
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Health Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fix week tab ordering by correctly sorting the numeric week values
  const weekTabs = Object.keys(daysByWeek)
    .sort((a, b) => {
      const weekNumA = parseInt(a.replace("week-", ""));
      const weekNumB = parseInt(b.replace("week-", ""));
      return weekNumA - weekNumB;
    })
    .map((weekKey) => {
      const weekNumber = parseInt(weekKey.replace("week-", ""));
      return (
        <TabsTrigger key={weekKey} value={weekKey} className="px-4">
          Week {weekNumber}
        </TabsTrigger>
      );
    });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Health Plans
        </Button>
        <div className="flex space-x-2">
          {/* Edit Dialog */}
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Health Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Health Plan</DialogTitle>
                <DialogDescription>
                  Make changes to the health plan details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateHealthPlanForm
                  healthPlan={healthPlan}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    window.location.reload();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Health Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{healthPlan.name}"? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Health Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex space-x-2 mb-2">
                <Badge className={getLevelColor(healthPlan.level)}>
                  {healthPlan.level}
                </Badge>
                {/* <Badge className={getStatusColor(healthPlan.status)}>
                  {healthPlan.status}
                </Badge> */}
              </div>
              <CardTitle className="text-2xl font-bold">
                {healthPlan.name}
              </CardTitle>
              <CardDescription className="text-base">
                {healthPlan.description}
              </CardDescription>
            </div>
            <div className="flex items-center">
              {/* <Badge variant="outline" className="flex items-center gap-1">
                <CalendarRange className="h-3.5 w-3.5" />
                {formatDate(healthPlan.start_date)} -{" "}
                {formatDate(healthPlan.end_date)}
              </Badge> */}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Duration
              </div>
              <div className="text-lg font-medium">
                {healthPlan.number_of_weeks} weeks
              </div>
            </div>
            <div className="border rounded-md p-4 bg-amber-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Flame className="h-4 w-4 mr-1 text-amber-500" />
                  Calories Burned
                </div>
                <div className="text-lg font-medium">
                  {healthPlan.estimated_calories_burned.toFixed(2) || 0}
                </div>
              </div>
            </div>
            <div className="border rounded-md p-4 bg-green-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <HeartPulse className="h-4 w-4 mr-1 text-green-500" />
                  Calories Intake
                </div>
                <div className="text-lg font-medium">
                  {healthPlan.estimated_calories_intake.toFixed(2) || 0}
                </div>
              </div>
            </div>
          </div>

          {Object.keys(daysByWeek).length > 0 ? (
            <Tabs
              defaultValue={`week-1`}
              value={activeWeekTab}
              onValueChange={setActiveWeekTab}
              className="w-full"
            >
              <TabsList className="mb-4 overflow-x-auto flex w-full">
                {weekTabs}
              </TabsList>

              {Object.entries(daysByWeek).map(([weekKey, days]) => (
                <TabsContent
                  key={weekKey}
                  value={weekKey}
                  className="space-y-4"
                >
                  {days
                    .sort((a, b) => a.day - b.day)
                    .map((day) => (
                      <Card key={day._id} className="overflow-hidden">
                        <CardHeader className="py-3 bg-gray-50">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>{day.name}</span>
                            {/* <Badge className={getStatusColor(day.status)}>
                              {day.status}
                            </Badge> */}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {loadingDetails ? (
                            <div className="flex justify-center items-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Loading details...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Workout Section */}
                              <div>
                                <h3 className="text-base font-medium mb-3 flex items-center">
                                  <Activity className="mr-2 h-4 w-4 text-green-600" />
                                  Workouts
                                </h3>
                                {day.workout_details.length > 0 ? (
                                  <div className="space-y-2">
                                    {day.workout_details.map((workout) => {
                                      const setDetail =
                                        setsDetails[workout.set];
                                      return (
                                        <div
                                          key={workout._id}
                                          className="border rounded-md p-3 bg-gray-50"
                                          onClick={() =>
                                            navigate(
                                              `/manage-exercises/exercise-sets/${setDetail._id}`
                                            )
                                          }
                                        >
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <div className="font-medium">
                                                {setDetail?.name ||
                                                  "Loading..."}
                                              </div>
                                              <div className="text-sm text-gray-500 flex items-center">
                                                <Flame className="h-3 w-3 mr-1 text-amber-500" />
                                                {setDetail?.total_calories || 0}{" "}
                                                calories
                                              </div>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              #{workout.orderNumber + 1}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 border rounded-md text-gray-400">
                                    <Dumbbell className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                    <p>No workouts added</p>
                                  </div>
                                )}
                              </div>

                              {/* Nutrition Section */}
                              <div>
                                <h3 className="text-base font-medium mb-3 flex items-center">
                                  <Utensils className="mr-2 h-4 w-4 text-amber-600" />
                                  Meals
                                </h3>
                                {day.nutrition_details.length > 0 ? (
                                  <div className="space-y-2">
                                    {day.nutrition_details.map((nutrition) => {
                                      const mealDetail =
                                        mealsDetails[nutrition.meal];
                                      return (
                                        <div
                                          key={nutrition._id}
                                          className="border rounded-md p-3 bg-gray-50"
                                          onClick={() =>
                                            navigate(
                                              `/manage-meals/meals/${mealDetail._id}`
                                            )
                                          }
                                        >
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <div className="font-medium">
                                                {mealDetail?.name ||
                                                  "Loading..."}
                                              </div>
                                              <div className="text-sm text-gray-500 flex items-center">
                                                <HeartPulse className="h-3 w-3 mr-1 text-green-500" />
                                                {mealDetail?.calories || 0}{" "}
                                                calories
                                              </div>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              #{nutrition.orderNumber + 1}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 border rounded-md text-gray-400">
                                    <Utensils className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                    <p>No meals added</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Day Stats Summary */}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="border rounded-md p-3 bg-amber-50/50">
                              <div className="text-sm text-gray-600">
                                Calories Burned
                              </div>
                              <div className="text-lg font-medium flex items-center">
                                <Flame className="h-4 w-4 mr-1 text-amber-500" />
                                {day.estimated_calories_burned.toFixed(2) || 0}
                              </div>
                            </div>
                            <div className="border rounded-md p-3 bg-green-50/50">
                              <div className="text-sm text-gray-600">
                                Calories Intake
                              </div>
                              <div className="text-lg font-medium flex items-center">
                                <HeartPulse className="h-4 w-4 mr-1 text-green-500" />
                                {day.estimated_calories_intake.toFixed(2) || 0}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Days Available</h3>
              <p className="text-gray-500">
                This health plan doesn't have any days scheduled yet.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-gray-50 text-sm text-muted-foreground">
          <div className="w-full grid grid-cols-2 gap-2">
            <div>Created: {formatDate(healthPlan.created_at)}</div>
            {healthPlan.updated_at && (
              <div className="text-right">
                Last updated: {formatDate(healthPlan.updated_at)}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default HealthPlanDetail;
