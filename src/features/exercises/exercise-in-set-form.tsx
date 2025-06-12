import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateExerciseInSetType } from "@/constants/types";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import OptimizedSelect from "@/components/ui/optimized-select";
import { toast } from "sonner";

type Props = {
  exerciseOptions: { id: string; description: string }[];
  editingExerciseId: string | null;
  setExercisesList: React.Dispatch<
    React.SetStateAction<
      (CreateExerciseInSetType & { _id: string; name: string })[]
    >
  >;
  setEditingExerciseId: React.Dispatch<React.SetStateAction<string | null>>;
  setAddingExercise: React.Dispatch<React.SetStateAction<boolean>>;
  // Add these new props
  isLoadingExercises: boolean;
  exercisePagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
  onExercisePageChange: (page: number) => void;
  onExerciseSearch: (term: string) => void;
  // Add this prop to get detailed exercise info if needed
  getExerciseById?: (id: string) => Promise<any>;
};

function ExerciseInSetForm({
  exerciseOptions,
  editingExerciseId,
  setExercisesList,
  setEditingExerciseId,
  setAddingExercise,
  // Include the new props
  isLoadingExercises,
  exercisePagination,
  onExercisePageChange,
  onExerciseSearch,
  getExerciseById,
}: Props) {
  const defaultFormState: CreateExerciseInSetType = {
    exercise_id: "",
    duration: undefined,
    reps: undefined,
    rounds: undefined,
    rest_per_round: undefined,
    estimated_calories_burned: undefined,
    timePerRound: undefined,
    orderNumber: undefined,
  };

  const [formState, setFormState] =
    useState<CreateExerciseInSetType>(defaultFormState);
  const [displayOptions, setDisplayOptions] = useState<
    { id: string; description: string }[]
  >([]);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<{
    id: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    let newOptions = [...exerciseOptions];

    if (formState.exercise_id && selectedExerciseDetails) {
      const selectedExists = newOptions.some(
        (option) => option.id === formState.exercise_id
      );
      if (!selectedExists) {
        newOptions = [selectedExerciseDetails, ...newOptions];
      }
    }

    setDisplayOptions(newOptions);
  }, [exerciseOptions, formState.exercise_id, selectedExerciseDetails]);

  useEffect(() => {
    if (editingExerciseId) {
      setExercisesList((prev) => {
        const existingExercise = prev.find(
          (ex) => ex._id === editingExerciseId
        );
        if (existingExercise) {
          setFormState({
            exercise_id: existingExercise.exercise_id,
            duration: existingExercise.duration,
            reps: existingExercise.reps,
            rounds: existingExercise.rounds,
            rest_per_round: existingExercise.rest_per_round,
            estimated_calories_burned:
              existingExercise.estimated_calories_burned,
            timePerRound: existingExercise.timePerRound,
            orderNumber: existingExercise.orderNumber,
          });

          if (existingExercise.exercise_id && existingExercise.name) {
            setSelectedExerciseDetails({
              id: existingExercise.exercise_id,
              description: existingExercise.name,
            });
          }
        }
        return prev;
      });
    }
  }, [editingExerciseId, setExercisesList]);

  const handleExerciseSelect = async (exerciseId: string) => {
    const exerciseInOptions = exerciseOptions.find(
      (ex) => ex.id === exerciseId
    );

    if (exerciseInOptions) {
      setSelectedExerciseDetails(exerciseInOptions);
    } else if (getExerciseById && exerciseId) {
      try {
        const exerciseData = await getExerciseById(exerciseId);
        if (exerciseData) {
          setSelectedExerciseDetails({
            id: exerciseId,
            description: exerciseData.name || "Unknown Exercise",
          });
        }
      } catch (error) {
        console.error("Error fetching exercise details:", error);
      }
    }

    setFormState((prev) => ({
      ...prev,
      exercise_id: exerciseId,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);

    if (name === "reps" && Number(value) > 0) {
      setFormState((prev) => ({
        ...prev,
        [name]: Number(value),
        timePerRound: 0,
      }));
    } else if (name === "timePerRound" && Number(value) > 0) {
      setFormState((prev) => ({
        ...prev,
        [name]: Number(value),
        reps: 0,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: name === "exercise_id" ? value : Number(value),
      }));
    }
  };

  function submitExerciseForm() {
    console.log("Exercise data:", formState);

    if (!formState.exercise_id) {
      toast.error("Please select an exercise", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    const numericFields = [
      "duration",
      "reps",
      "rounds",
      "rest_per_round",
      "estimated_calories_burned",
      "timePerRound",
    ];

    const requiredFields = [
      "duration",
      "reps",
      "rounds",
      "rest_per_round",
      "estimated_calories_burned",
      "timePerRound",
    ];
    for (const field of requiredFields) {
      const value = formState[field as keyof typeof formState];
      if (value === undefined || value === null) {
        toast.error(
          `${field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} is required`,
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

    for (const field of numericFields) {
      const value = formState[field as keyof typeof formState];
      if (value !== undefined && value !== null && Number(value) < 0) {
        toast.error(
          `${field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} cannot be negative`,
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

    if (
      (formState.reps === 0 || !formState.reps) &&
      (formState.timePerRound === 0 || !formState.timePerRound)
    ) {
      toast.error("Please set either Reps or Time per round", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    let exerciseName = "Unknown Exercise";
    const selectedExercise = displayOptions.find(
      (exercise) => exercise.id === formState.exercise_id
    );

    if (selectedExercise) {
      exerciseName = selectedExercise.description;
    } else if (
      selectedExerciseDetails &&
      selectedExerciseDetails.id === formState.exercise_id
    ) {
      exerciseName = selectedExerciseDetails.description;
    }

    if (editingExerciseId) {
      setExercisesList((prev) =>
        prev.map((ex) =>
          ex._id === editingExerciseId
            ? {
                ...formState,
                _id: ex._id,
                name: exerciseName,
              }
            : ex
        )
      );
      setEditingExerciseId(null);
    } else {
      setExercisesList((prev) => [
        ...prev,
        {
          ...formState,
          _id: Date.now().toString(),
          name: exerciseName,
        },
      ]);
    }
    setFormState(defaultFormState);
    setSelectedExerciseDetails(null);
    setAddingExercise(false);
  }

  function cancelAddEdit() {
    setFormState(defaultFormState);
    setSelectedExerciseDetails(null);
    setAddingExercise(false);
    setEditingExerciseId(null);
  }

  return (
    <Card className="p-5 border-2 border-green-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-primary">
          {editingExerciseId ? "Edit Exercise" : "Add New Exercise"}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelAddEdit}
          className="text-gray-500"
          type="button"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full col-span-2">
          <Label className="block text-sm font-medium mb-1">Exercise</Label>
          <OptimizedSelect
            value={formState.exercise_id}
            onValueChange={(value) => {
              console.log("Selected exercise ID:", value);
              handleExerciseSelect(value);
            }}
            options={displayOptions}
            placeholder="Search and select an exercise..."
            useServerPagination={true}
            currentPage={exercisePagination.currentPage}
            totalItems={exercisePagination.totalItems}
            totalPages={exercisePagination.totalPages}
            isLoading={isLoadingExercises}
            onPageChange={onExercisePageChange}
            onSearch={onExerciseSearch}
          />
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Duration (seconds)
          </Label>
          <input
            type="number"
            name="duration"
            value={formState.duration}
            onChange={handleInputChange}
            placeholder="Eg, 100 seconds"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Estimated Calories Burned
          </Label>
          <Input
            type="number"
            name="estimated_calories_burned"
            value={formState.estimated_calories_burned}
            onChange={handleInputChange}
            placeholder="Eg, 100 calories"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        {/* Reps field */}
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">Reps</Label>
          <Input
            type="number"
            name="reps"
            value={formState.reps}
            onChange={handleInputChange}
            placeholder="Eg, 5 reps"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            disabled={
              formState.timePerRound ? formState.timePerRound > 0 : false
            }
          />
          {formState.timePerRound !== undefined &&
            formState.timePerRound > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Disabled when Time per round is set
              </p>
            )}
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">Rounds</Label>
          <Input
            type="number"
            name="rounds"
            value={formState.rounds}
            onChange={handleInputChange}
            placeholder="Eg, 3 rounds"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Rest per round (seconds)
          </Label>
          <Input
            type="number"
            name="rest_per_round"
            value={formState.rest_per_round}
            onChange={handleInputChange}
            placeholder="Eg, 15 seconds"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        {/* Time per round field */}
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Time per round (seconds)
          </Label>
          <Input
            type="number"
            name="timePerRound"
            value={formState.timePerRound}
            onChange={handleInputChange}
            placeholder="Eg, 15 seconds"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            disabled={formState.reps ? formState.reps > 0 : false}
          />
          {formState.reps !== undefined && formState.reps > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Disabled when Reps is set
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={cancelAddEdit}
          className="mr-2"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={submitExerciseForm}
          className="bg-green-600 hover:bg-green-700"
        >
          {editingExerciseId ? "Update Exercise" : "Add Exercise"}
        </Button>
      </div>
    </Card>
  );
}

export default ExerciseInSetForm;
