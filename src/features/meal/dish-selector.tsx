import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, PlusCircle, X, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DishType } from "@/constants/types";

type DishSelectorProps = {
  availableDishes: DishType[];
  selectedDishes: (DishType & { quantity?: number })[];
  onAddDish: (dish: DishType & { quantity?: number }) => void;
  onRemoveDish: (dishId: string) => void;
  onUpdateQuantity?: (dishId: string, quantity: number) => void;
};

export default function DishSelector({
  availableDishes,
  selectedDishes,
  onAddDish,
  onRemoveDish,
  onUpdateQuantity,
}: DishSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("name-asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!dialogOpen) {
      setSelectedDishIds([]);
    }
  }, [dialogOpen]);

  const categories = [
    "all",
    ...new Set(
      availableDishes.map((dish) => {
        return dish.calories > 350 ? "high-calorie" : "low-calorie";
      })
    ),
  ];

  const filteredDishes = availableDishes
    .filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (dish.calories > 350 ? "high-calorie" : "low-calorie") ===
          selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "calories-asc":
          return a.calories - b.calories;
        case "calories-desc":
          return b.calories - a.calories;
        case "prep-asc":
          return a.prepTime - b.prepTime;
        case "prep-desc":
          return b.prepTime - a.prepTime;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const paginatedDishes = filteredDishes.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
      const dish = availableDishes.find((d) => d.id === id);
      if (dish && !selectedDishes.some((sd) => sd.id === id)) {
        onAddDish({ ...dish, quantity: 1 });
      }
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Selected Dishes</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    setPage(1);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all"
                          ? "All Categories"
                          : category
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Sort <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={selectedSort === "name-asc"}
                      onCheckedChange={() => setSelectedSort("name-asc")}
                    >
                      Name (A-Z)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedSort === "name-desc"}
                      onCheckedChange={() => setSelectedSort("name-desc")}
                    >
                      Name (Z-A)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedSort === "calories-asc"}
                      onCheckedChange={() => setSelectedSort("calories-asc")}
                    >
                      Calories (Low to High)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedSort === "calories-desc"}
                      onCheckedChange={() => setSelectedSort("calories-desc")}
                    >
                      Calories (High to Low)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedSort === "prep-asc"}
                      onCheckedChange={() => setSelectedSort("prep-asc")}
                    >
                      Prep Time (Quick First)
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
              {paginatedDishes.length > 0 ? (
                paginatedDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`dish-${dish.id}`}
                      checked={selectedDishIds.includes(dish.id)}
                      onCheckedChange={() => handleCheckboxChange(dish.id)}
                    />
                    <div className="flex flex-1 items-center">
                      <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={dish.image || "/placeholder.svg"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor={`dish-${dish.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {dish.name}
                        </Label>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {dish.description}
                        </p>
                        <div className="flex text-xs text-gray-500 mt-1">
                          <span className="mr-2">{dish.calories} cal</span>
                          <span>{dish.prepTime} min</span>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedDishIds.length === 0}
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
            <Card key={dish.id} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{dish.name}</div>
                    <div className="flex text-xs text-gray-500">
                      <span className="mr-2">{dish.calories} cal</span>
                      <span>{dish.prepTime} min</span>
                    </div>
                  </div>
                </div>

                {onUpdateQuantity && (
                  <div className="flex items-center mr-4">
                    <Label
                      htmlFor={`quantity-${dish.id}`}
                      className="mr-2 text-sm"
                    >
                      Qty:
                    </Label>
                    <Input
                      id={`quantity-${dish.id}`}
                      type="number"
                      className="w-16 h-8 text-sm"
                      value={dish.quantity || 1}
                      onChange={(e) =>
                        onUpdateQuantity(
                          dish.id,
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                      min={1}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveDish(dish.id)}
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
