import { useEffect, useState } from "react";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { DatePicker } from "@/components/ui/date-picker";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ExercisePlanType } from "@/constants/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  Calendar,
  Flame,
  CalendarDays,
  Edit,
  Trash2,
} from "lucide-react";
import SetInPlanForm from "./set-in-plan-form";
import { Card } from "@/components/ui/card";

function ExercisePlanForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [addingExerciseSet, setAddingExerciseSet] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [numOfWeeks, setNumOfWeeks] = useState(0);
  const [setsList, setSetsList] = useState<any[]>([]);
  const setOptions = [
    {
      id: "set-001",
      name: "Upper Body Strength",
      estimatedCaloriesBurned: 350,
      description:
        "Focus on chest, shoulders, and arms with compound movements",
    },
    {
      id: "set-002",
      name: "Lower Body Power",
      estimatedCaloriesBurned: 420,
      description: "Squats, lunges, and deadlifts for leg strength and power",
    },
    {
      id: "set-003",
      name: "Core Stability",
      estimatedCaloriesBurned: 280,
      description: "Planks, Russian twists, and leg raises for a strong core",
    },
    {
      id: "set-004",
      name: "HIIT Cardio",
      estimatedCaloriesBurned: 500,
      description: "High-intensity interval training for maximum calorie burn",
    },
    {
      id: "set-005",
      name: "Full Body Circuit",
      estimatedCaloriesBurned: 450,
      description: "Complete body workout with minimal rest between exercises",
    },
    {
      id: "set-006",
      name: "Mobility & Flexibility",
      estimatedCaloriesBurned: 200,
      description: "Dynamic stretching and mobility exercises for recovery",
    },
  ];

  const [date, setDate] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const calculateWeeks = (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  const editSet = (setId: string) => {
    setEditingSetId(setId);
    setAddingExerciseSet(true);
  };

  const removeSet = (id: string) => {};

  const defaultValues: ExercisePlanType = {
    name: "",
    description: "",
    sets: 0,
    type: "beginner",
    startDate: new Date(),
    endDate: new Date(),
  };

  const form = useForm<ExercisePlanType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty("Plan name is required"),
        description: z.string().nonempty("Description is required"),
        sets: z.number().min(1, "Must have at least 1 set"),
        type: z.enum(["beginner", "intermediate", "advanced"]),
        startDate: z.date(),
        endDate: z.date().refine(
          (endDate) => {
            const startDate: Date = form.getValues().startDate;
            return !startDate || endDate > startDate;
          },
          {
            message: "End date must be after start date",
          }
        ),
      })
    ),
  });

  useEffect(() => {
    console.log("Form values:", form.getValues());
    if (form.getValues().startDate && form.getValues().endDate) {
      setNumOfWeeks(
        calculateWeeks(form.getValues().startDate, form.getValues().endDate)
      );
    }
  }, [form.getValues().startDate, form.getValues().endDate]);

  async function submitForm(data: ExercisePlanType) {
    console.log("Form data:", data);
    setFormSubmitted(true);
  }

  const renderStepContent = () => {
    if (formSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Exercise Plan Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new workout plan has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              {/* <span>{exercisesList.length} exercises</span> */}
              {/* <span>{formatTime(calculateTotalDuration())}</span> */}
              <span>{form.getValues().sets} sets</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
              form.reset(defaultValues);
              // setExercisesList([]);
            }}
            className="bg-primary hover:opacity-80"
          >
            Create Another Plan
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 1: Basic Information
              </h2>
              <p className="text-sm text-primary">
                Enter the details about your exercise plan.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<ExercisePlanType>
                  fieldTitle="Plan Name"
                  nameInSchema="name"
                  placeholder="Eg, 30 days full body workout"
                  className="w-full"
                />
                <SelectWithLabel<ExercisePlanType>
                  fieldTitle="Type"
                  nameInSchema="type"
                  data={[
                    { description: "Beginner", id: "beginner" },
                    { description: "Intermediate", id: "intermediate" },
                    { description: "Advanced", id: "advanced" },
                  ]}
                  className="w-full"
                />
              </div>

              <TextAreaWithLabel<ExercisePlanType>
                fieldTitle="Description"
                nameInSchema="description"
                placeholder="Eg, This is a 30 days full body workout plan"
                className="w-full h-24"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={date.startDate}
                    setDate={(date) => {
                      form.setValue("startDate", date);
                      setDate((prev) => ({ ...prev, startDate: date }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker
                    date={date.endDate}
                    setDate={(date) => {
                      form.setValue("endDate", date);
                      setDate((prev) => ({ ...prev, endDate: date }));
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <Label>Number of weeks (Based on date difference)</Label>
                <div className="text-lg font-medium mt-1">
                  {numOfWeeks} weeks
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-primary hover:opacity-80"
              >
                Continue to Add Exercises
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 2: Add Exercise Sets
              </h2>
              <p className="text-sm text-primary">
                Build your workout by adding exercise sets to your plan.
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">Exercise Set List</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-primary">
                  {setsList.length} sets
                </span>
              </div>

              {!addingExerciseSet && (
                <Button
                  type="button"
                  onClick={() => setAddingExerciseSet(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Set
                </Button>
              )}
            </div>

            {setsList.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg mb-6 shadow-sm">
                <div className="p-2 space-y-2">
                  {setsList.map((set) => (
                    <Card key={set.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{set.name}</div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              Week {set.week}
                            </div>

                            <div className="flex items-center">
                              <Flame className="h-3 w-3 mr-1 text-gray-400" />
                              {set.caloriesBurned} calories
                            </div>
                          </div>

                          <div className="mt-1 text-sm text-gray-600 flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1 text-gray-400" />
                            Day {set.day}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => editSet(set)}
                            className="text-blue-500 hover:text-primary hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSet(set.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-gray-500 mb-6 bg-gray-50">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="mb-2">No exercises added yet.</p>
                <Button
                  type="button"
                  onClick={() => setAddingExerciseSet(true)}
                  variant="outline"
                  className="mt-2"
                >
                  Add Your First Set
                </Button>
              </div>
            )}
            {addingExerciseSet && (
              <SetInPlanForm
                totalWeeks={calculateWeeks(date.startDate, date.endDate)}
                endDate={date.endDate}
                startDate={date.startDate}
                editingSetId={editingSetId}
                setEditingSetId={setEditingSetId}
                setAddingSet={setAddingExerciseSet}
                setSetsList={setSetsList}
                setOptions={setOptions}
              />
            )}
            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Details
              </Button>

              <Button
                type="submit"
                // disabled={exercisesList.length === 0}
                className="bg-primary hover:opacity-80"
              >
                Create Exercise Plan
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create New Exercise Plan</h1>
        <p>
          Complete the form below to create a new exercise plan for your workout
          routine.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
          {!formSubmitted && (
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200"
                  } mr-2`}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-1 ${
                    currentStep >= 2 ? "bg-primary" : "bg-gray-200"
                  } mx-2`}
                ></div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200"
                  } mr-2`}
                >
                  2
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Basic Information</span>
                <span>Add Exercises</span>
              </div>
            </div>
          )}

          {renderStepContent()}
        </form>
      </Form>
    </div>
  );
}

export default ExercisePlanForm;
