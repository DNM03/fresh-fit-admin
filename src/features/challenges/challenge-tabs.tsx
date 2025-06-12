import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";
import ChallengeTable from "./challenge-table";
import HealthPlanTable from "./health-plan-table";

function ChallengeTabs() {
  const [activeTab, setActiveTab] = React.useState("challenges");
  const navigate = useNavigate();
  const [isRefetchingChallenges, setIsRefetchingChallenges] = useState(false);
  const [isRefetchingHealthPlans, setIsRefetchingHealthPlans] = useState(false);
  const refetchChallengesRef = useRef<(() => void | Promise<any>) | null>(null);
  const refetchHealthPlansRef = useRef<(() => void | Promise<any>) | null>(null);

  const handleRefetchChallenges = () => {
    if (refetchChallengesRef.current) {
      setIsRefetchingChallenges(true);
      const result = refetchChallengesRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingChallenges(false);
        });
      } else {
        setIsRefetchingChallenges(false);
      }
    }
  };

  const handleRefetchHealthPlans = () => {
    if (refetchHealthPlansRef.current) {
      setIsRefetchingHealthPlans(true);
      const result = refetchHealthPlansRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetchingHealthPlans(false);
        });
      } else {
        setIsRefetchingHealthPlans(false);
      }
    }
  };

  const registerChallengeRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchChallengesRef.current = refetchFn;
  };

  const registerHealthPlanRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchHealthPlansRef.current = refetchFn;
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="px-6 relative">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
              <TabsTrigger
                value="challenges"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Challenges
              </TabsTrigger>

              <TabsTrigger
                value="healthplans"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
              >
                Health Plans
              </TabsTrigger>

              <motion.div
                className="absolute bottom-0 h-1 bg-primary rounded-full"
                layout
                initial={false}
                animate={{
                  left: activeTab === "challenges" ? "0%" : "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: "50%" }}
              />
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <TabsContent value="challenges" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">Challenges</h2>
                <div className="flex gap-2">
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchChallenges}
                    disabled={isRefetchingChallenges}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingChallenges ? "animate-spin" : ""
                      }`}
                    />
                    <span>{isRefetchingChallenges ? "Refreshing..." : "Refresh"}</span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-challenge")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Challenge</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <ChallengeTable
                    onRefetchTriggered={registerChallengeRefetchFunction}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="healthplans" className="mt-0 p-0">
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
                <h2 className="text-xl font-medium text-primary">
                  Health Plans
                </h2>
                <div className="flex gap-2">
                  <Button
                    className="flex items-center gap-2 px-4"
                    variant={"outline"}
                    onClick={handleRefetchHealthPlans}
                    disabled={isRefetchingHealthPlans}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefetchingHealthPlans ? "animate-spin" : ""
                      }`}
                    />
                    <span>{isRefetchingHealthPlans ? "Refreshing..." : "Refresh"}</span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                    onClick={() => navigate("add-health-plan")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Health Plan</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <HealthPlanTable 
                    onRefetchTriggered={registerHealthPlanRefetchFunction}
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

export default ChallengeTabs;
