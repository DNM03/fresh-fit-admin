import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useRef, useState } from "react"; // Add useRef and useState
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react"; // Add RefreshCw
import IngredientTable from "./ingredient-table";
import DishTable from "./dish-table";
import MealTable from "./meal-table";

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
  const refetchIngredientsRef = useRef<(() => void | Promise<any>) | null>(null);

  // Add handlers for refresh buttons
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
  const registerMealRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchMealsRef.current = refetchFn;
  };

  const registerDishRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchDishesRef.current = refetchFn;
  };

  const registerIngredientRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchIngredientsRef.current = refetchFn;
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
                    <span>{isRefetchingMeals ? "Refreshing..." : "Refresh"}</span>
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
                    <span>{isRefetchingDishes ? "Refreshing..." : "Refresh"}</span>
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

          <TabsContent value="ingredients" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Ingredients
                </h2>
                <div className="flex gap-2">
                  {/* Add refresh button for ingredients */}
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
                    <span>{isRefetchingIngredients ? "Refreshing..." : "Refresh"}</span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-ingredient")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Ingredient</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <IngredientTable onRefetchTriggered={registerIngredientRefetchFunction} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default MealTab;
