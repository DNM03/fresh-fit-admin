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
import { toast } from "sonner";

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
  const [exercisePagination, setExercisePagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoadingExercises, setIsLoadingExercises] = useState<boolean>(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState<string>("");

  useEffect(() => {
    fetchExercises(1);
  }, []);

  const fetchExercises = async (page: number = 1, search: string = "") => {
    setIsLoadingExercises(true);
    try {
      const response = await exerciseService.searchExercise({
        page,
        limit: 20,
        search: search.trim(),
      });

      if (response.data?.result) {
        const { exercises, total_items, total_pages } = response.data.result;

        const options = exercises.map((exercise: any) => ({
          id: exercise._id,
          description: exercise.name,
        }));

        setExerciseOptions(options);
        setExercisePagination({
          currentPage: page,
          totalItems: total_items || exercises.length,
          totalPages: total_pages || 1,
        });
      } else {
        console.error("Failed to fetch exercises");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Failed to load exercises");
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const handleExercisePageChange = (page: number) => {
    fetchExercises(page, searchExerciseQuery);
  };

  const handleExerciseSearch = (term: string) => {
    setSearchExerciseQuery(term);
    fetchExercises(1, term);
  };

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
        imageRes = await mediaService.backupUploadImage(
          backgroundImage[0].file
        );
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
      toast.success("Exercise set created successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setFormSubmitted(true);
      // form.reset(defaultValues);
      // setExercisesList([]);
      setBackgroundImage([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create set. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
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
      return total + (exercise.duration || 0);
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
              form.reset(defaultValues);
              setExercisesList([]);
              setBackgroundImage([]);
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
                required
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
                required
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
                onClick={() => handleStepChange(2)}
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
                              Reps: {exercise.reps || "0"}
                            </div>

                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center h-3 w-3 mr-1 text-gray-400 font-bold">
                                ⟳
                              </span>
                              Rounds: {exercise.rounds || "0"}
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
                isLoadingExercises={isLoadingExercises}
                exercisePagination={exercisePagination}
                onExercisePageChange={handleExercisePageChange}
                onExerciseSearch={handleExerciseSearch}
              />
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleStepChange(1)}
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

  const handleStepChange = async (step: number) => {
    if (step > currentStep) {
      const fieldsToValidate: Array<keyof CreateExerciseSetType> = [];

      if (currentStep === 1) {
        fieldsToValidate.push("name", "description", "type");
      }

      const isValid = await form.trigger(fieldsToValidate);

      if (!isValid) {
        // toast.error("Please fill in all required fields correctly", {
        //   style: {
        //     background: "#cc3131",
        //     color: "#fff",
        //   },
        // });
        return;
      }

      if (currentStep === 1 && step === 2) {
        if (backgroundImage.length === 0) {
          toast.warning(
            "No background image selected. You can add one later.",
            {
              style: {
                background: "#f59e0b",
                color: "#fff",
              },
            }
          );
        }
      }
    }

    setCurrentStep(step);
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
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="space-y-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {!formSubmitted && (
            <div className="mb-8">
              <div className="flex items-center mb-2">
                {/* Step 1 button */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200"
                  } mr-2 cursor-pointer`}
                  onClick={() => handleStepChange(1)}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-1 ${
                    currentStep >= 2 ? "bg-primary" : "bg-gray-200"
                  } mx-2`}
                ></div>
                {/* Step 2 button */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200"
                  } mr-2 cursor-pointer`}
                  onClick={() => handleStepChange(2)}
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

          {/* {Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <p className="font-medium">
                Please correct the following errors:
              </p>
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>{error.message as string}</li>
                ))}
              </ul>
            </div>
          )} */}
        </form>
      </Form>
    </div>
  );
}

export default ExerciseSetForm;
