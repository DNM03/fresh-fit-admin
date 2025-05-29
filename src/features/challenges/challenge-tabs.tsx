import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React from "react";
import ChallengeTable from "./challenge-table";
import HealthPlanTable from "./health-plan-table";

function ChallengeTabs() {
  const [activeTab, setActiveTab] = React.useState("challenges");
  const navigate = useNavigate();

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
                Exercise Challenges
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
                <h2 className="text-xl font-medium text-primary">
                  Exercise Challenges
                </h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-challenge")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Challenge</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  <ChallengeTable />
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
                <Button
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
                  onClick={() => navigate("add-health-plan")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Health Plan</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border bg-card shadow-sm">
                  {/* <div className="p-10 text-center text-muted-foreground">
                    Your Health Plans table will appear here
                  </div> */}
                  <HealthPlanTable />
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
