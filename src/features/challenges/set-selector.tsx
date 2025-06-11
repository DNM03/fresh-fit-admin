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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity } from "lucide-react";
import setService from "@/services/set.service";

type SetSelectorProps = {
  availableSets?: any[];
  selectedSets: any[];
  onAddSet: (set: any) => void;
  onRemoveSet: (setId: string) => void;
  dayId?: string;
};

export default function SetSelector({
  availableSets = [],
  selectedSets,
  onAddSet,
  onRemoveSet,
  dayId,
}: SetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [orderBy, setOrderBy] = useState("asc");

  const [sets, setSets] = useState<any[]>(availableSets);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 8,
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!dialogOpen) {
      setSelectedSetIds([]);
    }
  }, [dialogOpen]);

  const fetchSets = async (page = 1, search = "") => {
    try {
      setIsLoading(true);

      const response = await setService.searchSet({
        page,
        limit: pagination.limit,
        search,
        type: "System",
        sort_by: sortBy,
        order_by: orderBy.toUpperCase(),
      });

      if (response?.data?.result) {
        const {
          sets: fetchedSets,
          page: currentPage,
          total_items,
          total_pages,
          limit,
        } = response.data.result;
        console.log("Fetched sets:", fetchedSets);
        setSets(fetchedSets);
        setPagination({
          currentPage,
          totalPages: total_pages,
          totalItems: total_items,
          limit,
        });
      }
    } catch (error) {
      console.error("Error fetching exercise sets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchSets(1, debouncedSearchQuery);
    }
  }, [dialogOpen, debouncedSearchQuery, sortBy, orderBy]);

  const handlePageChange = (newPage: number) => {
    fetchSets(newPage, debouncedSearchQuery);
  };

  const handleCheckboxChange = (setId: string) => {
    setSelectedSetIds((prev) =>
      prev.includes(setId)
        ? prev.filter((id) => id !== setId)
        : [...prev, setId]
    );
  };

  const handleAddSelected = () => {
    selectedSetIds.forEach((id) => {
      const set = sets.find((s) => s._id === id);
      if (set && !selectedSets.some((s) => s._id === id)) {
        onAddSet(set);
      }
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium flex items-center">
          <Activity className="mr-2 h-4 w-4 text-green-600" />
          Exercise Sets
        </Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open && sets?.length === 0) {
              fetchSets(1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise Sets
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add Exercise Sets{" "}
                {dayId ? `to Day ${dayId.split("-").pop()}` : ""}
              </DialogTitle>
              <DialogDescription>
                Select one or more exercise sets to add.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="relative col-span-1 md:col-span-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercise sets..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-1">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="number_of_exercises">
                      Number of Exercises
                    </SelectItem>
                    <SelectItem value="total_calories">
                      Total Calories
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 md:col-span-1">
                <Select
                  value={orderBy}
                  onValueChange={(value) => setOrderBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">
                      Ascending (A-Z, Low-High)
                    </SelectItem>
                    <SelectItem value="desc">
                      Descending (Z-A, High-Low)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading exercise sets...</span>
                </div>
              ) : sets?.length > 0 ? (
                sets?.map((set) => (
                  <div
                    key={set._id}
                    className={`border p-3 rounded-md cursor-pointer ${
                      selectedSetIds.includes(set._id)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleCheckboxChange(set._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{set.name}</div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>{set.total_calories} calories</span>
                          <span>{set.number_of_exercises || 0} exercises</span>
                          <span>Rating: {set.rating || 0}</span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedSetIds.includes(set._id)
                            ? "border-primary bg-primary text-white"
                            : ""
                        }`}
                      >
                        {selectedSetIds.includes(set._id) && (
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
                    No exercise sets found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className="ml-2">
                  ({pagination.totalItems} sets total)
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
                disabled={selectedSetIds?.length === 0 || isLoading}
              >
                Add Selected ({selectedSetIds?.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedSets?.length > 0 ? (
        <div className="space-y-2">
          {selectedSets?.map((set) => (
            <Card key={set._id} className="p-2 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{set.name}</div>
                  <div className="text-xs text-gray-500">
                    {set.total_calories} calories
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => onRemoveSet(set._id)}
                >
                  <X size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p>No exercises added yet</p>
        </div>
      )}
    </div>
  );
}
