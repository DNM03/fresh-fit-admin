import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Trash2,
  Edit,
  Clock,
  Utensils,
  Pizza,
  Calendar,
} from "lucide-react";
import mealService from "@/services/meal.service";
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
import UpdateMealForm from "@/features/meal/update-meal-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DishType } from "@/constants/types";

interface MealType {
  _id: string;
  name: string;
  description: string;
  calories: number;
  pre_time: number; // in seconds
  meal_type: "Breakfast" | "Lunch" | "Dinner";
  date: string;
  dishes: DishType[];
  created_at?: string;
  updated_at?: string;
}

function MealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMeal = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await mealService.getMealById(id);
        console.log("Meal response:", response);
        if (response.data?.meal) {
          setMeal(response.data.meal);
        } else {
          setError("Meal not found");
        }
      } catch (err) {
        console.error("Error fetching meal:", err);
        setError("Failed to load meal details");
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await mealService.deleteMealPlan(id);
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "Breakfast":
        return "bg-yellow-100 text-yellow-800";
      case "Lunch":
        return "bg-green-100 text-green-800";
      case "Dinner":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total nutritional values from all dishes
  const calculateTotalNutrition = () => {
    if (!meal || !meal.dishes.length) return null;

    return meal.dishes.reduce(
      (totals, dish) => {
        totals.fat += dish.fat || 0;
        totals.carbs += dish.carbohydrate || 0;
        totals.protein += dish.protein || 0;
        totals.calories += dish.calories || 0;
        totals.fiber += dish.fiber || 0;
        totals.sugar += dish.sugar || 0;
        totals.sodium += dish.sodium || 0;
        totals.cholesterol += dish.cholesterol || 0;
        return totals;
      },
      {
        fat: 0,
        carbs: 0,
        protein: 0,
        calories: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
      }
    );
  };

  const totalNutrition = calculateTotalNutrition();

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
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
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600">{error || "Failed to load meal"}</p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Meals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Meals
        </Button>
        <div className="flex space-x-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Meal</DialogTitle>
                <DialogDescription>
                  Make changes to the meal details and dishes
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateMealForm
                  meal={meal}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    // Refresh the meal data
                    window.location.reload();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{meal.name}"? This action
                  cannot be undone.
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
                  {isDeleting ? "Deleting..." : "Delete Meal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">{meal.name}</CardTitle>
              <div className="flex items-center flex-wrap mt-2 gap-2">
                <Badge className={getMealTypeColor(meal.meal_type)}>
                  {meal.meal_type}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(new Date(meal.date), "PPP")}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{Math.floor(meal.pre_time / 60)} min prep time</span>
                </div>
              </div>
            </div>
            <div className="mt-3 md:mt-0 bg-amber-50 px-4 py-2 rounded-lg text-center">
              <p className="text-xs text-amber-600 font-medium">
                Total Calories
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {totalNutrition?.calories.toFixed(0)}
              </p>
            </div>
          </div>
          {meal.description && (
            <CardDescription className="mt-2">
              {meal.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dishes" className="w-full">
            <TabsList>
              <TabsTrigger value="dishes">Dishes</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            <TabsContent value="dishes" className="space-y-4 pt-4">
              <h3 className="font-semibold text-lg mb-4">
                Dishes in this meal:
              </h3>

              {meal.dishes.length > 0 ? (
                <div className="space-y-4">
                  {meal.dishes.map((dish) => (
                    <Card key={dish._id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {dish.image && (
                          <div className="w-full md:w-1/3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        )}
                        <div
                          className={`p-4 flex-1 ${
                            !dish.image ? "w-full" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg">{dish.name}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {Math.floor(dish.prep_time / 60)} min
                                </span>
                                <span className="mx-2">•</span>
                                <Pizza className="h-3 w-3 mr-1" />
                                <span>{dish.calories} cal</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/meals/dish-detail/${dish._id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>

                          {dish.description && (
                            <p className="mt-3 text-muted-foreground line-clamp-2">
                              {dish.description}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-4 gap-2">
                            <div className="text-center p-2 bg-blue-50 rounded-md">
                              <p className="text-xs text-blue-600">Protein</p>
                              <p className="font-semibold text-blue-700">
                                {dish.protein}g
                              </p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-md">
                              <p className="text-xs text-green-600">Carbs</p>
                              <p className="font-semibold text-green-700">
                                {dish.carbohydrate}g
                              </p>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded-md">
                              <p className="text-xs text-red-600">Fat</p>
                              <p className="font-semibold text-red-700">
                                {dish.fat}g
                              </p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-md">
                              <p className="text-xs text-purple-600">Fiber</p>
                              <p className="font-semibold text-purple-700">
                                {dish.fiber}g
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No dishes
                  </h3>
                  <p className="mt-1 text-gray-500">
                    This meal doesn't have any dishes yet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsUpdateDialogOpen(true)}
                  >
                    Add Dishes
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    Nutritional Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-amber-600">Total Calories</p>
                      <p className="text-3xl font-bold text-amber-700">
                        {totalNutrition?.calories.toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-blue-600">Prep Time</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {Math.floor(meal.pre_time / 60)}{" "}
                        <span className="text-lg">min</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-24">Protein</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((totalNutrition?.protein || 0) /
                                ((totalNutrition?.protein || 0) +
                                  (totalNutrition?.carbs || 0) +
                                  (totalNutrition?.fat || 0))) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        {totalNutrition?.protein.toFixed(1)}g
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-24">Carbs</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((totalNutrition?.carbs || 0) /
                                ((totalNutrition?.protein || 0) +
                                  (totalNutrition?.carbs || 0) +
                                  (totalNutrition?.fat || 0))) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        {totalNutrition?.carbs.toFixed(1)}g
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-24">Fat</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((totalNutrition?.fat || 0) /
                                ((totalNutrition?.protein || 0) +
                                  (totalNutrition?.carbs || 0) +
                                  (totalNutrition?.fat || 0))) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        {totalNutrition?.fat.toFixed(1)}g
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-24">Fiber</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((totalNutrition?.fiber || 0) / 30) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        {totalNutrition?.fiber.toFixed(1)}g
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-24">Sugar</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((totalNutrition?.sugar || 0) / 50) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        {totalNutrition?.sugar.toFixed(1)}g
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    Detailed Nutrition Facts
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Total Calories</span>
                      <span>{totalNutrition?.calories.toFixed(0)}</span>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Fat</span>
                        <span>{totalNutrition?.fat.toFixed(1)}g</span>
                      </div>
                      <div className="border-b pb-2 mb-2" />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Cholesterol</span>
                        <span>{totalNutrition?.cholesterol.toFixed(1)}mg</span>
                      </div>
                      <div className="border-b pb-2 mb-2" />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Sodium</span>
                        <span>{totalNutrition?.sodium.toFixed(1)}mg</span>
                      </div>
                      <div className="border-b pb-2 mb-2" />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          Total Carbohydrates
                        </span>
                        <span>{totalNutrition?.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="pl-4">
                        <div className="flex justify-between text-sm">
                          <span>Dietary Fiber</span>
                          <span>{totalNutrition?.fiber.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sugars</span>
                          <span>{totalNutrition?.sugar.toFixed(1)}g</span>
                        </div>
                      </div>
                      <div className="border-b pb-2 mb-2" />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Protein</span>
                        <span>{totalNutrition?.protein.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-muted-foreground">
                    * Percent Daily Values are based on a 2,000 calorie diet.
                    Your daily values may be higher or lower depending on your
                    calorie needs.
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {(meal.created_at || meal.updated_at) && (
          <CardFooter className="border-t p-4 text-sm text-muted-foreground">
            <div className="w-full flex justify-between">
              {meal.created_at && (
                <span>
                  Created: {new Date(meal.created_at).toLocaleDateString()}
                </span>
              )}
              {meal.updated_at && (
                <span>
                  Last updated: {new Date(meal.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default MealDetail;
