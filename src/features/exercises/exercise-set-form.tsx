import { useEffect, useState } from "react";
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
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import mediaService from "@/services/media.service";
import exerciseService from "@/services/exercise.service";
import setService from "@/services/set.service";

function ExerciseSetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<ImageFile[]>([]);

  const [exercisesList, setExercisesList] = useState<
    (CreateExerciseInSetType & { _id: string; name: string })[]
  >([]);
  const [exerciseOptions, setExerciseOptions] = useState<
    { id: string; description: string }[]
  >([]);
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await exerciseService.getAllForSelect();
        if (response.status === 200) {
          // setExercisesList(response.data?.exercises);
          setExerciseOptions(
            response.data?.exercises.map((exercise: any) => ({
              id: exercise._id,
              description: exercise.name,
            })) || []
          );
        } else {
          console.error("Failed to fetch exercises");
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, []);

  const defaultValues: CreateExerciseSetType = {
    description: "",
    name: "",
    numberOfExercises: 1,
    type: "Intermediate",
  };

  const form = useForm<CreateExerciseSetType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty(),
        type: z.enum(["Beginner", "Intermediate", "Advanced"]),
        description: z.string().nonempty(),
        numberOfExercises: z.number().int().positive(),
      })
    ),
  });

  function secondsToTimeWords(seconds: number): string {
    if (seconds < 0) {
      throw new Error("Input must be a non-negative number");
    }

    if (seconds === 0) {
      return "0 seconds";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    }

    if (remainingSeconds > 0) {
      parts.push(
        `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`
      );
    }

    return parts.join(" ");
  }

  async function submitForm(data: CreateExerciseSetType) {
    try {
      setIsLoading(true);
      let imageRes;
      if (backgroundImage[0]?.file) {
        imageRes = await mediaService.uploadImage(backgroundImage[0].file);
      }
      const finalData = {
        name: data.name,
        description: data.description,
        type: data.type,
        number_of_exercises: exercisesList.length,
        set_exercises: exercisesList.map((exercise, index) => ({
          exercise_id: exercise.exercise_id,
          duration: exercise.duration,
          reps: exercise.reps,
          round: exercise.rounds,
          timePerRound: exercise.timePerRound,
          rest_per_round: exercise.rest_per_round,
          estimated_calories_burned: exercise.estimated_calories_burned,
          orderNumber: index,
        })),
        time: secondsToTimeWords(calculateTotalDuration()),
        image: imageRes?.result?.url || "",
        total_calories: calculateTotalCalories(),
        is_youtube_workout: false,
        youtube_id: null,
      };

      const response = await setService.addSet(finalData);

      console.log("Set created successfully:", response.data);

      setFormSubmitted(true);
      form.reset(defaultValues);
      setExercisesList([]);
      setBackgroundImage([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create set. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function editExercise(exercise: CreateExerciseInSetType & { _id: string }) {
    setEditingExerciseId(exercise._id);
    setAddingExercise(true);
  }

  function removeExercise(id: string) {
    setExercisesList((prev) => prev.filter((exercise) => exercise._id !== id));
  }

  function calculateTotalCalories() {
    return exercisesList.reduce(
      (total, exercise) => total + (exercise.estimated_calories_burned || 0),
      0
    );
  }

  function calculateTotalDuration() {
    return exercisesList.reduce((total, exercise) => {
      const exerciseDuration =
        (exercise.duration || 0) * (exercise.rounds || 1) +
        (exercise.rest_per_round || 0) * ((exercise.rounds || 1) - 1);
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
                    { description: "Beginner", id: "Beginner" },
                    { description: "Intermediate", id: "Intermediate" },
                    { description: "Advanced", id: "Advanced" },
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
              <div>
                <p className="text-base font-semibold">Background Image</p>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a clear background image (max 20MB)
                </p>
                <ImageDropzone
                  maxImages={1}
                  maxSizeInMB={20}
                  onImagesChange={(value) => {
                    setBackgroundImage(value);
                  }}
                />
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
                    <Card key={exercise._id} className="p-4 hover:bg-gray-50">
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
                            Rest: {exercise.rest_per_round}s per round •{" "}
                            {exercise.estimated_calories_burned} calories
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
                            onClick={() => removeExercise(exercise._id)}
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
                {isLoading ? "Saving..." : "Create Exercise Set"}
                {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
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
