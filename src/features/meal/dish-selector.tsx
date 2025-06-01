import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, PlusCircle, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DishType } from "@/constants/types";
import dishService from "@/services/dish.service";

type DishSelectorProps = {
  availableDishes?: DishType[];
  selectedDishes: (DishType & { quantity?: number })[];
  onAddDish: (dish: DishType & { quantity?: number }) => void;
  onRemoveDish: (dishId: string) => void;
  onUpdateQuantity?: (dishId: string, quantity: number) => void;
};

export default function DishSelector({
  availableDishes: initialDishes = [],
  selectedDishes,
  onAddDish,
  onRemoveDish,
}: DishSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);

  const [dishes, setDishes] = useState<DishType[]>(initialDishes);
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
      setSelectedDishIds([]);
    }
  }, [dialogOpen]);

  const fetchDishes = async (page = 1, search = "") => {
    try {
      setIsLoading(true);

      const response = await dishService.searchDishes({
        page,
        limit: pagination.limit,
        search,
      });

      if (response.data?.result) {
        const {
          dishes: fetchedDishes,
          page: currentPage,
          total_items,
          total_pages,
          limit,
        } = response.data.result;

        setDishes(fetchedDishes);
        setPagination({
          currentPage,
          totalPages: total_pages,
          totalItems: total_items,
          limit,
        });
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchDishes(1, debouncedSearchQuery);
    }
  }, [dialogOpen, debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchDishes(newPage, debouncedSearchQuery);
  };

  const handleCheckboxChange = (dishId: string) => {
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      } else {
        return [...prev, dishId];
      }
    });
  };

  const handleAddSelected = () => {
    selectedDishIds.forEach((id) => {
      const dish = dishes.find((d) => d._id === id);
      if (dish && !selectedDishes.some((sd) => sd._id === id)) {
        onAddDish({ ...dish, quantity: 1 });
      }
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Selected Dishes</Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open && dishes.length === 0) {
              fetchDishes(1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Dishes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Select Dishes</DialogTitle>
              <DialogDescription>
                Search and select dishes to add to your meal.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between my-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dishes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
              {isLoading ? (
                <div className="col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading dishes...</span>
                </div>
              ) : dishes.length > 0 ? (
                dishes.map((dish) => (
                  <div
                    key={dish._id}
                    className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`dish-${dish._id}`}
                      checked={selectedDishIds.includes(dish._id)}
                      onCheckedChange={() => handleCheckboxChange(dish._id)}
                    />
                    <div className="flex flex-1 items-center">
                      {/* <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={dish.image || "/placeholder.svg"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div> */}
                      <div className="flex-1">
                        <Label
                          htmlFor={`dish-${dish._id}`}
                          className="font-medium cursor-pointer"
                        >
                          {dish.name}
                        </Label>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {dish.description}
                        </p>
                        <div className="flex text-xs text-gray-500 mt-1">
                          <span className="mr-2">{dish.calories} cal</span>
                          <span>{dish.prep_time / 60} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">
                    No dishes found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className="ml-2">
                  ({pagination.totalItems} dishes total)
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
                disabled={selectedDishIds.length === 0 || isLoading}
              >
                Add {selectedDishIds.length}{" "}
                {selectedDishIds.length === 1 ? "Dish" : "Dishes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedDishes.length > 0 ? (
        <div className="space-y-2">
          {selectedDishes.map((dish) => (
            <Card key={dish._id} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center flex-1">
                  {/* <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div> */}
                  <div className="flex-1">
                    <div className="font-medium">{dish.name}</div>
                    <div className="flex text-xs text-gray-500">
                      <span className="mr-2">{dish.calories} cal</span>
                      <span>{dish.prep_time / 60} min</span>
                    </div>
                  </div>
                </div>

                {/* {onUpdateQuantity && (
                  <div className="flex items-center mr-4">
                    <Label
                      htmlFor={`quantity-${dish._id}`}
                      className="mr-2 text-sm"
                    >
                      Quantity:
                    </Label>
                    <Input
                      id={`quantity-${dish._id}`}
                      type="number"
                      className="w-16 h-8 text-sm"
                      value={dish.quantity || 1}
                      onChange={(e) =>
                        onUpdateQuantity(
                          dish._id,
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                      min={1}
                    />
                  </div>
                )} */}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveDish(dish._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No dishes added yet</p>
        </div>
      )}
    </div>
  );
}
