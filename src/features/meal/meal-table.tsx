import { Table } from "@/components/ui/mantine-table";
import mealService from "@/services/meal.service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function MealTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  // Add states for calories range filter
  const [minCalories, setMinCalories] = useState<string>("");
  const [maxCalories, setMaxCalories] = useState<string>("");
  const [caloriesFilter, setCaloriesFilter] = useState<{
    min?: number;
    max?: number;
  } | null>(null);

  // Add state for meal type filter
  const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Convert to useCallback to enable reuse through ref
  const fetchMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "created_at", desc: true };

      // Prepare request parameters
      const requestParams: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: "System",
        meal_type: mealTypeFilter || "All",
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
      };

      // Add calories filter if it exists
      if (caloriesFilter) {
        if (caloriesFilter.min !== undefined) {
          requestParams.min_calories = caloriesFilter.min;
        }
        if (caloriesFilter.max !== undefined) {
          requestParams.max_calories = caloriesFilter.max;
        }
      }

      const response = await mealService.getMeals(requestParams);

      if (response.data) {
        setMeals(response.data.result.meals);
        setTotal(response.data.result.total_items);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    sorting,
    caloriesFilter,
    mealTypeFilter,
  ]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Register the refetch function with the parent component
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchMeals);
    }
  }, [fetchMeals, onRefetchTriggered]);

  // Handle applying the calories filter
  const handleApplyCaloriesFilter = () => {
    const min = minCalories.trim() !== "" ? Number(minCalories) : undefined;
    const max = maxCalories.trim() !== "" ? Number(maxCalories) : undefined;

    // Validate input
    if (min !== undefined && isNaN(min)) {
      alert("Please enter a valid number for minimum calories");
      return;
    }

    if (max !== undefined && isNaN(max)) {
      alert("Please enter a valid number for maximum calories");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      alert("Minimum calories cannot be greater than maximum calories");
      return;
    }

    // Apply filter
    setCaloriesFilter({ min, max });
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle removing the calories filter
  const handleRemoveCaloriesFilter = () => {
    setCaloriesFilter(null);
    setMinCalories("");
    setMaxCalories("");
  };

  // Handle applying the meal type filter
  const handleApplyMealTypeFilter = (type: string) => {
    setMealTypeFilter(type === "All" ? null : type);
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle removing the meal type filter
  const handleRemoveMealTypeFilter = () => {
    setMealTypeFilter(null);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setCaloriesFilter(null);
    setMinCalories("");
    setMaxCalories("");
    setMealTypeFilter(null);
    setFilterOpen(false);
  };

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "calories",
        header: "Calories",
      },
      {
        accessorKey: "meal_type",
        header: "Meal Type",
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }) => (
          <p>
            {row.original.description?.length > 25
              ? `${row.original.description.substring(0, 25)}...`
              : row.original.description}
          </p>
        ),
        enableSorting: false,
      },
    ],
    []
  );

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

  // Create filter indicator text for meal type
  const getMealTypeFilterText = () => {
    return mealTypeFilter ? `Type: ${mealTypeFilter}` : null;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 lg:px-3"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 ml-62">
            <div className="space-y-4 p-1">
              <h4 className="font-medium leading-none">Filters</h4>

              {/* Meal Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select
                  onValueChange={handleApplyMealTypeFilter}
                  value={mealTypeFilter || "All"}
                  defaultValue="All"
                >
                  <SelectTrigger id="meal-type" className="w-full">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium leading-none mb-3">
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
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={handleApplyCaloriesFilter}>
                    Apply Calories Filter
                  </Button>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFilters}
                  disabled={!caloriesFilter && !mealTypeFilter}
                >
                  Clear All Filters
                </Button>
                <Button size="sm" onClick={() => setFilterOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Calories filter badge */}
        {caloriesFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getCaloriesFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={handleRemoveCaloriesFilter}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Meal type filter badge */}
        {mealTypeFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getMealTypeFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={handleRemoveMealTypeFilter}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <Table
        columns={columns}
        data={meals ?? []}
        rowCount={total ?? 0}
        enableRowSelection={false}
        onPaginationChange={setPagination}
        manualPagination
        state={{ pagination, isLoading, globalFilter, sorting }}
        enableRowActions={true}
        onActionClick={(row) => {
          navigate(`/manage-meals/meals/${row.original._id}`);
        }}
        onGlobalFilterChange={setGlobalFilter}
        enableColumnFilters={false}
        onSortingChange={setSorting}
      />
    </div>
  );
}

export default MealTable;
