import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
// Remove DatePicker import since we won't use it anymore
// import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SetSelector from "./set-selector";
import MealSelector from "./meal-selector";
import healthPlanService from "@/services/health-plan.service";
import { toast } from "sonner";
import setService from "@/services/set.service";
import mealService from "@/services/meal.service";

interface UpdateHealthPlanFormProps {
  healthPlan: any;
  onSuccess: () => void;
}

interface HealthPlanFormData {
  name: string;
  description: string;
  estimated_calories_burned: number;
  estimated_calories_intake: number;
  status: "Done" | "Undone";
  level: "Beginner" | "Intermediate" | "Advanced";
  number_of_weeks: number;
}

interface DayPlanData {
  id?: string;
  _id?: string;
  name: string;
  day: number;
  week: number;
  workout_details: Array<{
    set: string;
    set_name?: string;
    total_calories?: number;
  }>;
  nutrition_details: Array<{
    meal: string;
    meal_name?: string;
    calories?: number;
  }>;
  estimated_calories_burned: number;
  estimated_calories_intake: number;
  status?: string;
}

function UpdateHealthPlanForm({
  healthPlan,
  onSuccess,
}: UpdateHealthPlanFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // We'll still track start and end dates internally, but not show them in the UI
  const [startDate] = useState<Date>(
    healthPlan?.start_date ? new Date(healthPlan.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    healthPlan?.end_date ? new Date(healthPlan.end_date) : new Date()
  );

  const [dayPlans, setDayPlans] = useState<DayPlanData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingGeneralInfo, setIsSavingGeneralInfo] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState("week-1");
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isDeletingDay, setIsDeletingDay] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [isAddNewDayOpen, setIsAddNewDayOpen] = useState(false);

  // New day form state
  const [newDay, setNewDay] = useState({
    name: "",
    day: 1,
    week: 1,
    workout_details: [] as { set: string }[],
    nutrition_details: [] as { meal: string }[],
  });

  // For adding sets/meals to new day
  const [selectedSets, setSelectedSets] = useState<any[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<any[]>([]);

  // Calculate weeks from start and end date
  const calculateInitialWeeks = () => {
    if (healthPlan?.number_of_weeks) {
      return healthPlan.number_of_weeks;
    } else if (startDate && endDate) {
      return calculateWeeksBetween(startDate, endDate);
    }
    return 1;
  };

  const defaultValues: HealthPlanFormData = {
    name: healthPlan?.name || "",
    description: healthPlan?.description || "",
    estimated_calories_burned: healthPlan?.estimated_calories_burned || 0,
    estimated_calories_intake: healthPlan?.estimated_calories_intake || 0,
    status: healthPlan?.status || "Undone",
    level: healthPlan?.level || "Beginner",
    number_of_weeks: calculateInitialWeeks(),
  };

  const form = useForm<HealthPlanFormData>({
    defaultValues,
  });

  // Function to update end date based on weeks
  const updateDatesFromWeeks = (weeks: number) => {
    // For update, we keep the original start date
    const newStartDate = startDate;
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + weeks * 7);

    setEndDate(newEndDate);
    // We also update the form value
    form.setValue("number_of_weeks", weeks);
  };

  // Handle weeks change
  const handleWeeksChange = (weeks: number) => {
    if (weeks >= 1 && weeks <= 52) {
      updateDatesFromWeeks(weeks);
    }
  };

  // Load health plan days from API
  useEffect(() => {
    const loadDayPlanDetails = async () => {
      if (healthPlan?.details && healthPlan.details.length > 0) {
        setIsLoading(true);
        try {
          // Create a temporary array to hold all the processed day plans
          const processedDayPlans = [];

          // Process each day plan sequentially
          for (const detail of healthPlan.details) {
            // Process workout details - fetch set information
            const workoutDetailsPromises = detail.workout_details.map(
              async (workout: any, index: number) => {
                try {
                  // Fetch set details from API
                  const setDetails = await setService.getSetById(workout.set);
                  return {
                    _id: workout._id,
                    set: workout.set,
                    set_name: setDetails.data.set.name,
                    total_calories: setDetails.data.set.total_calories,
                    orderNumber: workout.orderNumber || index,
                  };
                } catch (error) {
                  console.error(
                    `Failed to fetch set details for ${workout.set}:`,
                    error
                  );
                  return {
                    _id: workout._id,
                    set: workout.set,
                    set_name: "Unknown Set",
                    total_calories: 0,
                    orderNumber: workout.orderNumber || index,
                  };
                }
              }
            );

            // Process nutrition details - fetch meal information
            const nutritionDetailsPromises = detail.nutrition_details.map(
              async (nutrition: any, index: number) => {
                try {
                  // Fetch meal details from API
                  const mealDetails = await mealService.getMealById(
                    nutrition.meal
                  );
                  return {
                    _id: nutrition._id,
                    meal: nutrition.meal,
                    meal_name: mealDetails.data.meal.name,
                    calories: mealDetails.data.meal.calories,
                    orderNumber: nutrition.orderNumber || index,
                  };
                } catch (error) {
                  console.error(
                    `Failed to fetch meal details for ${nutrition.meal}:`,
                    error
                  );
                  return {
                    _id: nutrition._id,
                    meal: nutrition.meal,
                    meal_name: "Unknown Meal",
                    calories: 0,
                    orderNumber: nutrition.orderNumber || index,
                  };
                }
              }
            );

            // Wait for all detail fetching to complete
            const workoutDetails = await Promise.all(workoutDetailsPromises);
            const nutritionDetails = await Promise.all(
              nutritionDetailsPromises
            );

            // Calculate totals based on fetched data
            const totalCaloriesBurned = workoutDetails.reduce(
              (total, item) => total + (item.total_calories || 0),
              0
            );
            const totalCaloriesIntake = nutritionDetails.reduce(
              (total, item) => total + (item.calories || 0),
              0
            );

            // Create the day plan with complete details
            const dayPlan = {
              id: `week-${detail.week}-day-${detail.day}`,
              _id: detail._id,
              name: detail.name || `Day ${detail.day} Week ${detail.week}`,
              day: detail.day,
              week: detail.week,
              workout_details: workoutDetails,
              nutrition_details: nutritionDetails,
              estimated_calories_burned:
                totalCaloriesBurned || detail.estimated_calories_burned || 0,
              estimated_calories_intake:
                totalCaloriesIntake || detail.estimated_calories_intake || 0,
              status: detail.status || "Undone",
            };

            processedDayPlans.push(dayPlan);
          }

          setDayPlans(processedDayPlans);
        } catch (error) {
          console.error("Error loading day plan details:", error);
          toast.error("Failed to load health plan details", {
            style: {
              background: "#cc3131",
              color: "#fff",
            },
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDayPlanDetails();
  }, [healthPlan]);

  const calculateWeeksBetween = (startDate: Date, endDate: Date) => {
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / millisecondsPerWeek);
    return diffWeeks;
  };

  const saveGeneralInfo = async (data: HealthPlanFormData) => {
    if (!healthPlan?._id) return;

    setIsSavingGeneralInfo(true);
    try {
      // Calculate end date based on weeks
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + data.number_of_weeks * 7);
      setEndDate(newEndDate);

      // Only send fields that can be updated in general info
      const updateData = {
        name: data.name,
        description: data.description,
        // estimated_calories_burned: data.estimated_calories_burned,
        // estimated_calories_intake: data.estimated_calories_intake,
        status: data.status,
        level: data.level,
        start_date: startDate.toISOString(),
        end_date: newEndDate.toISOString(),
        number_of_weeks: data.number_of_weeks,
      };

      await healthPlanService.updateHealthPlan(healthPlan._id, updateData);
      toast.success("Health plan general information updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setCurrentStep(2); // Move to the next step after saving
    } catch (error) {
      console.error("Error updating health plan:", error);
      toast.error("Failed to update health plan. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSavingGeneralInfo(false);
    }
  };

  const addNewDay = async () => {
    if (!healthPlan?._id) return;

    // Validate day and week values before proceeding
    const maxWeeks = form.getValues().number_of_weeks || 12;
    if (
      newDay.day < 1 ||
      newDay.day > 7 ||
      newDay.week < 1 ||
      newDay.week > maxWeeks
    ) {
      toast.error(
        "Invalid day or week value. Days must be 1-7 and weeks must not exceed plan length.",
        {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        }
      );
      return;
    }

    // Check if a day with the same day and week already exists
    const dayExists = dayPlans.some(
      (day) => day.day === newDay.day && day.week === newDay.week
    );
    if (dayExists) {
      toast.error(
        `Day ${newDay.day} Week ${newDay.week} already exists in the plan.`,
        {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        }
      );
      return;
    }

    setIsAddingDay(true);
    try {
      // Format workout details for API
      const workoutDetails = selectedSets.map((set) => ({
        set: set._id,
      }));

      // Format nutrition details for API
      const nutritionDetails = selectedMeals.map((meal) => ({
        meal: meal._id,
      }));

      // Calculate estimated calories
      const estimatedCaloriesBurned = selectedSets.reduce(
        (total, set) => total + (set.total_calories || 0),
        0
      );
      const estimatedCaloriesIntake = selectedMeals.reduce(
        (total, meal) => total + (meal.calories || 0),
        0
      );

      const newDayData = {
        name: newDay.name || `Day ${newDay.day} Week ${newDay.week}`,
        day: newDay.day,
        week: newDay.week,
        workout_details: workoutDetails,
        nutrition_details: nutritionDetails,
        estimated_calories_burned: estimatedCaloriesBurned,
        estimated_calories_intake: estimatedCaloriesIntake,
      };
      console.log("Adding new day with data:", newDayData);

      // Call API to add new day
      const response = await healthPlanService.addNewHealthPlanDetails(
        healthPlan._id,
        newDayData
      );

      const finalCaloriesBurned = dayPlans.reduce(
        (sum, day) => sum + (day.estimated_calories_burned || 0),
        0
      );

      const finalCaloriesIntake = dayPlans.reduce(
        (sum, day) => sum + (day.estimated_calories_intake || 0),
        0
      );

      console.log(
        "Final calories burned:",
        finalCaloriesBurned + estimatedCaloriesBurned
      );
      console.log(
        "Final calories intake:",
        finalCaloriesIntake + estimatedCaloriesIntake
      );

      await healthPlanService.updateHealthPlan(healthPlan._id, {
        estimated_calories_burned:
          finalCaloriesBurned + estimatedCaloriesBurned,
        estimated_calories_intake:
          finalCaloriesIntake + estimatedCaloriesIntake,
      });

      if (response.data?.health_plan_detail) {
        // Add the new day to the state
        const addedDay = response.data.health_plan_detail;

        const formattedDay = {
          _id: addedDay._id,
          id: `week-${addedDay.week}-day-${addedDay.day}`,
          name: `Day ${addedDay.day} Week ${addedDay.week}`,
          day: addedDay.day,
          week: addedDay.week,
          workout_details: workoutDetails.map((workout, i) => ({
            set: workout.set,
            set_name: selectedSets[i].name,
            total_calories: selectedSets[i].total_calories,
          })),
          nutrition_details: nutritionDetails.map((nutrition, i) => ({
            meal: nutrition.meal,
            meal_name: selectedMeals[i].name,
            calories: selectedMeals[i].calories,
          })),
          estimated_calories_burned: estimatedCaloriesBurned,
          estimated_calories_intake: estimatedCaloriesIntake,
          status: "Undone",
        };

        setDayPlans((prev) => [...prev, formattedDay]);
        toast.success(
          `Day ${newDay.day} Week ${newDay.week} added successfully!`,
          {
            style: {
              background: "#3ac76b",
              color: "#fff",
            },
          }
        );

        // Reset form for next addition
        setNewDay({
          name: "",
          day: 1,
          week: 1,
          workout_details: [],
          nutrition_details: [],
        });
        setSelectedSets([]);
        setSelectedMeals([]);
        setIsAddingDay(false);
        setDayPlans((prev) =>
          prev.map((day) => {
            if (day._id === addedDay._id) {
              return {
                ...day,
                name: formattedDay.name,
                workout_details: formattedDay.workout_details,
                nutrition_details: formattedDay.nutrition_details,
                estimated_calories_burned:
                  formattedDay.estimated_calories_burned,
                estimated_calories_intake:
                  formattedDay.estimated_calories_intake,
              };
            }
            return day;
          })
        );
        setIsAddNewDayOpen(false);
      }
    } catch (error) {
      console.error("Error adding new day:", error);
      toast.error("Failed to add new day. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsAddingDay(false);
    }
  };

  const deleteDay = async (dayId: string) => {
    if (!healthPlan?._id) return;

    const dayToDelete = dayPlans.find((day) => day._id === dayId);
    if (!dayToDelete?._id) return;

    setIsDeletingDay(true);
    setSelectedDayId(dayId);

    try {
      // Call API to delete the day
      await healthPlanService.deleteHealthPlanDetails(
        healthPlan._id,
        dayToDelete._id
      );

      const finalCaloriesBurned = dayPlans.reduce(
        (sum, day) => sum + (day.estimated_calories_burned || 0),
        0
      );

      const finalCaloriesIntake = dayPlans.reduce(
        (sum, day) => sum + (day.estimated_calories_intake || 0),
        0
      );

      console.log(
        "Final calories burned:",
        finalCaloriesBurned - dayToDelete.estimated_calories_burned
      );
      console.log(
        "Final calories intake:",
        finalCaloriesIntake - dayToDelete.estimated_calories_intake
      );

      await healthPlanService.updateHealthPlan(healthPlan._id, {
        estimated_calories_burned:
          finalCaloriesBurned - dayToDelete.estimated_calories_burned,
        estimated_calories_intake:
          finalCaloriesIntake - dayToDelete.estimated_calories_intake,
      });

      // Remove the day from state
      setDayPlans((prev) => prev.filter((day) => day._id !== dayId));
      toast.success(
        `Day ${dayToDelete.day} Week ${dayToDelete.week} deleted successfully!`,
        {
          style: {
            background: "#3ac76b",
            color: "#fff",
          },
        }
      );
    } catch (error) {
      console.error("Error deleting day:", error);
      toast.error("Failed to delete day. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsDeletingDay(false);
      setSelectedDayId(null);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Group days by week for easier UI rendering
  const daysByWeek = dayPlans.reduce((acc, day) => {
    const weekKey = `week-${day.week}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(day);
    return acc;
  }, {} as Record<string, DayPlanData[]>);

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

  // Handle adding a set to the new day form
  const handleAddSetToNewDay = (set: any) => {
    if (selectedSets.some((s) => s._id === set._id)) return;
    setSelectedSets((prev) => [...prev, set]);
  };

  // Handle removing a set from the new day form
  const handleRemoveSetFromNewDay = (setId: string) => {
    setSelectedSets((prev) => prev.filter((set) => set._id !== setId));
  };

  // Handle adding a meal to the new day form
  const handleAddMealToNewDay = (meal: any) => {
    if (selectedMeals.some((m) => m._id === meal._id)) return;
    setSelectedMeals((prev) => [...prev, meal]);
  };

  // Handle removing a meal from the new day form
  const handleRemoveMealFromNewDay = (mealId: string) => {
    setSelectedMeals((prev) => prev.filter((meal) => meal._id !== mealId));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                General Information
              </h2>
              <p className="text-sm text-primary">
                Update the basic details for this health plan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputWithLabel
                fieldTitle="Plan Name"
                nameInSchema="name"
                placeholder="E.g., 12-Week Weight Loss Program"
                className="w-full"
                required
              />

              <SelectWithLabel
                fieldTitle="Level"
                nameInSchema="level"
                data={[
                  { id: "Beginner", description: "Beginner" },
                  { id: "Intermediate", description: "Intermediate" },
                  { id: "Advanced", description: "Advanced" },
                ]}
                className="w-full"
              />
            </div>

            <TextAreaWithLabel
              fieldTitle="Description"
              nameInSchema="description"
              placeholder="Describe the health plan and its goals..."
              className="h-24 w-full"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Replace date pickers with number of weeks input */}
              <div className="space-y-2">
                <InputWithLabel
                  fieldTitle="Number of Weeks"
                  nameInSchema="number_of_weeks"
                  type="number"
                  min={1}
                  max={52}
                  onChange={(e) =>
                    handleWeeksChange(parseInt(e.target.value) || 1)
                  }
                  placeholder="E.g., 12"
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Plan will start from original start date and end after the
                  specified number of weeks
                </p>
              </div>

              {/* <div className="space-y-2">
                <SelectWithLabel
                  fieldTitle="Status"
                  nameInSchema="status"
                  data={[
                    { id: "Done", description: "Done" },
                    { id: "Undone", description: "Undone" },
                  ]}
                  className="w-full"
                />
              </div> */}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-primary mb-2">
                  Day-by-Day Planning
                </h2>
                <p className="text-sm text-primary">
                  Add or delete days from this health plan.
                </p>
              </div>

              <Dialog open={isAddNewDayOpen} onOpenChange={setIsAddNewDayOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Day to Health Plan</DialogTitle>
                    <DialogDescription>
                      Create a new day with workouts and meals
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* <div>
                        <label className="block text-sm font-medium mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Day name"
                          className="w-full border rounded-md p-2"
                          value={newDay.name}
                          onChange={(e) =>
                            setNewDay({ ...newDay, name: e.target.value })
                          }
                        />
                      </div> */}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Day
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={7}
                            className="w-full border rounded-md p-2"
                            value={newDay.day}
                            onChange={(e) => {
                              // Restrict day values to be between 1 and 7
                              const dayValue = parseInt(e.target.value) || 1;
                              const validDayValue = Math.min(
                                Math.max(dayValue, 1),
                                7
                              );
                              setNewDay({
                                ...newDay,
                                day: validDayValue,
                              });
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Days must be between 1-7
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Week
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={form.getValues().number_of_weeks || 12}
                            className="w-full border rounded-md p-2"
                            value={newDay.week}
                            onChange={(e) => {
                              // Restrict week values to be between 1 and the number of weeks
                              const weekValue = parseInt(e.target.value) || 1;
                              const maxWeeks =
                                form.getValues().number_of_weeks || 12;
                              const validWeekValue = Math.min(
                                Math.max(weekValue, 1),
                                maxWeeks
                              );
                              setNewDay({
                                ...newDay,
                                week: validWeekValue,
                              });
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Weeks must be between 1-
                            {form.getValues().number_of_weeks || 12}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <SetSelector
                          selectedSets={selectedSets}
                          onAddSet={handleAddSetToNewDay}
                          onRemoveSet={handleRemoveSetFromNewDay}
                          dayId={`new-day`}
                        />
                      </div>
                      <div className="border rounded-md p-4">
                        <MealSelector
                          selectedMeals={selectedMeals}
                          onAddMeal={handleAddMealToNewDay}
                          onRemoveMeal={handleRemoveMealFromNewDay}
                          dayId={`new-day`}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Calories Burned:
                          </span>
                          <span className="font-medium">
                            {selectedSets
                              .reduce(
                                (sum, set) => sum + (set.total_calories || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            calories
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Calories Intake:
                          </span>
                          <span className="font-medium">
                            {selectedMeals
                              .reduce(
                                (sum, meal) => sum + (meal.calories || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            calories
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log("Cancel clicked");
                          // Reset form data
                          setSelectedSets([]);
                          setSelectedMeals([]);
                          setNewDay({
                            name: "",
                            day: 1,
                            week: 1,
                            workout_details: [],
                            nutrition_details: [],
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={addNewDay}
                      disabled={
                        isAddingDay ||
                        (selectedSets.length === 0 &&
                          selectedMeals.length === 0)
                      }
                    >
                      {isAddingDay ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>Add Day</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading day plans...</span>
              </div>
            ) : dayPlans.length > 0 ? (
              <Tabs
                value={
                  Object.keys(daysByWeek).length > 0 ? activeWeekTab : undefined
                }
                onValueChange={setActiveWeekTab}
              >
                {Object.keys(daysByWeek).length > 0 ? (
                  <>
                    <TabsList className="flex overflow-x-auto mb-4">
                      {weekTabs}
                    </TabsList>

                    {Object.entries(daysByWeek).map(([weekKey, days]) => (
                      <TabsContent
                        key={weekKey}
                        value={weekKey}
                        className="mt-0"
                      >
                        {days
                          .sort((a, b) => a.day - b.day)
                          .map((day) => (
                            <Accordion
                              key={day._id}
                              type="single"
                              collapsible
                              className="mb-4 border rounded-md overflow-hidden"
                            >
                              <AccordionItem
                                value={day._id || "day"}
                                className="border-b-0"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:bg-slate-50">
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center">
                                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {day.name ||
                                          `Day ${day.day} - Week ${day.week}`}
                                      </span>
                                    </div>
                                    <div className="flex space-x-4 text-sm text-muted-foreground">
                                      <div className="flex items-center">
                                        <span>
                                          {day.estimated_calories_burned.toFixed(
                                            2
                                          )}{" "}
                                          cal burned
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <span>
                                          {day.estimated_calories_intake.toFixed(
                                            2
                                          )}{" "}
                                          cal intake
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Workout Details */}
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-base font-medium mb-3 flex items-center">
                                        Workouts ({day.workout_details.length})
                                      </h3>
                                      {day.workout_details.length > 0 ? (
                                        <ul className="space-y-2">
                                          {day.workout_details.map(
                                            (workout, index) => (
                                              <li
                                                key={index}
                                                className="p-2 bg-slate-50 rounded-md"
                                              >
                                                {workout.set_name ||
                                                  workout.set}
                                                {workout.total_calories && (
                                                  <span className="text-sm text-gray-500 ml-2">
                                                    ({workout.total_calories}{" "}
                                                    calories)
                                                  </span>
                                                )}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        <p className="text-gray-500 text-sm">
                                          No workouts in this day
                                        </p>
                                      )}
                                    </div>

                                    {/* Nutrition Details */}
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-base font-medium mb-3 flex items-center">
                                        Meals ({day.nutrition_details.length})
                                      </h3>
                                      {day.nutrition_details.length > 0 ? (
                                        <ul className="space-y-2">
                                          {day.nutrition_details.map(
                                            (nutrition, index) => (
                                              <li
                                                key={index}
                                                className="p-2 bg-slate-50 rounded-md"
                                              >
                                                {nutrition.meal_name ||
                                                  nutrition.meal}
                                                {nutrition.calories && (
                                                  <span className="text-sm text-gray-500 ml-2">
                                                    ({nutrition.calories}{" "}
                                                    calories)
                                                  </span>
                                                )}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        <p className="text-gray-500 text-sm">
                                          No meals in this day
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex justify-end mt-4">
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteDay(day._id || "")}
                                      disabled={
                                        isDeletingDay &&
                                        selectedDayId === day._id
                                      }
                                      className="flex items-center"
                                    >
                                      {isDeletingDay &&
                                      selectedDayId === day._id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Day
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ))}
                      </TabsContent>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No Days Added Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start by adding days to your health plan
                    </p>
                  </div>
                )}
              </Tabs>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Days Added Yet</h3>
                <p className="text-gray-500 mb-6">
                  Start by adding days to your health plan
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Calories Burned:
                  </span>
                  <span className="font-medium">
                    {dayPlans
                      .reduce(
                        (sum, day) =>
                          sum + (day.estimated_calories_burned || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    calories
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Calories Intake:
                  </span>
                  <span className="font-medium">
                    {dayPlans
                      .reduce(
                        (sum, day) =>
                          sum + (day.estimated_calories_intake || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    calories
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(saveGeneralInfo)}>
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 1
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    } mr-2`}
                  >
                    1
                  </div>
                  <span
                    className={
                      currentStep >= 1
                        ? "text-primary font-medium"
                        : "text-gray-400"
                    }
                  >
                    General Information
                  </span>
                </div>
                <div className="flex-1 mx-4 h-1 bg-gray-200">
                  <div
                    className={`h-1 bg-primary transition-all ${
                      currentStep >= 2 ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 2
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    } mr-2`}
                  >
                    2
                  </div>
                  <span
                    className={
                      currentStep >= 2
                        ? "text-primary font-medium"
                        : "text-gray-400"
                    }
                  >
                    Day Management
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="px-0">{renderStepContent()}</CardContent>

            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="mr-2"
                >
                  Previous
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={onSuccess}>
                  Cancel
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  type="submit"
                  className="bg-primary hover:opacity-80"
                  disabled={isSavingGeneralInfo}
                >
                  {isSavingGeneralInfo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onSuccess}
                >
                  Finish
                </Button>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default UpdateHealthPlanForm;
