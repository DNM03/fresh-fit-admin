import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, Loader2 } from "lucide-react";
import IngredientTable from "./ingredient-table";
import DishTable from "./dish-table";
import MealTable from "./meal-table";

// Import additional components for the dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ingredientService from "@/services/ingredient.service"; // Import your ingredient service

function MealTab() {
  const [activeTab, setActiveTab] = React.useState("meals");
  const navigate = useNavigate();

  // Add state for refresh indicators
  const [isRefetchingMeals, setIsRefetchingMeals] = useState(false);
  const [isRefetchingDishes, setIsRefetchingDishes] = useState(false);
  const [isRefetchingIngredients, setIsRefetchingIngredients] = useState(false);

  // Add refs to store refetch functions
  const refetchMealsRef = useRef<(() => void | Promise<any>) | null>(null);
  const refetchDishesRef = useRef<(() => void | Promise<any>) | null>(null);
  const refetchIngredientsRef = useRef<(() => void | Promise<any>) | null>(
    null
  );

  // Add state for the ingredient dialog
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [ingredientName, setIngredientName] = useState("");
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Existing code for refetch handlers...
  const handleRefetchMeals = () => {
    if (refetchMealsRef.current) {
      setIsRefetchingMeals(true);
      const result = refetchMealsRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingMeals(false);
        });
      } else {
        setIsRefetchingMeals(false);
      }
    }
  };

  const handleRefetchDishes = () => {
    if (refetchDishesRef.current) {
      setIsRefetchingDishes(true);
      const result = refetchDishesRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingDishes(false);
        });
      } else {
        setIsRefetchingDishes(false);
      }
    }
  };

  const handleRefetchIngredients = () => {
    if (refetchIngredientsRef.current) {
      setIsRefetchingIngredients(true);
      const result = refetchIngredientsRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingIngredients(false);
        });
      } else {
        setIsRefetchingIngredients(false);
      }
    }
  };

  // Add functions to register refetch callbacks
  const registerMealRefetchFunction = (
    refetchFn: () => void | Promise<any>
  ) => {
    refetchMealsRef.current = refetchFn;
  };

  const registerDishRefetchFunction = (
    refetchFn: () => void | Promise<any>
  ) => {
    refetchDishesRef.current = refetchFn;
  };

  const registerIngredientRefetchFunction = (
    refetchFn: () => void | Promise<any>
  ) => {
    refetchIngredientsRef.current = refetchFn;
  };

  // Add function to handle adding an ingredient
  const handleAddIngredient = async () => {
    if (!ingredientName.trim()) {
      toast.error("Please enter an ingredient name");
      return;
    }

    setIsAddingIngredient(true);
    try {
      const response = await ingredientService.addIngredient({
        name: ingredientName.trim(),
        description: "t",
        calories: 0,
        image:
          "https://sahabatlautlestari.com/wp-content/uploads/2023/05/Tuna-Species-Overview-2048x1311.png",
      });

      toast.success("Ingredient added successfully");
      setIngredientName("");
      setIsAddIngredientOpen(false);

      if (refetchIngredientsRef.current) {
        refetchIngredientsRef.current();
      }

      console.log("Ingredient created:", response);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast.error("Failed to add ingredient. Please try again.");
    } finally {
      setIsAddingIngredient(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        {/* Existing code for tab headers */}
        <div className="border-b">
          <div className="px-6 relative">
            <TabsList className="grid grid-cols-3 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
              <TabsTrigger
                value="meals"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Meals
              </TabsTrigger>

              <TabsTrigger
                value="dishes"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Dishes
              </TabsTrigger>

              <TabsTrigger
                value="ingredients"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Ingredients
              </TabsTrigger>

              <motion.div
                className="absolute bottom-0 h-1 bg-primary rounded-full"
                layout
                initial={false}
                animate={{
                  left:
                    activeTab === "meals"
                      ? "0%"
                      : activeTab === "dishes"
                      ? "33.33%"
                      : "66.67%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: "33.33%" }}
              />
            </TabsList>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          {/* Meals tab content */}
          <TabsContent value="meals" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Meals</h2>
                <div className="flex gap-2">
                  {/* Add refresh button for meals */}
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchMeals}
                    disabled={isRefetchingMeals}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingMeals ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRefetchingMeals ? "Refreshing..." : "Refresh"}
                    </span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-meal")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Meal</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <MealTable onRefetchTriggered={registerMealRefetchFunction} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dishes tab content */}
          <TabsContent value="dishes" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Dishes</h2>
                <div className="flex gap-2">
                  {/* Add refresh button for dishes */}
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchDishes}
                    disabled={isRefetchingDishes}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingDishes ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRefetchingDishes ? "Refreshing..." : "Refresh"}
                    </span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-dish")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Dish</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <DishTable onRefetchTriggered={registerDishRefetchFunction} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredients tab content */}
          <TabsContent value="ingredients" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Ingredients
                </h2>
                <div className="flex gap-2">
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchIngredients}
                    disabled={isRefetchingIngredients}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingIngredients ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRefetchingIngredients ? "Refreshing..." : "Refresh"}
                    </span>
                  </Button>

                  {/* Change this to open the dialog */}
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => setIsAddIngredientOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Ingredient</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <IngredientTable
                    onRefetchTriggered={registerIngredientRefetchFunction}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Ingredient Dialog */}
      <Dialog open={isAddIngredientOpen} onOpenChange={setIsAddIngredientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Ingredient</DialogTitle>
            <DialogDescription>
              Enter the name of the ingredient you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col  gap-4">
              <Label htmlFor="ingredient-name" className="text-right">
                Name
              </Label>
              <Input
                id="ingredient-name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                className="col-span-3"
                placeholder="Eg, Chicken Breast"
                autoComplete="off"
                disabled={isAddingIngredient}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAddingIngredient) {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddIngredientOpen(false)}
              disabled={isAddingIngredient}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIngredient}
              disabled={!ingredientName.trim() || isAddingIngredient}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isAddingIngredient ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Ingredient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MealTab;
