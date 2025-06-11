import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Calendar, ChevronRight } from "lucide-react";
import { Form } from "@/components/ui/form";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
import { format } from "date-fns";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SetSelector from "./set-selector";
import MealSelector from "./meal-selector";
import { useNavigate } from "react-router-dom";
import healthPlanService from "@/services/health-plan.service";
import { toast } from "sonner";

const healthPlanFormSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  estimated_calories_burned: z.number().min(0, "Must be a positive number"),
  estimated_calories_intake: z.number().min(0, "Must be a positive number"),
  status: z.enum(["Done", "Undone"]),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z
    .date({
      required_error: "End date is required",
    })
    .refine((date) => date > new Date(), {
      message: "End date must be in the future",
    }),
  number_of_weeks: z
    .number()
    .int()
    .min(1, "Must be at least 1 week")
    .max(52, "Cannot exceed 52 weeks"),
});

type HealthPlanFormData = z.infer<typeof healthPlanFormSchema>;

interface DayPlanData {
  id: string;
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
}

function HealthPlanForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() + 3))
  );
  const [dayPlans, setDayPlans] = useState<DayPlanData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState("week-1");
  const navigate = useNavigate();

  const defaultValues: HealthPlanFormData = {
    name: "",
    description: "",
    estimated_calories_burned: 0,
    estimated_calories_intake: 0,
    status: "Undone",
    level: "Beginner",
    start_date: startDate,
    end_date: endDate,
    number_of_weeks: 1,
  };

  const form = useForm<HealthPlanFormData>({
    defaultValues,
    resolver: zodResolver(healthPlanFormSchema),
    mode: "onChange",
  });

  const calculateWeeksBetween = (startDate: Date, endDate: Date) => {
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / millisecondsPerWeek);
    return diffWeeks;
  };

  useEffect(() => {
    if (startDate && endDate && endDate > startDate) {
      const weeks = calculateWeeksBetween(startDate, endDate);
      form.setValue("number_of_weeks", weeks);
    }
  }, [startDate, endDate]);
  useEffect(() => {
    form.setValue("number_of_weeks", 1);
  }, []);

  const generateInitialDays = (weeks: number) => {
    let initialDays: DayPlanData[] = [];
    for (let week = 1; week <= weeks; week++) {
      for (let day = 1; day <= 7; day++) {
        initialDays.push({
          id: `week-${week}-day-${day}`,
          name: `Day ${day} Week ${week}`,
          day: day,
          week: week,
          workout_details: [],
          nutrition_details: [],
          estimated_calories_burned: 0,
          estimated_calories_intake: 0,
        });
      }
    }
    return initialDays;
  };

  const handleWeeksChange = (weeks: number) => {
    form.setValue("number_of_weeks", weeks);
    setDayPlans(generateInitialDays(weeks));
    setActiveWeekTab(`week-1`);
  };

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "start_date" && values.start_date) {
        const newStartDate = values.start_date as Date;
        setStartDate(newStartDate);

        if (endDate && endDate > newStartDate) {
          const weeks = calculateWeeksBetween(newStartDate, endDate);
          form.setValue("number_of_weeks", weeks);
          setDayPlans(generateInitialDays(weeks));
        }
      } else if (name === "end_date" && values.end_date) {
        const newEndDate = values.end_date as Date;
        setEndDate(newEndDate);

        if (startDate && newEndDate > startDate) {
          const weeks = calculateWeeksBetween(startDate, newEndDate);
          form.setValue("number_of_weeks", weeks);
          setDayPlans(generateInitialDays(weeks));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, startDate, endDate, calculateWeeksBetween]);

  const handleAddExerciseToDayPlan = (dayId: string, set: any) => {
    setDayPlans((prevDays) => {
      return prevDays.map((day) => {
        if (day.id === dayId) {
          const existingExerciseIds = day.workout_details.map((ex) => ex.set);
          if (existingExerciseIds.includes(set._id)) return day;

          const totalCalories =
            day.estimated_calories_burned + set.total_calories;

          return {
            ...day,
            workout_details: [
              ...day.workout_details,
              {
                set: set._id,
                set_name: set.name,
                total_calories: set.total_calories,
              },
            ],
            estimated_calories_burned: totalCalories,
          };
        }
        return day;
      });
    });
  };

  const handleRemoveExerciseFromDay = (dayId: string, exerciseId: string) => {
    setDayPlans((prevDays) => {
      return prevDays.map((day) => {
        if (day.id === dayId) {
          //   const exerciseDetails = day.workout_details.find(
          //     (ex) => ex.set === exerciseId
          //   );
          const selectedSet = day.workout_details.find(
            (ex) => ex.set === exerciseId
          );

          const caloriesToSubtract = selectedSet ? 500 : 0;

          return {
            ...day,
            workout_details: day.workout_details.filter(
              (ex) => ex.set !== exerciseId
            ),
            estimated_calories_burned: Math.max(
              0,
              day.estimated_calories_burned - caloriesToSubtract
            ),
          };
        }
        return day;
      });
    });
  };

  // Handle adding meals to a day
  const handleAddMealToDayPlan = (dayId: string, meal: any) => {
    setDayPlans((prevDays) => {
      return prevDays.map((day) => {
        if (day.id === dayId) {
          // Add only if not already present
          const existingMealIds = day.nutrition_details.map(
            (meal) => meal.meal
          );
          if (existingMealIds.includes(meal._id)) return day;

          // Calculate total calories intake
          const totalCalories = day.estimated_calories_intake + meal.calories;

          return {
            ...day,
            nutrition_details: [
              ...day.nutrition_details,
              {
                meal: meal._id,
                meal_name: meal.name,
                calories: meal.calories || 0,
              },
            ],
            estimated_calories_intake: totalCalories,
          };
        }
        return day;
      });
    });
  };

  // Handle removing a meal from a day
  const handleRemoveMealFromDay = (dayId: string, mealId: string) => {
    setDayPlans((prevDays) => {
      return prevDays.map((day) => {
        if (day.id === dayId) {
          // Find the meal in the day's nutrition_details to get its calories
          const mealDetails = day.nutrition_details.find(
            (m) => m.meal === mealId
          );

          // Determine calories to subtract (if available from the meal details)
          const caloriesToSubtract = mealDetails
            ? // In a real app, you might want to fetch this from an API
              // or maintain a local cache of meal details
              600 // Default or estimated value
            : 0;

          return {
            ...day,
            nutrition_details: day.nutrition_details.filter(
              (m) => m.meal !== mealId
            ),
            estimated_calories_intake: Math.max(
              0,
              day.estimated_calories_intake - caloriesToSubtract
            ),
          };
        }
        return day;
      });
    });
  };

  const handleSubmit = async (data: HealthPlanFormData) => {
    setIsLoading(true);
    try {
      // Calculate total estimated calories for the entire plan
      const totalCaloriesBurned = dayPlans.reduce(
        (sum, day) => sum + day.estimated_calories_burned,
        0
      );
      const totalCaloriesIntake = dayPlans.reduce(
        (sum, day) => sum + day.estimated_calories_intake,
        0
      );
      const formattedDays = dayPlans
        .filter(
          (day) =>
            day.workout_details.length > 0 || day.nutrition_details.length > 0
        )
        .map((day) => ({
          name: day.name,
          day: day.day,
          week: day.week,
          workout_details: day.workout_details.map((workout) => ({
            set: workout.set,
          })),
          nutrition_details: day.nutrition_details.map((nutrition) => ({
            meal: nutrition.meal,
          })),
          estimated_calories_burned: day.estimated_calories_burned,
          estimated_calories_intake: day.estimated_calories_intake,
        }));

      // const fullPlanData = {
      //   ...data,
      //   estimated_calories_burned: totalCaloriesBurned,
      //   estimated_calories_intake: totalCaloriesIntake,
      //   start_date: startDate.toISOString(),
      //   end_date: endDate.toISOString(),
      //   days: formattedDays,
      // };

      const healthPlanData = {
        ...data,
        estimated_calories_burned: totalCaloriesBurned,
        estimated_calories_intake: totalCaloriesIntake,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };

      const healthPlanResponse = await healthPlanService.createNewHealthPlan(
        healthPlanData
      );

      const healthPlanId = healthPlanResponse.data.health_plan?._id;
      // console.log("Health Plan ID:", healthPlanId);
      if (healthPlanId) {
        for (const day of formattedDays) {
          await healthPlanService.addNewHealthPlanDetails(healthPlanId, {
            day: day.day,
            week: day.week,
            workout_details: day.workout_details,
            nutrition_details: day.nutrition_details,
            estimated_calories_burned: day.estimated_calories_burned,
            estimated_calories_intake: day.estimated_calories_intake,
          });
        }
      }
      toast.success("Health plan created successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });

      setFormSubmitted(true);
      // Reset form and state
      form.reset(defaultValues);
      setDayPlans([]);
      setStartDate(new Date());
      setEndDate(new Date());
      setCurrentStep(1);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting health plan:", error);
      toast.error("Failed to create health plan. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const fieldsToValidate = [
        "name",
        "description",
        "level",
        "start_date",
        "end_date",
        "number_of_weeks",
      ];

      const result = await form.trigger(
        fieldsToValidate as Array<keyof HealthPlanFormData>
      );

      if (result) {
        if (dayPlans.length === 0) {
          const weeks = form.getValues("number_of_weeks") || 12;
          setDayPlans(generateInitialDays(weeks));
        }
        setCurrentStep(2);
      } else {
        // If validation fails, we can show a toast message
        // toast.error("Please fill in all required fields correctly", {
        //   style: {
        //     background: "#cc3131",
        //     color: "#fff",
        //   },
        // });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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

  const renderStepContent = () => {
    if (formSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Health Plan Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new health plan has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>Level: {form.getValues().level}</span>
              <span>
                {startDate && endDate
                  ? `${format(startDate, "MMM d")} - ${format(
                      endDate,
                      "MMM d, yyyy"
                    )}`
                  : "No dates set"}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
              form.reset(defaultValues);
              setDayPlans([]);
              setStartDate(new Date());
              setEndDate(
                new Date(new Date().setMonth(new Date().getMonth() + 3))
              );
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Another Health Plan
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 1: Plan Information
              </h2>
              <p className="text-sm text-primary">
                Enter the basic details for this health plan.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePickerWithLabel
                fieldTitle="Start Date"
                nameInSchema="start_date"
                required
              />

              <DatePickerWithLabel
                fieldTitle="End Date"
                nameInSchema="end_date"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <InputWithLabel
                  fieldTitle="Number of Weeks"
                  nameInSchema="number_of_weeks"
                  type="number"
                  min={1}
                  max={52}
                  onChange={(e) =>
                    handleWeeksChange(parseInt(e.target.value) || 12)
                  }
                  placeholder="E.g., 12"
                  className="w-full"
                  required
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">
                  Calculated automatically from start and end dates
                </p>
              </div>

              <div className="space-y-2">
                <SelectWithLabel
                  fieldTitle="Status"
                  nameInSchema="status"
                  data={[
                    { id: "Done", description: "Done" },
                    { id: "Undone", description: "Undone" },
                  ]}
                  className="w-full"
                />
                <p></p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 2: Day-by-Day Planning
              </h2>
              <p className="text-sm text-primary">
                Set up exercise and nutrition plans for each day.
              </p>
            </div>

            {dayPlans.length > 0 ? (
              <Tabs value={activeWeekTab} onValueChange={setActiveWeekTab}>
                <TabsList className="flex overflow-x-auto mb-4">
                  {weekTabs}
                </TabsList>

                {Object.entries(daysByWeek).map(([weekKey, days]) => (
                  <TabsContent key={weekKey} value={weekKey} className="mt-0">
                    {days.map((day) => (
                      <Accordion
                        key={day.id}
                        type="single"
                        collapsible
                        className="mb-4 border rounded-md overflow-hidden"
                      >
                        <AccordionItem value={day.id} className="border-b-0">
                          <AccordionTrigger className="px-4 py-3 hover:bg-slate-50">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  Day {day.day}
                                </span>
                              </div>
                              <div className="flex space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <span>
                                    {day.estimated_calories_burned} cal burned
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span>
                                    {day.estimated_calories_intake} cal intake
                                  </span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Exercise Section - using SetSelector component */}
                              <div className="border rounded-md p-4">
                                <SetSelector
                                  selectedSets={day.workout_details.map(
                                    (workout) => ({
                                      _id: workout.set,
                                      name:
                                        workout.set_name || "Unknown Exercise",
                                      total_calories:
                                        workout.total_calories || 0,
                                    })
                                  )}
                                  onAddSet={(set) =>
                                    handleAddExerciseToDayPlan(day.id, set)
                                  }
                                  onRemoveSet={(setId) =>
                                    handleRemoveExerciseFromDay(day.id, setId)
                                  }
                                  dayId={day.id}
                                />
                              </div>

                              {/* Nutrition Section - using MealSelector component */}
                              <div className="border rounded-md p-4">
                                <MealSelector
                                  selectedMeals={day.nutrition_details.map(
                                    (nutrition) => ({
                                      _id: nutrition.meal,
                                      name:
                                        nutrition.meal_name || "Unknown Meal",
                                      calories: nutrition.calories || 0,
                                    })
                                  )}
                                  onAddMeal={(meal) =>
                                    handleAddMealToDayPlan(day.id, meal)
                                  }
                                  onRemoveMeal={(mealId) =>
                                    handleRemoveMealFromDay(day.id, mealId)
                                  }
                                  dayId={day.id}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <p className="text-gray-500">
                  Please complete step 1 to generate daily plans
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
                    {dayPlans.reduce(
                      (sum, day) => sum + day.estimated_calories_burned,
                      0
                    )}{" "}
                    calories
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Calories Intake:
                  </span>
                  <span className="font-medium">
                    {dayPlans.reduce(
                      (sum, day) => sum + day.estimated_calories_intake,
                      0
                    )}{" "}
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
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Create Health Plan</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className="p-6">
            {!formSubmitted && (
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
                      Plan Information
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
                      Day-by-Day Planning
                    </span>
                  </div>
                </div>
              </div>
            )}

            <CardContent className="px-0">{renderStepContent()}</CardContent>

            {/* {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-md">
                <p className="font-medium mb-1">
                  Please correct the following errors:
                </p>
                <ul className="list-disc list-inside">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field}>{error.message as string}</li>
                    )
                  )}
                </ul>
              </div>
            )} */}

            {!formSubmitted && (
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
                  <div></div>
                )}

                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary hover:opacity-80"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="submit"
                    className="bg-primary hover:opacity-80"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Health Plan"}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default HealthPlanForm;
