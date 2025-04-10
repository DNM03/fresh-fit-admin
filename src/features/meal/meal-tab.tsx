import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

function MealTab() {
  const [activeTab, setActiveTab] = React.useState("meals");
  const navigate = useNavigate();
  return (
    <div className="w-full space-y-6">
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
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-meal")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Meal</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <div className="p-10 text-center text-muted-foreground">
                    Your meal table will appear here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dishes" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Dishes</h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-dish")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Dish</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <div className="p-10 text-center text-muted-foreground">
                    Your dish table will appear here
                  </div>
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
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-ingredient")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Ingredient</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <div className="p-10 text-center text-muted-foreground">
                    Your ingredients table will appear here
                  </div>
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
