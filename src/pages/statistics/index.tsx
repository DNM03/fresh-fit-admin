import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChartIcon, Users, Dumbbell, Utensils } from "lucide-react";
import { StatisticsHeader } from "@/features/statistics/statistics-header";
import { OverviewTab } from "@/features/statistics/overview-tab";
import { UsersTab } from "@/features/statistics/user-tab";
import { WorkoutsTab } from "@/features/statistics/workouts-tab";
import { NutritionTab } from "@/features/statistics/nutrition-tab";

function Statistics() {
  const [timeRange, setTimeRange] = useState("30days");

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <StatisticsHeader timeRange={timeRange} setTimeRange={setTimeRange} />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview">
          <OverviewTab timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="workouts">
          <WorkoutsTab timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionTab timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Statistics;
