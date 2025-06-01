import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import OptimizedSelect from "@/components/ui/optimized-select";
import { v4 as uuidv4 } from "uuid";

// type SetType = {
//   id: string;
//   name: string;
//   estimatedCaloriesBurned: number;
// };

type SetInPlanType = {
  planId: string;
  week: number;
  day: number;
  caloriesBurned: number;
  sets: any[];
  name?: string;
};

type Props = {
  setOptions: any[];
  editingSetId: string | null;
  setSetsList: React.Dispatch<
    React.SetStateAction<(SetInPlanType & { id: string; name: string })[]>
  >;
  setEditingSetId: React.Dispatch<React.SetStateAction<string | null>>;
  setAddingSet: React.Dispatch<React.SetStateAction<boolean>>;
  totalWeeks: number;
  startDate?: Date;
  endDate?: Date;
};

function SetInPlanForm({
  setOptions,
  editingSetId,
  setSetsList,
  setEditingSetId,
  setAddingSet,
  totalWeeks,
  startDate,
  endDate,
}: Props) {
  const defaultFormState: SetInPlanType = {
    planId: uuidv4(),
    week: 1,
    day: 1,
    caloriesBurned: 0,
    sets: [],
    name: "",
  };

  const [formState, setFormState] = useState<SetInPlanType>(defaultFormState);
  // const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedSets, setSelectedSets] = useState<
    {
      id: string;
      description: string;
      total_calories: number;
      numberOfExercises: number;
      type: string;
    }[]
  >([]);
  const [selectedSet, setSelectedSet] = useState<string>("");

  // useEffect(() => {
  //   const days = Array.from({ length: 7 }, (_, i) => i + 1);
  //   setAvailableDays(days);
  // }, []);

  useEffect(() => {
    if (editingSetId) {
      setSetsList((prev) => {
        const existingSet = prev.find(
          (planDetail) => planDetail.id === editingSetId
        );
        if (existingSet) {
          setFormState({
            planId: existingSet.planId,
            week: existingSet.week,
            day: existingSet.day,
            caloriesBurned: existingSet.caloriesBurned,
            sets: existingSet.sets,
            name: existingSet.name,
          });
        }
        return prev;
      });
    }
  }, [editingSetId, setSetsList]);

  useEffect(() => {
    if (selectedSets.length > 0) {
      const totalCalories = selectedSets.reduce(
        (acc, set) => acc + set.total_calories,
        0
      );
      if (totalCalories > 0) {
        setFormState((prev) => ({
          ...prev,
          caloriesBurned: totalCalories,
        }));
      }
    }
  }, [formState.planId, setOptions, selectedSets]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "setId" ? value : Number(value),
    }));
  };

  // const handleDayChange = (day: number) => {
  //   setFormState((prev) => ({
  //     ...prev,
  //     day: day,
  //   }));
  // };

  function submitSetForm() {
    console.log(formState);
    if (!formState.planId) {
      alert("Please select a set");
      return;
    }

    if (!formState.day) {
      alert("Please select a day");
      return;
    }

    if (editingSetId) {
      setSetsList((prev) =>
        prev.map((set) =>
          set.id === editingSetId
            ? {
                ...formState,
                id: set.id,
                name: formState.name || set.name,
              }
            : set
        )
      );
      setEditingSetId(null);
    } else {
      setSetsList((prev) => [
        ...prev,
        {
          ...formState,
          id: Date.now().toString(),
          name: formState.name || "Unknown Set",
        },
      ]);
    }
    setFormState(defaultFormState);
    setAddingSet(false);
  }

  function cancelAddEdit() {
    setFormState(defaultFormState);
    setAddingSet(false);
    setEditingSetId(null);
  }

  return (
    <Card className="p-5 border-2 border-green-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-primary">
          {editingSetId ? "Edit Set in Plan" : "Add New Set to Plan"}
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
      <div>
        <Label className="block text-sm font-medium mb-1">Set Name</Label>
        <Input
          placeholder="Eg, Top body workout"
          className="w-full"
          onChange={(e) => {
            setFormState((prev) => ({
              ...prev,
              name: e.target.value,
            }));
          }}
          value={formState.name}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">Day</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({
                target: { name: "day", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            value={formState.day.toString()}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  Day {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">Week</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({
                target: { name: "week", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            value={formState.week.toString()}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                (week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">
            Calories Burned
          </Label>
          <Input
            type="number"
            name="caloriesBurned"
            value={formState.caloriesBurned}
            onChange={handleInputChange}
            placeholder="Estimated calories burned"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            readOnly
          />
        </div>
      </div>
      {startDate && endDate && (
        <div className="mb-4 text-sm text-muted-foreground">
          <p>
            Plan duration: {totalWeeks} weeks ({startDate.toLocaleDateString()}{" "}
            - {endDate.toLocaleDateString()})
          </p>
        </div>
      )}

      <div className="w-full">
        <Label className="block text-sm font-medium mb-1">Select Set</Label>
        <div className="flex flex-row items-center gap-4 w-full">
          <OptimizedSelect
            value={selectedSet}
            onValueChange={(value) => setSelectedSet(value)}
            options={setOptions}
          />
          <Button
            type="button"
            className="mb-2"
            onClick={() => {
              setSelectedSets((prev) => {
                const selectedSetTemp = setOptions.find(
                  (set) => set.id === selectedSet
                );
                if (selectedSet) {
                  const exists = prev.some(
                    (set) => set.id === selectedSetTemp.id
                  );
                  if (exists) {
                    return prev;
                  }
                  return [...prev, { ...selectedSetTemp }];
                }
                return prev;
              });
            }}
          >
            Add set
          </Button>
        </div>
      </div>

      <div>
        <Label className="block text-sm font-medium mb-1">Selected Sets</Label>
        <div className="flex flex-col gap-2">
          {selectedSets.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{set.description}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {set.type}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span className="flex items-center">
                    <span className="font-semibold text-primary mr-1">
                      {set.total_calories}
                    </span>{" "}
                    calories
                  </span>
                  <span className="flex items-center">
                    <span className="font-semibold text-primary mr-1">
                      {set.numberOfExercises}
                    </span>{" "}
                    exercises
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() =>
                  setSelectedSets((prev) => prev.filter((s) => s.id !== set.id))
                }
              >
                Remove
              </Button>
            </div>
          ))}
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
          onClick={submitSetForm}
          className="bg-primary hover:opacity-70"
        >
          {editingSetId ? "Update Sets" : "Add Sets to Plan"}
        </Button>
      </div>
    </Card>
  );
}

export default SetInPlanForm;
