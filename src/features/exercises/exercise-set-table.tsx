import { Table } from "@/components/ui/mantine-table";
import setService from "@/services/set.service";
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

function ExerciseSetTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [exerciseSets, setExerciseSets] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  // Add states for exercise count range filter
  const [minExercises, setMinExercises] = useState<string>("");
  const [maxExercises, setMaxExercises] = useState<string>("");
  const [exercisesFilter, setExercisesFilter] = useState<{
    min?: number;
    max?: number;
  } | null>(null);

  // Add state for level filter
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Convert to useCallback to enable reuse through ref
  const fetchExerciseSets = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "created_at", desc: true };

      // Prepare request parameters
      const requestParams: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: "System",
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
      };

      // Add exercises count filter if it exists
      if (exercisesFilter) {
        if (exercisesFilter.min !== undefined) {
          requestParams.min_calories = exercisesFilter.min;
        }
        if (exercisesFilter.max !== undefined) {
          requestParams.max_calories = exercisesFilter.max;
        }
      }

      // Add level filter if it exists
      if (levelFilter) {
        requestParams.level = levelFilter;
      }

      const response = await setService.searchSet(requestParams);

      if (response.data) {
        setExerciseSets(response.data.result.sets);
        setTotal(response.data.result.total_items);
      }
    } catch (error) {
      console.error("Error fetching exercise sets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    sorting,
    exercisesFilter,
    levelFilter,
  ]);

  useEffect(() => {
    fetchExerciseSets();
  }, [fetchExerciseSets]);

  // Register the refetch function with the parent component
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchExerciseSets);
    }
  }, [fetchExerciseSets, onRefetchTriggered]);

  // Handle applying the exercises filter
  const handleApplyExercisesFilter = () => {
    const min = minExercises.trim() !== "" ? Number(minExercises) : undefined;
    const max = maxExercises.trim() !== "" ? Number(maxExercises) : undefined;

    // Validate input
    if (min !== undefined && isNaN(min)) {
      alert("Please enter a valid number for minimum exercises");
      return;
    }

    if (max !== undefined && isNaN(max)) {
      alert("Please enter a valid number for maximum exercises");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      alert("Minimum exercises cannot be greater than maximum exercises");
      return;
    }

    // Apply filter
    setExercisesFilter({ min, max });
    setFilterOpen(false);
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle removing the exercises filter
  const handleRemoveExercisesFilter = () => {
    setExercisesFilter(null);
    setMinExercises("");
    setMaxExercises("");
  };

  // Handle changing level filter
  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value === "All" ? null : value);
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle removing the level filter
  const handleRemoveLevelFilter = () => {
    setLevelFilter(null);
  };

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "number_of_exercises",
        header: "Number of Exercises",
      },
      {
        accessorKey: "total_calories",
        header: "Calories",
      },
      {
        accessorKey: "type",
        header: "Level",
        enableSorting: false,
      },
    ],
    []
  );

  // Create filter indicator text for exercise count
  const getExerciseFilterText = () => {
    if (!exercisesFilter) return null;

    if (
      exercisesFilter.min !== undefined &&
      exercisesFilter.max !== undefined
    ) {
      return `${exercisesFilter.min} - ${exercisesFilter.max} calories`;
    } else if (exercisesFilter.min !== undefined) {
      return `≥ ${exercisesFilter.min} calories`;
    } else if (exercisesFilter.max !== undefined) {
      return `≤ ${exercisesFilter.max} calories`;
    }

    return null;
  };

  // Create filter indicator text for level
  const getLevelFilterText = () => {
    return levelFilter ? `Level: ${levelFilter}` : null;
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
              {/* Level Filter */}
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Exercise set Level</h4>
                <Select
                  value={levelFilter || "All"}
                  onValueChange={handleLevelFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exercise Count Filter */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-medium leading-none">Calorie Range</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-exercises">Min Calories</Label>
                    <Input
                      id="min-exercises"
                      placeholder="e.g., 1"
                      type="number"
                      min={0}
                      value={minExercises}
                      onChange={(e) => setMinExercises(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-exercises">Max Calories</Label>
                    <Input
                      id="max-exercises"
                      placeholder="e.g., 10"
                      type="number"
                      min={0}
                      value={maxExercises}
                      onChange={(e) => setMaxExercises(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={handleApplyExercisesFilter}>
                    Apply Filter
                  </Button>
                </div>
              </div>

              {/* Clear All Filters Button */}
              <div className="flex justify-between border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleRemoveExercisesFilter();
                    handleRemoveLevelFilter();
                    setFilterOpen(false);
                  }}
                  disabled={!exercisesFilter && !levelFilter}
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

        {/* Exercise count filter badge */}
        {exercisesFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getExerciseFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={handleRemoveExercisesFilter}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Level filter badge */}
        {levelFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getLevelFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={handleRemoveLevelFilter}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <Table
        columns={columns}
        data={exerciseSets ?? []}
        rowCount={total ?? 0}
        enableRowSelection={false}
        onPaginationChange={setPagination}
        manualPagination
        state={{ pagination, isLoading, globalFilter, sorting }}
        onGlobalFilterChange={setGlobalFilter}
        enableRowActions={true}
        onActionClick={(row) => {
          navigate(`/manage-exercises/exercise-sets/${row.original._id}`);
        }}
        enableColumnFilters={false}
        onSortingChange={setSorting}
      />
    </div>
  );
}

export default ExerciseSetTable;
