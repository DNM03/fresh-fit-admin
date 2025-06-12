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
  Clock,
  Dumbbell,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  round: number;
  timePerRound: number;
  rest_per_round: number;
  estimated_calories_burned: number;
  status: string;
  orderNumber: number;
  exercise: Exercise;
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
    (ExerciseInSet & { name?: string; image?: string })[]
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
  const [exerciseFormData, setExerciseFormData] = useState<{
    duration: number | undefined;
    reps: number | undefined;
    round: number | undefined;
    rest_per_round: number | undefined;
    timePerRound: number | undefined;
    estimated_calories_burned: number | undefined;
    status: string;
  }>({
    duration: undefined,
    reps: undefined,
    round: undefined,
    rest_per_round: undefined,
    timePerRound: undefined,
    estimated_calories_burned: undefined,
    status: "Undone",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isYoutubeWorkout, setIsYoutubeWorkout] = useState<boolean>(
    exerciseSet?.is_youtube_workout || false
  );
  const [youtubeId, setYoutubeId] = useState<string>(
    exerciseSet?.youtube_id || ""
  );
  const [youtubeTime, setYoutubeTime] = useState<number>(
    exerciseSet?.time ? parseInt(exerciseSet.time) : 20
  );
  const [youtubeCalories, setYoutubeCalories] = useState<number>(
    exerciseSet?.total_calories || 400
  );

  const [exercisePagination, setExercisePagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoadingExercises, setIsLoadingExercises] = useState<boolean>(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState<string>("");

  const fetchExercises = async (page: number = 1, search: string = "") => {
    setIsLoadingExercises(true);
    try {
      const response = await exerciseService.searchExercise({
        page,
        limit: 20,
        search,
      });

      if (response.data?.result) {
        const { exercises, total_items, total_pages } = response.data.result;
        setAllExercises((prev) => {
          const existingIds = new Set(prev.map((e) => e._id));
          const uniqueNewExercises = exercises.filter(
            (e: any) => !existingIds.has(e._id)
          );
          return [...prev, ...uniqueNewExercises];
        });

        let options = exercises.map((exercise: Exercise) => ({
          id: exercise._id,
          description: exercise.name,
          _originalData: exercise,
        }));

        if (selectedExercise && selectedExercise !== "") {
          const isSelectedInOptions = options.some(
            (option: any) => option.id === selectedExercise
          );

          if (!isSelectedInOptions) {
            const selectedExerciseData = allExercises.find(
              (ex) => ex._id === selectedExercise
            );

            if (selectedExerciseData) {
              options = [
                {
                  id: selectedExercise,
                  description: selectedExerciseData.name,
                  _originalData: selectedExerciseData,
                },
                ...options,
              ];
            }
          }
        }

        setExerciseOptions(options);
        setExercisePagination({
          currentPage: page,
          totalItems: total_items || exercises.length,
          totalPages: total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      toast.error("Failed to load exercises");
    } finally {
      setIsLoadingExercises(false);
    }
  };

  useEffect(() => {
    if (selectedExercise && selectedExercise !== "") {
      const fetchExerciseDetails = async () => {
        const getExerciseById = await exerciseService.getExerciseById(
          selectedExercise
        );
        if (getExerciseById.data?.exercise) {
          const exerciseDetails = getExerciseById.data.exercise;

          const exerciseExists = exerciseOptions.some(
            (option) => option.id === selectedExercise
          );

          if (!exerciseExists) {
            setExerciseOptions((prev) => [
              ...prev,
              {
                id: selectedExercise,
                description: exerciseDetails.name || "Unknown Exercise",
                _originalData: exerciseDetails,
              },
            ]);
          } else {
            setExerciseOptions((prev) =>
              prev.map((option) =>
                option.id === selectedExercise
                  ? {
                      ...option,
                      description: exerciseDetails.name || "Unknown Exercise",
                      _originalData: exerciseDetails,
                    }
                  : option
              )
            );
          }

          setAllExercises((prev) => {
            const exists = prev.some((ex) => ex._id === exerciseDetails._id);
            if (!exists) {
              return [...prev, exerciseDetails];
            }
            return prev;
          });
        }
      };
      fetchExerciseDetails();
    }
  }, [selectedExercise]);

  const handleExercisePageChange = (page: number) => {
    fetchExercises(page, searchExerciseQuery);
  };

  const handleExerciseSearch = (term: string) => {
    setSearchExerciseQuery(term);
    fetchExercises(1, term);
  };

  useEffect(() => {
    fetchExercises(1);

    const initialExercises = exerciseSet.set_exercises.map((ex) => ({
      ...ex,
      name: ex.exercise.name || "Unknown Exercise",
      image: ex.exercise.image || "",
    }));

    setExercisesList(initialExercises);
  }, [exerciseSet._id]);

  useEffect(() => {
    if (allExercises.length > 0) {
      setExercisesList((prev) =>
        prev.map((ex) => {
          const exerciseDetails = allExercises.find(
            (e) => e._id === ex.exercise_id
          );

          return {
            ...ex,
            name: exerciseDetails?.name || ex.name || "Unknown Exercise",
          };
        })
      );
    }
  }, [allExercises]);

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
      .nonnegative("Must be 0 or greater"), // Changed from 'positive' to 'nonnegative'
    is_youtube_workout: z.boolean().optional().default(false),
    youtube_id: z.string().optional(),
  });

  const form = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors } = formState;

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
      duration: undefined,
      reps: undefined,
      round: undefined,
      rest_per_round: undefined,
      timePerRound: undefined,
      estimated_calories_burned: undefined,
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
      round: exercise.round,
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

  const handleSaveExercise = async () => {
    if (!selectedExercise) {
      toast.error("Please select an exercise", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    // Check that either reps or timePerRound is set, but not both
    if (
      (exerciseFormData.reps === 0 || !exerciseFormData.reps) &&
      (exerciseFormData.timePerRound === 0 || !exerciseFormData.timePerRound)
    ) {
      toast.error("Please set either Reps or Time per round", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    const exerciseDetails = await exerciseService.getExerciseById(
      selectedExercise
    );
    const exerciseName =
      exerciseDetails?.data.exercise.name || "Unknown Exercise";

    const newExercise = {
      _id:
        editingExerciseIndex !== null &&
        exercisesList[editingExerciseIndex]?._id
          ? exercisesList[editingExerciseIndex]._id
          : "",
      exercise_id: selectedExercise,
      name: exerciseName,
      duration: Number(exerciseFormData.duration),
      reps: Number(exerciseFormData.reps),
      round: Number(exerciseFormData.round),
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
      exercise: exerciseDetails.data.exercise || {
        _id: selectedExercise,
        name: exerciseName,
        description: "",
        image: "",
        category: "",
      },
    };

    if (editingExerciseIndex !== null) {
      const newList = [...exercisesList];
      newList[editingExerciseIndex] = newExercise;
      setExercisesList(newList);
    } else {
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

  function calculateTotalDuration() {
    return exercisesList.reduce((total, exercise) => {
      return total + (exercise.duration || 0);
    }, 0);
  }

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
    // For YouTube workouts, skip exercise validation
    if (!isYoutubeWorkout && exercisesList.length === 0) {
      toast.error("Please add at least one exercise to the set", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }
    console.log("Submitting form with data:", data);

    setIsSubmitting(true);

    try {
      let imageRes;
      if (backgroundImage[0]?.file) {
        imageRes = await mediaService.backupUploadImage(
          backgroundImage[0].file
        );
      }

      // For YouTube workouts, use different parameters
      const updateData = isYoutubeWorkout
        ? {
            name: data.name,
            type: data.type,
            description: data.description,
            number_of_exercises: 0, // No exercises for YouTube workout
            set_exercises: [], // Empty array for YouTube workout
            time: `${youtubeTime} minutes`,
            image: imageRes?.result?.url || exerciseSet.image,
            total_calories: youtubeCalories,
            is_youtube_workout: true,
            youtube_id: youtubeId,
          }
        : {
            name: data.name,
            type: data.type,
            description: data.description,
            number_of_exercises: exercisesList.length,
            set_exercises: exercisesList.map((ex, index) => ({
              _id: ex._id.startsWith("temp-") ? undefined : ex._id,
              exercise_id: ex.exercise_id,
              duration: ex.duration,
              reps: ex.reps,
              round: ex.round,
              rest_per_round: ex.rest_per_round,
              timePerRound: ex.timePerRound,
              estimated_calories_burned: ex.estimated_calories_burned,
              status: ex.status,
              orderNumber: index,
            })),
            time: formatTime(calculateTotalDuration()),
            image: imageRes?.result?.url || exerciseSet.image,
            total_calories: calculateTotalCalories(),
            is_youtube_workout: false,
            youtube_id: null,
          };

      console.log("ehehe");
      const response = await setService.updateSet(exerciseSet._id, updateData);

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

  const handleExerciseFormChange = (field: string, value: any) => {
    if (field === "reps" && Number(value) > 0) {
      // If reps is set, clear timePerRound
      setExerciseFormData((prev) => ({
        ...prev,
        [field]: parseInt(value) || 0,
        timePerRound: 0, // Reset timePerRound when reps is set
      }));
    } else if (field === "timePerRound" && Number(value) > 0) {
      // If timePerRound is set, clear reps
      setExerciseFormData((prev) => ({
        ...prev,
        [field]: parseInt(value) || 0,
        reps: 0, // Reset reps when timePerRound is set
      }));
    } else {
      // Normal handling for other fields
      setExerciseFormData((prev) => ({
        ...prev,
        [field]: field === "status" ? value : parseInt(value) || 0,
      }));
    }
  };

  // Sync the exercise count with form value any time exercisesList changes
  useEffect(() => {
    const exerciseCount = exercisesList.length;
    form.setValue("numberOfExercises", exerciseCount);
    // If the form was previously invalid due to this field, trigger validation
    if (errors.numberOfExercises) {
      form.trigger("numberOfExercises");
    }
  }, [exercisesList.length]);

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

                {/* Display estimated totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-end">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Estimated total:</span>
                      <div className="mt-1 flex space-x-4">
                        {isYoutubeWorkout ? (
                          <>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{youtubeTime} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <Dumbbell className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{youtubeCalories} calories</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              <span>
                                {formatTime(calculateTotalDuration())}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Dumbbell className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{calculateTotalCalories()} calories</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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

                {/* Add YouTube workout toggle with Switch component */}
                <div className="flex flex-col space-y-2 border-t border-b py-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="youtube-workout"
                      checked={isYoutubeWorkout}
                      onCheckedChange={(checked) => {
                        setIsYoutubeWorkout(checked);
                        form.setValue("is_youtube_workout", checked);
                      }}
                    />
                    <Label htmlFor="youtube-workout" className="font-medium">
                      This is a YouTube workout
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-9">
                    Use a YouTube video instead of adding individual exercises
                  </p>
                </div>

                {/* Show YouTube fields when toggle is on */}
                {isYoutubeWorkout && (
                  <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                    <h3 className="font-medium">YouTube Video Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          YouTube Video ID{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-md p-2"
                          value={youtubeId}
                          onChange={(e) => {
                            setYoutubeId(e.target.value);
                            form.setValue("youtube_id", e.target.value);
                          }}
                          placeholder="e.g. fqCeYdMCnFs"
                          required={isYoutubeWorkout}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The part after "v=" in YouTube URLs
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Video Duration (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md p-2"
                          min={1}
                          value={youtubeTime}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 20;
                            setYoutubeTime(value);
                          }}
                          placeholder="e.g. 20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Estimated Calories
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-md p-2"
                        min={1}
                        value={youtubeCalories}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 400;
                          setYoutubeCalories(value);
                        }}
                        placeholder="e.g. 400"
                      />
                    </div>

                    {youtubeId && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Preview</h4>
                        <div className="aspect-video bg-black rounded-md overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {/* Only show "Continue to Exercises" if not a YouTube workout */}
                  {isYoutubeWorkout ? (
                    <Button
                      type="submit"
                      disabled={!youtubeId || hasDetailsErrors || isSubmitting}
                      className="bg-primary hover:opacity-80"
                      onClick={(e) => {
                        // Prevent default to handle submission manually
                        e.preventDefault();

                        // Validate required fields
                        if (!youtubeId) {
                          toast.error("YouTube video ID is required", {
                            style: {
                              background: "#cc3131",
                              color: "#fff",
                            },
                          });
                          return;
                        }

                        // Get form data and submit
                        const data = form.getValues();
                        submitForm(data);
                      }}
                    >
                      {isSubmitting
                        ? "Updating..."
                        : "Update YouTube Exercise Set"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("exercises")}
                      disabled={hasDetailsErrors}
                    >
                      Continue to Exercises
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* The exercises TabsContent should only be accessible if not a YouTube workout */}
              <TabsContent value="exercises" className="mt-0 space-y-4">
                {/* Show message when YouTube workout is enabled */}
                {isYoutubeWorkout ? (
                  <div className="text-center py-12 border rounded-lg">
                    <div className="text-amber-500 mb-4">
                      <AlertCircle className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      YouTube Workout Mode Enabled
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Individual exercises are not required when using a YouTube
                      workout. Please return to the details tab to configure
                      your YouTube workout.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Return to Details
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Your existing exercise list content */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">
                          Exercises in Set
                        </h3>
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
                            type="button"
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
                                useServerPagination={true}
                                currentPage={exercisePagination.currentPage}
                                totalItems={exercisePagination.totalItems}
                                totalPages={exercisePagination.totalPages}
                                isLoading={isLoadingExercises}
                                onPageChange={handleExercisePageChange}
                                onSearch={handleExerciseSearch}
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
                                placeholder="E.g., 60"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Reps
                              </label>
                              <input
                                type="number"
                                min="0"
                                className={`w-full rounded-md border border-gray-300 py-2 px-3 ${
                                  (exerciseFormData.timePerRound ?? 0) > 0
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }`}
                                value={exerciseFormData.reps}
                                disabled={
                                  (exerciseFormData.timePerRound ?? 0) > 0
                                }
                                onChange={(e) =>
                                  handleExerciseFormChange(
                                    "reps",
                                    e.target.value
                                  )
                                }
                                placeholder="E.g., 10"
                              />
                              {(exerciseFormData.timePerRound ?? 0) > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Cannot set reps when time per round is set
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Rounds
                              </label>
                              <input
                                type="number"
                                min="1"
                                className="w-full rounded-md border border-gray-300 py-2 px-3"
                                value={exerciseFormData.round}
                                onChange={(e) =>
                                  setExerciseFormData({
                                    ...exerciseFormData,
                                    round: parseInt(e.target.value) || 1,
                                  })
                                }
                                placeholder="E.g., 3"
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
                                    rest_per_round:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="E.g., 30"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Time per Round (seconds)
                              </label>
                              <input
                                type="number"
                                min="0"
                                className={`w-full rounded-md border border-gray-300 py-2 px-3 ${
                                  (exerciseFormData.reps ?? 0) > 0
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }`}
                                value={exerciseFormData.timePerRound}
                                disabled={(exerciseFormData.reps ?? 0) > 0}
                                onChange={(e) =>
                                  handleExerciseFormChange(
                                    "timePerRound",
                                    e.target.value
                                  )
                                }
                                placeholder="E.g., 20"
                              />
                              {(exerciseFormData.reps ?? 0) > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Cannot set time per round when reps is set
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Estimated Calories Burned
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="w-full rounded-md border border-gray-300 py-2 px-3"
                                value={
                                  exerciseFormData.estimated_calories_burned
                                }
                                onChange={(e) =>
                                  setExerciseFormData({
                                    ...exerciseFormData,
                                    estimated_calories_burned:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="E.g., 100"
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
                                  {(exercise?.image ||
                                    exerciseDetails?.image) && (
                                    <div className="w-full md:w-1/4">
                                      <img
                                        src={
                                          exercise.image ||
                                          exerciseDetails?.image ||
                                          ""
                                        }
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
                                          <Badge
                                            variant="outline"
                                            className="mb-2"
                                          >
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
                                          type="button"
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
                                          type="button"
                                        >
                                          <MoveDown size={18} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditExercise(index)
                                          }
                                          type="button"
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
                                          type="button"
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
                                          {exercise.reps || "0"}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">
                                          Rounds
                                        </p>
                                        <p className="font-medium">
                                          {exercise.round || "0"}
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
                              type="button"
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
                            <h4 className="font-medium mb-1">
                              Total Exercises
                            </h4>
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
                  </div>
                )}
              </TabsContent>
            </CardContent>

            <CardFooter className="py-4 border-t flex justify-between">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button
                type="button" // Changed from submit to button to handle it manually
                disabled={
                  isSubmitting || isYoutubeWorkout || exercisesList.length === 0
                }
                className="px-6"
                onClick={() => {
                  if (isYoutubeWorkout) {
                    // For YouTube workout, validate YouTube ID
                    if (!youtubeId) {
                      toast.error("YouTube video ID is required", {
                        style: {
                          background: "#cc3131",
                          color: "#fff",
                        },
                      });
                      return;
                    }
                  } else {
                    // For standard workout, validate exercises
                    if (exercisesList.length === 0) {
                      toast.error(
                        "Please add at least one exercise to the set",
                        {
                          style: {
                            background: "#cc3131",
                            color: "#fff",
                          },
                        }
                      );
                      return;
                    }
                  }

                  // Get form data and manually submit
                  const data = form.getValues();
                  submitForm(data);
                }}
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
