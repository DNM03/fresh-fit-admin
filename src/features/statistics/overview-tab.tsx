import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Target, Users, Utensils } from "lucide-react";

import { MetricCard } from "./metric-card";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";
import {
  userGrowthData,
  workoutCompletionData,
  nutritionAdherenceData,
  challengeParticipationData,
  userDemographicsData,
} from "./statistics-data";

interface OverviewTabProps {
  timeRange: string;
}

export function OverviewTab({ timeRange }: OverviewTabProps) {
  console.log("OverviewTab rendered with timeRange:", timeRange);
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Users"
          value="3,245"
          change="+12.5%"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Workout Completion"
          value="82.3%"
          change="+5.2%"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Nutrition Adherence"
          value="78.5%"
          change="+3.8%"
          trend="up"
          icon={Utensils}
        />
        <MetricCard
          title="Active Challenges"
          value="24"
          change="+2"
          trend="up"
          icon={Target}
        />
      </div>

      {/* User Growth Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>
            Monthly user acquisition and retention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={userGrowthData}
            areas={[
              {
                dataKey: "users",
                name: "Total Users",
                color: "#45B7D1",
                gradientId: "colorUsers",
              },
              {
                dataKey: "newUsers",
                name: "New Users",
                color: "#4ECDC4",
                gradientId: "colorNewUsers",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Workout Completion and Nutrition Adherence */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Completion</CardTitle>
            <CardDescription>Daily workout completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={workoutCompletionData}
              height={250}
              bars={[
                {
                  dataKey: "completed",
                  name: "Completed",
                  color: "#FF6B6B",
                },
                {
                  dataKey: "target",
                  name: "Target",
                  color: "#45B7D1",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition Plan Adherence</CardTitle>
            <CardDescription>Weekly nutrition plan adherence</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={nutritionAdherenceData}
              height={250}
              yAxisDomain={[0, 100]}
              lines={[
                {
                  dataKey: "adherence",
                  name: "Adherence %",
                  color: "#4ECDC4",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Challenge Participation and Demographics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Participation</CardTitle>
            <CardDescription>Top 5 challenges by participation</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={challengeParticipationData}
              height={250}
              layout="vertical"
              bars={[
                {
                  dataKey: "participants",
                  name: "Participants",
                  color: "#FF6B6B",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>Age distribution of users</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart
              data={userDemographicsData}
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
