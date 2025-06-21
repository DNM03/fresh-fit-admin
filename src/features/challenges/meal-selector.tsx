import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Utensils } from "lucide-react";
import mealService from "@/services/meal.service";
import { toast } from "sonner";

type MealType = {
  _id: string;
  name: string;
  calories: number;
  meal_type?: string;
};

type MealSelectorProps = {
  availableMeals?: MealType[];
  selectedMeals: MealType[];
  onAddMeal: (meal: MealType) => void;
  onRemoveMeal: (meal: any) => void;
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
  const [sortBy, setSortBy] = useState("name");
  const [orderBy, setOrderBy] = useState("asc");
  const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null);

  // Add states for calories range filter
  const [minCalories, setMinCalories] = useState<string>("");
  const [maxCalories, setMaxCalories] = useState<string>("");
  const [caloriesFilter, setCaloriesFilter] = useState<{
    min?: number;
    max?: number;
  } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const [meals, setMeals] = useState<MealType[]>(availableMeals);
  const [loadedMeals, setLoadedMeals] = useState<MealType[]>(availableMeals);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 8,
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Calculate what meal types are already selected
  const selectedMealTypes = useMemo(() => {
    const types: Record<string, boolean> = {};
    selectedMeals.forEach((meal) => {
      if (meal.meal_type) {
        types[meal.meal_type] = true;
      }
    });
    return types;
  }, [selectedMeals]);

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
      setFilterOpen(false);
    }
  }, [dialogOpen]);

  // Fetch meals from API
  const fetchMeals = async (page = 1, search = "") => {
    try {
      setIsLoading(true);

      // Call the API to get meals with sorting parameters
      const requestParams: any = {
        page,
        limit: pagination.limit,
        search,
        type: "System",
        meal_type: mealTypeFilter || "All",
        sort_by: sortBy,
        order_by: orderBy.toUpperCase(),
      };

      // Add calories filter parameters if they exist
      if (caloriesFilter) {
        if (caloriesFilter.min !== undefined) {
          requestParams.min_calories = caloriesFilter.min;
        }
        if (caloriesFilter.max !== undefined) {
          requestParams.max_calories = caloriesFilter.max;
        }
      }

      const response = await mealService.getMeals(requestParams);

      if (response.data?.result) {
        const {
          meals: fetchedMeals,
          page: currentPage,
          total_items,
          total_pages,
          limit,
        } = response.data.result;
        const uniqueMeals = fetchedMeals.filter(
          (newMeal: any) =>
            !loadedMeals.some(
              (existingMeal) => existingMeal._id === newMeal._id
            )
        );
        setMeals(fetchedMeals);
        setLoadedMeals((prev) => [...prev, ...uniqueMeals]);
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
  }, [
    dialogOpen,
    debouncedSearchQuery,
    sortBy,
    orderBy,
    mealTypeFilter,
    caloriesFilter,
  ]);

  const handlePageChange = (newPage: number) => {
    fetchMeals(newPage, debouncedSearchQuery);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setOrderBy(orderBy === "asc" ? "desc" : "asc");
  };

  // Handle applying the calories filter
  const handleApplyCaloriesFilter = () => {
    const min = minCalories.trim() !== "" ? Number(minCalories) : undefined;
    const max = maxCalories.trim() !== "" ? Number(maxCalories) : undefined;

    // Validate input
    if (min !== undefined && isNaN(min)) {
      toast.error("Please enter a valid number for minimum calories", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    if (max !== undefined && isNaN(max)) {
      toast.error("Please enter a valid number for maximum calories", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      toast.error("Minimum calories cannot be greater than maximum calories", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    // Apply filter
    setCaloriesFilter({ min, max });
    setFilterOpen(false);
  };

  // Handle removing the calories filter
  const handleRemoveCaloriesFilter = () => {
    setCaloriesFilter(null);
    setMinCalories("");
    setMaxCalories("");
    setFilterOpen(false);
  };

  // Create filter indicator text
  const getCaloriesFilterText = () => {
    if (!caloriesFilter) return null;

    if (caloriesFilter.min !== undefined && caloriesFilter.max !== undefined) {
      return `${caloriesFilter.min} - ${caloriesFilter.max} calories`;
    } else if (caloriesFilter.min !== undefined) {
      return `≥ ${caloriesFilter.min} calories`;
    } else if (caloriesFilter.max !== undefined) {
      return `≤ ${caloriesFilter.max} calories`;
    }

    return null;
  };

  // Check if meal can be selected based on meal type restrictions
  const canSelectMeal = (meal: MealType): boolean => {
    // If meal has no type or is Snack, allow selection
    if (!meal.meal_type || meal.meal_type === "Snack") {
      return true;
    }

    // Check if we already have a meal of this type selected
    // Either in already selected meals or in current selection
    const isAlreadySelected = selectedMealTypes[meal.meal_type];

    // For currently selected meals in the dialog
    const selectedMealsInDialog = meals.filter(
      (m) => selectedMealIds.includes(m._id) && m.meal_type === meal.meal_type
    );

    // If this meal type is already in selected meals or
    // we've already selected a meal of this type in the dialog
    if (
      isAlreadySelected ||
      (selectedMealsInDialog.length > 0 && !selectedMealIds.includes(meal._id))
    ) {
      return false;
    }

    return true;
  };

  const handleCheckboxChange = (mealId: string) => {
    const meal = meals.find((m) => m._id === mealId);

    if (!meal) return;

    // If meal is already selected, always allow deselection
    if (selectedMealIds.includes(mealId)) {
      setSelectedMealIds((prev) => prev.filter((id) => id !== mealId));
      return;
    }

    // Check if we can select this meal based on type restrictions
    if (!canSelectMeal(meal)) {
      return; // Don't allow selection
    }

    // If selecting a main meal type, deselect any other meals of the same type
    if (
      meal.meal_type &&
      ["Breakfast", "Lunch", "Dinner"].includes(meal.meal_type)
    ) {
      setSelectedMealIds((prev) => {
        // Remove other meals of the same type from selection
        const filteredIds = prev.filter((id) => {
          const selectedMeal = meals.find((m) => m._id === id);
          return !selectedMeal || selectedMeal.meal_type !== meal.meal_type;
        });

        // Add this meal to selection
        return [...filteredIds, mealId];
      });
    } else {
      // For other types, just add to selection
      setSelectedMealIds((prev) => [...prev, mealId]);
    }
  };

  const handleAddSelected = () => {
    // First, verify selections don't conflict with existing meals
    let canAdd = true;
    const mealTypeCounts: Record<string, number> = {};

    // Count existing meal types
    selectedMeals.forEach((meal) => {
      if (meal.meal_type) {
        mealTypeCounts[meal.meal_type] =
          (mealTypeCounts[meal.meal_type] || 0) + 1;
      }
    });

    // Check that adding selected meals won't exceed limits
    selectedMealIds.forEach((id) => {
      const meal = loadedMeals.find((m) => m._id === id);
      if (
        meal?.meal_type &&
        ["Breakfast", "Lunch", "Dinner"].includes(meal.meal_type)
      ) {
        mealTypeCounts[meal.meal_type] =
          (mealTypeCounts[meal.meal_type] || 0) + 1;
        if (mealTypeCounts[meal.meal_type] > 1) {
          canAdd = false;
        }
      }
    });

    if (!canAdd) {
      toast.error(
        "You can only select one meal for each main meal type (Breakfast, Lunch, Dinner).",
        {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        }
      );
      return;
    }

    // Add the selected meals
    selectedMealIds.forEach((id) => {
      const meal = loadedMeals.find((m) => m._id === id);
      if (meal && !selectedMeals.some((m) => m._id === id)) {
        onAddMeal(meal);
      }
    });

    setDialogOpen(false);
  };

  // Get meal type display label for the cards
  const getMealTypeLabel = (meal: MealType) => {
    return meal.meal_type ? (
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs ${
          meal.meal_type === "Breakfast"
            ? "bg-blue-100 text-blue-800"
            : meal.meal_type === "Lunch"
            ? "bg-amber-100 text-amber-800"
            : meal.meal_type === "Dinner"
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {meal.meal_type}
      </span>
    ) : null;
  };

  return (
    <div className="space-y-2">
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
                Select meals to add. You can only select one meal for each main
                meal type (Breakfast, Lunch, Dinner).
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="relative col-span-1 md:col-span-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-1 flex space-x-2">
                <div className="flex-1">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="calories">Calories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortOrder}
                  title={
                    orderBy === "asc" ? "Sort Ascending" : "Sort Descending"
                  }
                >
                  {orderBy === "asc" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="col-span-1 md:col-span-1">
                <Select
                  value={mealTypeFilter || "All"}
                  onValueChange={(value) =>
                    setMealTypeFilter(value === "All" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calories filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 px-2 lg:px-3"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Calories Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 ml-48">
                    <div className="space-y-4 p-1">
                      <h4 className="font-medium leading-none">
                        Calories Range
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-calories">Min Calories</Label>
                          <Input
                            id="min-calories"
                            placeholder="e.g., 100"
                            type="number"
                            min={0}
                            value={minCalories}
                            onChange={(e) => setMinCalories(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-calories">Max Calories</Label>
                          <Input
                            id="max-calories"
                            placeholder="e.g., 800"
                            type="number"
                            min={0}
                            value={maxCalories}
                            onChange={(e) => setMaxCalories(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveCaloriesFilter}
                          disabled={!caloriesFilter}
                        >
                          Clear
                        </Button>
                        <Button size="sm" onClick={handleApplyCaloriesFilter}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Display active filters */}
                {caloriesFilter && (
                  <div className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    {getCaloriesFilterText()}
                    <button
                      onClick={handleRemoveCaloriesFilter}
                      className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {Object.entries(selectedMealTypes).length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    Already selected:
                  </p>
                  <ul className="mt-1 text-sm text-amber-800">
                    {Object.keys(selectedMealTypes).map((type) => (
                      <li key={type}>• {type}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading meals...</span>
                </div>
              ) : meals.length > 0 ? (
                meals.map((meal) => {
                  const isDisabled =
                    !canSelectMeal(meal) && !selectedMealIds.includes(meal._id);

                  return (
                    <div
                      key={meal._id}
                      className={`border p-3 rounded-md ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } ${
                        selectedMealIds.includes(meal._id)
                          ? "border-amber-500 bg-amber-50"
                          : ""
                      }`}
                      onClick={() =>
                        !isDisabled && handleCheckboxChange(meal._id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>{meal.calories} calories</span>
                            {getMealTypeLabel(meal)}
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
                  );
                })
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
                  <div className="font-medium text-sm flex items-center gap-2">
                    {meal.name}
                    {/* {getMealTypeLabel(meal)} */}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {meal.calories} calories
                    <span className="ml-2">{getMealTypeLabel(meal)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => onRemoveMeal(meal)}
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
