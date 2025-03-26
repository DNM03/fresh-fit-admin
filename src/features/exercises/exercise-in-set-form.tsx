import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateExerciseInSetType } from "@/constants/types";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
  exerciseOptions: { id: string; description: string }[];
  editingExerciseId: string | null;
  setExercisesList: React.Dispatch<
    React.SetStateAction<
      (CreateExerciseInSetType & { id: string; name: string })[]
    >
  >;
  setEditingExerciseId: React.Dispatch<React.SetStateAction<string | null>>;
  setAddingExercise: React.Dispatch<React.SetStateAction<boolean>>;
};

function ExerciseInSetForm({
  exerciseOptions,
  editingExerciseId,
  setExercisesList,
  setEditingExerciseId,
  setAddingExercise,
}: Props) {
  const defaultFormState: CreateExerciseInSetType = {
    exerciseId: "",
    duration: 0,
    reps: 0,
    rounds: 0,
    restPerRound: 0,
    estimatedCaloriesBurned: 0,
  };

  const [formState, setFormState] =
    useState<CreateExerciseInSetType>(defaultFormState);

  useEffect(() => {
    if (editingExerciseId) {
      setExercisesList((prev) => {
        const existingExercise = prev.find((ex) => ex.id === editingExerciseId);
        if (existingExercise) {
          setFormState({
            exerciseId: existingExercise.exerciseId,
            duration: existingExercise.duration,
            reps: existingExercise.reps,
            rounds: existingExercise.rounds,
            restPerRound: existingExercise.restPerRound,
            estimatedCaloriesBurned: existingExercise.estimatedCaloriesBurned,
          });
        }
        return prev;
      });
    }
  }, [editingExerciseId, setExercisesList]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "exerciseId" ? value : Number(value),
    }));
  };

  function submitExerciseForm() {
    console.log("Exercise data:", formState);

    if (!formState.exerciseId) {
      alert("Please select an exercise");
      return;
    }

    const selectedExercise = exerciseOptions.find(
      (exercise) => exercise.id === formState.exerciseId
    );

    if (editingExerciseId) {
      setExercisesList((prev) =>
        prev.map((ex) =>
          ex.id === editingExerciseId
            ? {
                ...formState,
                id: ex.id,
                name: selectedExercise?.description || ex.name,
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
          id: Date.now().toString(),
          name: selectedExercise?.description || "Unknown Exercise",
        },
      ]);
    }
    setFormState(defaultFormState);
    setAddingExercise(false);
  }

  function cancelAddEdit() {
    setFormState(defaultFormState);
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
        >
          <X size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Exercise Type
          </Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({
                target: { name: "exerciseId", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            value={formState.exerciseId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exerciseOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label className="block text-sm font-medium mb-1">Reps</Label>
          <Input
            type="number"
            name="reps"
            value={formState.reps}
            onChange={handleInputChange}
            placeholder="Eg, 5 reps"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
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
            name="restPerRound"
            value={formState.restPerRound}
            onChange={handleInputChange}
            placeholder="Eg, 15 seconds"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Estimated Calories Burned
          </Label>
          <Input
            type="number"
            name="estimatedCaloriesBurned"
            value={formState.estimatedCaloriesBurned}
            onChange={handleInputChange}
            placeholder="Eg, 100 calories"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
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
