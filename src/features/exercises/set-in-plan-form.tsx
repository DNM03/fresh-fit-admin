"use client";

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

type SetType = {
  id: string;
  name: string;
  estimatedCaloriesBurned: number;
};

type SetInPlanType = {
  setId: string;
  week: number;
  day: number;
  caloriesBurned: number;
};

type Props = {
  setOptions: SetType[];
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
    setId: "",
    week: 1,
    day: 1,
    caloriesBurned: 0,
  };

  const [formState, setFormState] = useState<SetInPlanType>(defaultFormState);
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  // Generate days based on week selection (assuming 7 days per week)
  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => i + 1);
    setAvailableDays(days);
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingSetId) {
      setSetsList((prev) => {
        const existingSet = prev.find((set) => set.id === editingSetId);
        if (existingSet) {
          setFormState({
            setId: existingSet.setId,
            week: existingSet.week,
            day: existingSet.day,
            caloriesBurned: existingSet.caloriesBurned,
          });
        }
        return prev;
      });
    }
  }, [editingSetId, setSetsList]);

  // Auto-populate calories when set is selected
  useEffect(() => {
    if (formState.setId) {
      const selectedSet = setOptions.find((set) => set.id === formState.setId);
      if (selectedSet) {
        setFormState((prev) => ({
          ...prev,
          caloriesBurned: selectedSet.estimatedCaloriesBurned,
        }));
      }
    }
  }, [formState.setId, setOptions]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "setId" ? value : Number(value),
    }));
  };

  const handleDayChange = (day: number) => {
    setFormState((prev) => ({
      ...prev,
      day: day,
    }));
  };

  function submitSetForm() {
    if (!formState.setId) {
      alert("Please select a set");
      return;
    }

    if (!formState.day) {
      alert("Please select a day");
      return;
    }

    const selectedSet = setOptions.find((set) => set.id === formState.setId);

    if (editingSetId) {
      setSetsList((prev) =>
        prev.map((set) =>
          set.id === editingSetId
            ? {
                ...formState,
                id: set.id,
                name: selectedSet?.name || set.name,
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
          name: selectedSet?.name || "Unknown Set",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <Label className="block text-sm font-medium mb-1">Select Set</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({
                target: { name: "setId", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            value={formState.setId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a set" />
            </SelectTrigger>
            <SelectContent>
              {setOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
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

        <div className="w-full md:col-span-2">
          <Label className="block text-sm font-medium mb-2">Day</Label>
          <div className="flex flex-wrap gap-3">
            {availableDays.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`day-${day}`}
                  name="day"
                  value={day}
                  checked={formState.day === day}
                  onChange={() => handleDayChange(day)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <Label htmlFor={`day-${day}`} className="cursor-pointer">
                  Day {day}
                </Label>
              </div>
            ))}
          </div>
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
          />
        </div>
      </div>

      {startDate && endDate && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Plan duration: {totalWeeks} weeks ({startDate.toLocaleDateString()}{" "}
            - {endDate.toLocaleDateString()})
          </p>
        </div>
      )}

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
          {editingSetId ? "Update Set" : "Add Set to Plan"}
        </Button>
      </div>
    </Card>
  );
}

export default SetInPlanForm;
