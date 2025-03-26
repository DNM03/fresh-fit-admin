import { useState } from "react";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import {
  CreateExerciseInSetType,
  CreateExerciseSetType,
} from "@/constants/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Trash2,
  PlusCircle,
  Check,
  AlertCircle,
  Edit,
  Clock,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
} from "lucide-react";
import ExerciseInSetForm from "./exercise-in-set-form";

function ExerciseSetForm() {
  // Demo data for the exercise set form
  const fakeExercisesList = [
    {
      id: "ex-001",
      exerciseId: "1",
      duration: 60,
      reps: 15,
      rounds: 3,
      restPerRound: 30,
      estimatedCaloriesBurned: 45,
      name: "Pushup",
    },
    {
      id: "ex-002",
      exerciseId: "2",
      duration: 180,
      reps: 0,
      rounds: 2,
      restPerRound: 60,
      estimatedCaloriesBurned: 120,
      name: "Jogging",
    },
    {
      id: "ex-003",
      exerciseId: "3",
      duration: 90,
      reps: 30,
      rounds: 4,
      restPerRound: 45,
      estimatedCaloriesBurned: 200,
      name: "Boxing",
    },
  ];

  const [exercisesList, setExercisesList] =
    useState<(CreateExerciseInSetType & { id: string; name: string })[]>(
      fakeExercisesList
    );
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const defaultValues: CreateExerciseSetType = {
    description: "A comprehensive workout targeting all major muscle groups.",
    name: "Full Body Workout",
    numberOfExercises: 3,
    type: "intermediate",
  };

  const form = useForm<CreateExerciseSetType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty(),
        type: z.enum(["beginner", "intermediate", "advanced"]),
        description: z.string().nonempty(),
        numberOfExercises: z.number().int().positive(),
      })
    ),
  });

  const exerciseOptions = [
    { description: "Pushup", id: "1" },
    { description: "Jogging", id: "2" },
    { description: "Boxing", id: "3" },
    { description: "Squats", id: "4" },
    { description: "Planks", id: "5" },
    { description: "Lunges", id: "6" },
    { description: "Burpees", id: "7" },
  ];

  async function submitForm(data: CreateExerciseSetType) {
    const finalData = {
      ...data,
      numberOfExercises: exercisesList.length,
      exercises: exercisesList,
    };
    console.log("Final exercise set:", finalData);
    setFormSubmitted(true);
  }

  function editExercise(exercise: CreateExerciseInSetType & { id: string }) {
    setEditingExerciseId(exercise.id);
    setAddingExercise(true);
  }

  function removeExercise(id: string) {
    setExercisesList((prev) => prev.filter((exercise) => exercise.id !== id));
  }

  function calculateTotalCalories() {
    return exercisesList.reduce(
      (total, exercise) => total + (exercise.estimatedCaloriesBurned || 0),
      0
    );
  }

  function calculateTotalDuration() {
    return exercisesList.reduce((total, exercise) => {
      const exerciseDuration =
        (exercise.duration || 0) * (exercise.rounds || 1) +
        (exercise.restPerRound || 0) * ((exercise.rounds || 1) - 1);
      return total + exerciseDuration;
    }, 0);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  const renderStepContent = () => {
    if (formSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Exercise Set Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new workout has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>{exercisesList.length} exercises</span>
              <span>{formatTime(calculateTotalDuration())}</span>
              <span>{calculateTotalCalories()} cal</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
            }}
            className="bg-primary hover:opacity-80"
          >
            Create Another Set
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
                Enter the details about your exercise set.
              </p>
            </div>

            <div className="space-y-6">
              <InputWithLabel<CreateExerciseSetType>
                fieldTitle="Set Name"
                nameInSchema="name"
                placeholder="Eg, Top body workout"
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectWithLabel<CreateExerciseSetType>
                  fieldTitle="Difficulty Level"
                  nameInSchema="type"
                  className="w-full"
                  data={[
                    { description: "Beginner", id: "beginner" },
                    { description: "Intermediate", id: "intermediate" },
                    { description: "Advanced", id: "advanced" },
                  ]}
                />

                <div className="flex items-end">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Estimated total:</span>
                    <div className="mt-1 flex space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{formatTime(calculateTotalDuration())}</span>
                      </div>
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{calculateTotalCalories()} calories</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <TextAreaWithLabel<CreateExerciseSetType>
                fieldTitle="Description"
                nameInSchema="description"
                placeholder="Eg, Help to build chest muscles"
                className="w-full h-24"
              />
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
                Step 2: Add Exercises
              </h2>
              <p className="text-sm text-primary">
                Build your workout by adding exercises to your set.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">Exercise List</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-primary">
                  {exercisesList.length} exercises
                </span>
              </div>

              {!addingExercise && (
                <Button
                  type="button"
                  onClick={() => setAddingExercise(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Exercise
                </Button>
              )}
            </div>

            {exercisesList.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg mb-6 shadow-sm">
                <div className="p-2 space-y-2">
                  {exercisesList.map((exercise) => (
                    <Card key={exercise.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-lg">
                            {exercise.name}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mt-2">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-gray-400" />
                              Duration: {exercise.duration}s
                            </div>

                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center h-3 w-3 mr-1 text-gray-400 font-bold">
                                ×
                              </span>
                              Reps: {exercise.reps || "N/A"}
                            </div>

                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center h-3 w-3 mr-1 text-gray-400 font-bold">
                                ⟳
                              </span>
                              Rounds: {exercise.rounds}
                            </div>
                          </div>

                          <div className="mt-1 text-sm text-gray-600">
                            Rest: {exercise.restPerRound}s per round •{" "}
                            {exercise.estimatedCaloriesBurned} calories
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => editExercise(exercise)}
                            className="text-green-500 hover:text-primary hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExercise(exercise.id)}
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
                  onClick={() => setAddingExercise(true)}
                  variant="outline"
                  className="mt-2"
                >
                  Add Your First Exercise
                </Button>
              </div>
            )}

            {addingExercise && (
              <ExerciseInSetForm
                setExercisesList={setExercisesList}
                exerciseOptions={exerciseOptions}
                setAddingExercise={setAddingExercise}
                editingExerciseId={editingExerciseId}
                setEditingExerciseId={setEditingExerciseId}
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
                disabled={exercisesList.length === 0}
                className="bg-primary hover:opacity-80"
              >
                Create Exercise Set
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
        <h1 className="text-2xl font-semibold">Add New Exercise Set</h1>
        <p>
          Complete the form below to add a new exercise set to your workout
          collection.
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

export default ExerciseSetForm;
