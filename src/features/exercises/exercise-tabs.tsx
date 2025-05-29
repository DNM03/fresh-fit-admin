import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExerciseTable from "./exercise-table";
import ExerciseSetTable from "./exercise-set-table";

function ExerciseTabs() {
  const [activeTab, setActiveTab] = React.useState("sets");
  const navigate = useNavigate();
  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="px-6 relative">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
              {/* <TabsTrigger
                value="plans"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Exercise Plans
              </TabsTrigger> */}

              <TabsTrigger
                value="sets"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Exercise Sets
              </TabsTrigger>

              <TabsTrigger
                value="exercises"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Exercises
              </TabsTrigger>

              <motion.div
                className="absolute bottom-0 h-1 bg-primary rounded-full"
                layout
                initial={false}
                animate={{
                  left: activeTab === "sets" ? "0%" : "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: "50%" }}
              />
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <TabsContent value="plans" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0  rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Exercise Plans
                </h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-exercise-plan")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Plan</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  {/* <div className="p-10 text-center text-muted-foreground">
                    Your Exercise Plans table will appear here
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sets" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Exercise Sets
                </h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-exercise-set")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Set</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  {/* <div className="p-10 text-center text-muted-foreground">
                    Your Exercise Sets table will appear here
                  </div> */}
                  <ExerciseSetTable />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Exercises</h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-exercise")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Exercise</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm overflow-auto">
                  <ExerciseTable />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default ExerciseTabs;
