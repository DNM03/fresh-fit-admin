import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { motion } from "framer-motion";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import mediaService from "@/services/media.service";
import setService from "@/services/set.service";
import exerciseService from "@/services/exercise.service";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedSelect from "@/components/ui/optimized-select";
import { toast } from "sonner";

interface Exercise {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

interface ExerciseInSet {
  _id: string;
  exercise_id: string;
  duration: number;
  reps: number;
  rounds: number;
  timePerRound: number;
  rest_per_round: number;
  estimated_calories_burned: number;
  status: string;
  orderNumber: number;
}

interface UpdateExerciseSetFormProps {
  exerciseSet: {
    _id: string;
    name: string;
    type: "Beginner" | "Intermediate" | "Advanced";
    description: string;
    number_of_exercises: number;
    set_exercises: ExerciseInSet[];
    status: string;
    time: string;
    image: string;
    total_calories: number;
    is_youtube_workout: boolean;
    youtube_id: string | null;
  };
  onSuccess: () => void;
}

function UpdateExerciseSetForm({
  exerciseSet,
  onSuccess,
}: UpdateExerciseSetFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [backgroundImage, setBackgroundImage] = useState<ImageFile[]>([]);
  const [exercisesList, setExercisesList] = useState<
    (ExerciseInSet & { name?: string })[]
  >([]);
  const [exerciseOptions, setExerciseOptions] = useState<
    { id: string; description: string }[]
  >([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseFormData, setExerciseFormData] = useState({
    duration: 0,
    reps: 0,
    rounds: 1,
    rest_per_round: 0,
    timePerRound: 0,
    estimated_calories_burned: 0,
    status: "Undone",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with existing exercise set data
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await exerciseService.searchExercise({
          page: 1,
          limit: 100, // Get a reasonable number of exercises
        });

        if (response.data?.result?.exercises) {
          const exercises = response.data.result.exercises;
          setAllExercises(exercises);

          const options = exercises.map((exercise: Exercise) => ({
            id: exercise._id,
            description: exercise.name,
          }));

          setExerciseOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }
    };

    // Initialize exercises list with existing exercises in the set
    const enrichedExercises = exerciseSet.set_exercises.map((ex) => {
      // Find the exercise name if available
      const exerciseDetails = allExercises.find(
        (e) => e._id === ex.exercise_id
      );
      return {
        ...ex,
        name: exerciseDetails?.name || "Unknown Exercise",
      };
    });

    setExercisesList(enrichedExercises);
    fetchExercises();
  }, [exerciseSet.set_exercises, allExercises]);

  const defaultValues = {
    name: exerciseSet.name,
    type: exerciseSet.type,
    description: exerciseSet.description || "",
    numberOfExercises: exerciseSet.number_of_exercises,
    is_youtube_workout: exerciseSet.is_youtube_workout,
    youtube_id: exerciseSet.youtube_id || "",
  };

  const formSchema = z.object({
    name: z.string().nonempty("Set name is required"),
    type: z.enum(["Beginner", "Intermediate", "Advanced"], {
      errorMap: () => ({ message: "Please select a difficulty level" }),
    }),
    description: z.string().optional(),
    numberOfExercises: z.coerce
      .number()
      .int("Must be a whole number")
      .positive("Must be greater than 0"),
    is_youtube_workout: z.boolean().optional().default(false),
    youtube_id: z.string().optional(),
  });

  const form = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors, isValid } = formState;

  const hasDetailsErrors = !!(
    errors.name ||
    errors.type ||
    errors.description ||
    errors.numberOfExercises
  );

  // Handlers for exercise list management
  const handleAddExercise = () => {
    setIsAddingExercise(true);
    setEditingExerciseIndex(null);
    setSelectedExercise("");
    setExerciseFormData({
      duration: 0,
      reps: 0,
      rounds: 1,
      rest_per_round: 0,
      timePerRound: 0,
      estimated_calories_burned: 0,
      status: "Undone",
    });
  };

  const handleEditExercise = (index: number) => {
    const exercise = exercisesList[index];
    setEditingExerciseIndex(index);
    setIsAddingExercise(true);
    setSelectedExercise(exercise.exercise_id);
    setExerciseFormData({
      duration: exercise.duration,
      reps: exercise.reps,
      rounds: exercise.rounds,
      rest_per_round: exercise.rest_per_round,
      timePerRound: exercise.timePerRound,
      estimated_calories_burned: exercise.estimated_calories_burned,
      status: exercise.status,
    });
  };

  const handleDeleteExercise = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this exercise from the set?"
    );
    if (confirmed) {
      const newList = [...exercisesList];
      newList.splice(index, 1);
      setExercisesList(newList);
      form.setValue("numberOfExercises", newList.length);
    }
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercisesList.length - 1)
    ) {
      return;
    }

    const newList = [...exercisesList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap the exercises
    [newList[index], newList[targetIndex]] = [
      newList[targetIndex],
      newList[index],
    ];

    // Update order numbers
    newList.forEach((exercise, i) => {
      exercise.orderNumber = i;
    });

    setExercisesList(newList);
  };

  const handleSaveExercise = () => {
    if (!selectedExercise) {
      toast.error("Please select an exercise", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    // Find the exercise details
    const exerciseDetails = allExercises.find(
      (e) => e._id === selectedExercise
    );
    const exerciseName = exerciseDetails?.name || "Unknown Exercise";

    const newExercise = {
      _id:
        editingExerciseIndex !== null &&
        exercisesList[editingExerciseIndex]?._id
          ? exercisesList[editingExerciseIndex]._id
          : `temp-${Date.now()}`,
      exercise_id: selectedExercise,
      name: exerciseName,
      duration: Number(exerciseFormData.duration),
      reps: Number(exerciseFormData.reps),
      rounds: Number(exerciseFormData.rounds),
      timePerRound: Number(exerciseFormData.timePerRound),
      rest_per_round: Number(exerciseFormData.rest_per_round),
      estimated_calories_burned: Number(
        exerciseFormData.estimated_calories_burned
      ),
      status: exerciseFormData.status,
      orderNumber:
        editingExerciseIndex !== null
          ? exercisesList[editingExerciseIndex].orderNumber
          : exercisesList.length,
    };

    if (editingExerciseIndex !== null) {
      // Update existing exercise
      const newList = [...exercisesList];
      newList[editingExerciseIndex] = newExercise;
      setExercisesList(newList);
    } else {
      // Add new exercise
      setExercisesList([...exercisesList, newExercise]);
      form.setValue("numberOfExercises", exercisesList.length + 1);
    }

    setIsAddingExercise(false);
    setEditingExerciseIndex(null);
  };

  const calculateTotalCalories = () => {
    return exercisesList.reduce(
      (total, exercise) => total + (exercise.estimated_calories_burned || 0),
      0
    );
  };

  const calculateTotalDuration = () => {
    return exercisesList.reduce((total, exercise) => {
      const exerciseDuration =
        exercise.rounds * (exercise.duration + exercise.rest_per_round) -
        exercise.rest_per_round;
      return total + exerciseDuration;
    }, 0);
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return "0 seconds";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    }
    if (secs > 0) {
      parts.push(`${secs} ${secs === 1 ? "second" : "seconds"}`);
    }

    return parts.join(" ");
  };

  const submitForm = async (data: any) => {
    if (exercisesList.length === 0) {
      toast.error("Please add at least one exercise to the set", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageRes;
      if (backgroundImage[0]?.file) {
        imageRes = await mediaService.backupUploadImage(
          backgroundImage[0].file
        );
      }

      // Prepare the exercises for submission
      const exercisesToSubmit = exercisesList.map((ex, index) => ({
        _id: ex._id.startsWith("temp-") ? undefined : ex._id, // Don't send temporary IDs
        exercise_id: ex.exercise_id,
        duration: ex.duration,
        reps: ex.reps,
        rounds: ex.rounds,
        rest_per_round: ex.rest_per_round,
        timePerRound: ex.timePerRound,
        estimated_calories_burned: ex.estimated_calories_burned,
        status: ex.status,
        orderNumber: index, // Update the order to match current position
      }));

      const totalDuration = calculateTotalDuration();
      const totalCalories = calculateTotalCalories();

      const response = await setService.updateSet(exerciseSet._id, {
        name: data.name,
        type: data.type,
        description: data.description,
        number_of_exercises: exercisesList.length,
        set_exercises: exercisesToSubmit,
        time: formatTime(totalDuration),
        image: imageRes?.result?.url || exerciseSet.image,
        total_calories: totalCalories,
        is_youtube_workout: data.is_youtube_workout,
        youtube_id: data.is_youtube_workout ? data.youtube_id : null,
      });

      console.log("Exercise set updated successfully:", response);
      toast.success("Exercise set updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating exercise set:", error);
      toast.error("Failed to update exercise set. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="relative">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
                <TabsTrigger
                  value="details"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Step 1: Set Details
                  {hasDetailsErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="exercises"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Step 2: Exercises
                </TabsTrigger>

                <motion.div
                  className="absolute bottom-0 h-1 bg-primary rounded-full"
                  layout
                  initial={false}
                  animate={{ left: activeTab === "details" ? "0%" : "50%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: "50%" }}
                />
              </TabsList>
            </div>

            <CardContent className="pb-4">
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel
                    fieldTitle="Set Name"
                    nameInSchema="name"
                    placeholder="E.g., Full Body Workout"
                    className="w-full"
                    required
                  />
                  <SelectWithLabel
                    fieldTitle="Difficulty Level"
                    nameInSchema="type"
                    className="w-full"
                    required
                    data={[
                      { description: "Beginner", id: "Beginner" },
                      { description: "Intermediate", id: "Intermediate" },
                      { description: "Advanced", id: "Advanced" },
                    ]}
                  />
                </div>

                <TextAreaWithLabel
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="E.g., A comprehensive workout targeting all major muscle groups"
                  className="w-full min-h-32"
                />

                <div className="space-y-2">
                  <p className="text-base font-semibold">
                    Set Background Image
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload an image for the exercise set (max 20MB)
                  </p>
                  {exerciseSet.image && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Current image:</p>
                      <img
                        src={exerciseSet.image}
                        alt="Current set background"
                        className="w-48 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => setBackgroundImage(value)}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="is_youtube_workout"
                      {...form.register("is_youtube_workout")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="is_youtube_workout" className="text-sm">
                      This is a YouTube workout
                    </label>
                  </div>

                  {form.watch("is_youtube_workout") && (
                    <InputWithLabel
                      fieldTitle="YouTube Video ID"
                      nameInSchema="youtube_id"
                      placeholder="E.g., dQw4w9WgXcQ"
                      className="w-full md:w-1/2"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("exercises")}
                    disabled={hasDetailsErrors}
                  >
                    Continue to Exercises
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="exercises" className="mt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Exercises in Set</h3>
                    <p className="text-sm text-gray-500">
                      {exercisesList.length} exercise
                      {exercisesList.length !== 1 ? "s" : ""} added
                    </p>
                  </div>

                  <Button
                    onClick={handleAddExercise}
                    type="button"
                    className="flex items-center"
                    disabled={isAddingExercise}
                  >
                    <Plus size={16} className="mr-1" /> Add Exercise
                  </Button>
                </div>

                {isAddingExercise ? (
                  <Card className="p-5 border-2 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <h4 className="text-lg font-medium">
                        {editingExerciseIndex !== null
                          ? "Edit Exercise"
                          : "Add New Exercise"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingExercise(false)}
                      >
                        Cancel
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Select Exercise
                          </label>
                          <OptimizedSelect
                            value={selectedExercise}
                            onValueChange={(value) =>
                              setSelectedExercise(value)
                            }
                            options={exerciseOptions}
                            placeholder="Search and select an exercise..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Duration (seconds)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.duration}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                duration: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.reps}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                reps: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rounds
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.rounds}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                rounds: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rest per Round (seconds)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.rest_per_round}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                rest_per_round: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Time per Round (seconds)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.timePerRound}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                timePerRound: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Estimated Calories Burned
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 py-2 px-3"
                            value={exerciseFormData.estimated_calories_burned}
                            onChange={(e) =>
                              setExerciseFormData({
                                ...exerciseFormData,
                                estimated_calories_burned:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          type="button"
                          onClick={handleSaveExercise}
                          disabled={!selectedExercise}
                        >
                          {editingExerciseIndex !== null
                            ? "Update Exercise"
                            : "Add to Set"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {exercisesList.length > 0 ? (
                      exercisesList.map((exercise, index) => {
                        const exerciseDetails = allExercises.find(
                          (e) => e._id === exercise.exercise_id
                        );

                        return (
                          <Card key={index} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              {exerciseDetails?.image && (
                                <div className="w-full md:w-1/4">
                                  <img
                                    src={exerciseDetails.image}
                                    alt={exercise.name || "Exercise"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex-grow p-4">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium text-lg mb-1">
                                      {index + 1}.{" "}
                                      {exercise.name ||
                                        exerciseDetails?.name ||
                                        "Unknown Exercise"}
                                    </h4>
                                    {exerciseDetails?.category && (
                                      <Badge variant="outline" className="mb-2">
                                        {exerciseDetails.category}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleMoveExercise(index, "up")
                                      }
                                      disabled={index === 0}
                                    >
                                      <MoveUp size={18} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleMoveExercise(index, "down")
                                      }
                                      disabled={
                                        index === exercisesList.length - 1
                                      }
                                    >
                                      <MoveDown size={18} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditExercise(index)}
                                    >
                                      <Edit size={18} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        handleDeleteExercise(index)
                                      }
                                    >
                                      <Trash2 size={18} />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">
                                      Duration
                                    </p>
                                    <p className="font-medium">
                                      {exercise.duration}s
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">
                                      Reps
                                    </p>
                                    <p className="font-medium">
                                      {exercise.reps || "N/A"}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">
                                      Rounds
                                    </p>
                                    <p className="font-medium">
                                      {exercise.rounds}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">
                                      Calories
                                    </p>
                                    <p className="font-medium">
                                      {exercise.estimated_calories_burned}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500">
                                    Rest per round:
                                  </span>{" "}
                                  {exercise.rest_per_round}s
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 border rounded-lg bg-gray-50">
                        <p className="text-gray-600">
                          No exercises added to this set yet.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={handleAddExercise}
                        >
                          Add First Exercise
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {exercisesList.length > 0 && !isAddingExercise && (
                  <div className="border-t pt-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-1">Total Exercises</h4>
                        <p className="text-2xl font-bold">
                          {exercisesList.length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-1">Estimated Time</h4>
                        <p className="text-xl font-bold">
                          {formatTime(calculateTotalDuration())}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-1">
                          Total Calories Burned
                        </h4>
                        <p className="text-2xl font-bold">
                          {calculateTotalCalories()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Back to Details
                  </Button>
                </div>
              </TabsContent>
            </CardContent>

            <CardFooter className="py-4 border-t flex justify-between">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !isValid || isSubmitting || exercisesList.length === 0
                }
                className="px-6"
              >
                {isSubmitting ? "Updating..." : "Update Exercise Set"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default UpdateExerciseSetForm;
