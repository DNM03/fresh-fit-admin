import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Utensils } from "lucide-react";
import mealService from "@/services/meal.service"; // Import the meal service

type MealType = {
  _id: string;
  name: string;
  calories: number;
};

type MealSelectorProps = {
  availableMeals?: MealType[];
  selectedMeals: MealType[];
  onAddMeal: (meal: MealType) => void;
  onRemoveMeal: (mealId: string) => void;
  dayId?: string;
};

export default function MealSelector({
  availableMeals = [],
  selectedMeals,
  onAddMeal,
  onRemoveMeal,
  dayId,
}: MealSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);

  const [meals, setMeals] = useState<MealType[]>(availableMeals);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 8,
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setSelectedMealIds([]);
    }
  }, [dialogOpen]);

  // Fetch meals from API
  const fetchMeals = async (page = 1, search = "") => {
    try {
      setIsLoading(true);

      // Call the API to get meals
      const response = await mealService.getMeals({
        page,
        limit: pagination.limit,
        search,
        type: "System",
        meal_type: "All",
      });

      if (response.data?.result) {
        const {
          meals: fetchedMeals,
          page: currentPage,
          total_items,
          total_pages,
          limit,
        } = response.data.result;

        setMeals(fetchedMeals);
        setPagination({
          currentPage,
          totalPages: total_pages,
          totalItems: total_items,
          limit,
        });
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchMeals(1, debouncedSearchQuery);
    }
  }, [dialogOpen, debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchMeals(newPage, debouncedSearchQuery);
  };

  const handleCheckboxChange = (mealId: string) => {
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleAddSelected = () => {
    selectedMealIds.forEach((id) => {
      const meal = meals.find((m) => m._id === id);
      if (meal && !selectedMeals.some((m) => m._id === id)) {
        onAddMeal(meal);
      }
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium flex items-center">
          <Utensils className="mr-2 h-4 w-4 text-amber-600" />
          Meals
        </Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open && meals.length === 0) {
              fetchMeals(1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add Meals {dayId ? `to Day ${dayId.split("-").pop()}` : ""}
              </DialogTitle>
              <DialogDescription>
                Select one or more meals to add.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between my-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading meals...</span>
                </div>
              ) : meals.length > 0 ? (
                meals.map((meal) => (
                  <div
                    key={meal._id}
                    className={`border p-3 rounded-md cursor-pointer ${
                      selectedMealIds.includes(meal._id)
                        ? "border-amber-500 bg-amber-50"
                        : ""
                    }`}
                    onClick={() => handleCheckboxChange(meal._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-gray-500">
                          {meal.calories} calories
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedMealIds.includes(meal._id)
                            ? "border-amber-500 bg-amber-500 text-white"
                            : ""
                        }`}
                      >
                        {selectedMealIds.includes(meal._id) && (
                          <Checkbox
                            checked
                            className="h-3.5 w-3.5 text-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">
                    No meals found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className="ml-2">
                  ({pagination.totalItems} meals total)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    isLoading
                  }
                >
                  Next
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                className="bg-amber-600 hover:bg-amber-700"
                disabled={selectedMealIds.length === 0 || isLoading}
              >
                Add Selected ({selectedMealIds.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedMeals.length > 0 ? (
        <div className="space-y-2">
          {selectedMeals.map((meal) => (
            <Card key={meal._id} className="p-2 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{meal.name}</div>
                  <div className="text-xs text-gray-500">
                    {meal.calories} calories
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => onRemoveMeal(meal._id)}
                >
                  <X size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p>No meals added yet</p>
        </div>
      )}
    </div>
  );
}
