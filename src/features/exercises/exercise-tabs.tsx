import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, RefreshCw } from "lucide-react"; // Add RefreshCw import
import React, { useRef, useState } from "react"; // Add useRef and useState imports
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExerciseTable from "./exercise-table";
import ExerciseSetTable from "./exercise-set-table";

function ExerciseTabs() {
  const [activeTab, setActiveTab] = React.useState("sets");
  const navigate = useNavigate();

  // Add state for refresh indicators
  const [isRefetchingExercises, setIsRefetchingExercises] = useState(false);
  const [isRefetchingExerciseSets, setIsRefetchingExerciseSets] =
    useState(false);

  // Add refs to store refetch functions
  const refetchExercisesRef = useRef<(() => void | Promise<any>) | null>(null);
  const refetchExerciseSetsRef = useRef<(() => void | Promise<any>) | null>(
    null
  );

  // Add handlers for refresh buttons
  const handleRefetchExercises = () => {
    if (refetchExercisesRef.current) {
      setIsRefetchingExercises(true);
      const result = refetchExercisesRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingExercises(false);
        });
      } else {
        setIsRefetchingExercises(false);
      }
    }
  };

  const handleRefetchExerciseSets = () => {
    if (refetchExerciseSetsRef.current) {
      setIsRefetchingExerciseSets(true);
      const result = refetchExerciseSetsRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingExerciseSets(false);
        });
      } else {
        setIsRefetchingExerciseSets(false);
      }
    }
  };

  // Add functions to register refetch callbacks
  const registerExerciseRefetchFunction = (
    refetchFn: () => void | Promise<any>
  ) => {
    refetchExercisesRef.current = refetchFn;
  };

  const registerExerciseSetRefetchFunction = (
    refetchFn: () => void | Promise<any>
  ) => {
    refetchExerciseSetsRef.current = refetchFn;
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="px-6 relative">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
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
          <TabsContent value="sets" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Exercise Sets
                </h2>
                <div className="flex gap-2">
                  {/* Add refresh button for exercise sets */}
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchExerciseSets}
                    disabled={isRefetchingExerciseSets}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingExerciseSets ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRefetchingExerciseSets ? "Refreshing..." : "Refresh"}
                    </span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-exercise-set")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Set</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="">
                  <ExerciseSetTable
                    onRefetchTriggered={registerExerciseSetRefetchFunction}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Exercises</h2>
                <div className="flex gap-2">
                  {/* Add refresh button for exercises */}
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchExercises}
                    disabled={isRefetchingExercises}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingExercises ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRefetchingExercises ? "Refreshing..." : "Refresh"}
                    </span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-exercise")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Exercise</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm overflow-auto">
                  <ExerciseTable
                    onRefetchTriggered={registerExerciseRefetchFunction}
                  />
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
