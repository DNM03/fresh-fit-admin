import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Target, Users, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { MetricCard } from "./metric-card";
import { AreaChart } from "./area-chart";
import { PieChart } from "./pie-chart";
import statisticService from "@/services/statistic.service";

interface OverviewTabProps {
  timeRange: string;
}

interface OverviewMetrics {
  total_users_last_month: number;
  total_users_current_month: number;
  total_active_challenges_last_month: number;
  total_active_challenges_current_month: number;
}

interface UserGrowthData {
  month: number;
  newUsers: number;
  totalUsers: number;
  name?: string;
}

interface Challenge {
  _id: string;
  name: string;
  total_participation: number;
  total_completed_participation: number;
}

interface AgeGroup {
  _id: string;
  count: number;
  name?: string;
  value?: number;
}

export function OverviewTab({ timeRange }: OverviewTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewMetrics, setOverviewMetrics] =
    useState<OverviewMetrics | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<
    (UserGrowthData & { name: string })[]
  >([]);
  const [topChallenges, setTopChallenges] = useState<
    { name: string; participants: number }[]
  >([]);
  const [ageDistribution, setAgeDistribution] = useState<
    { name: string; value: number }[]
  >([]);

  const currentYear = new Date().getFullYear();

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Determine trend direction
  const determineTrend = (current: number, previous: number) => {
    return current >= previous ? "up" : "down";
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const overviewResponse = await statisticService.getOverview();
        if (overviewResponse.data?.result) {
          setOverviewMetrics(overviewResponse.data.result);
        }

        const year = currentYear;
        const growthResponse = await statisticService.getUserGrowth(year);
        if (growthResponse.data?.result) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const formattedGrowthData = growthResponse.data.result.map(
            (item: UserGrowthData) => ({
              ...item,
              name: monthNames[item.month - 1], // Convert month number to name
            })
          );
          setUserGrowthData(formattedGrowthData);
        }

        const challengesResponse = await statisticService.getTopChallenges(
          year,
          5
        );
        if (challengesResponse.data?.result) {
          const formattedChallenges = challengesResponse.data.result.map(
            (challenge: Challenge) => ({
              name: challenge.name,
              participants: challenge.total_participation,
            })
          );
          console.log("Top Challenges:", formattedChallenges);
          setTopChallenges(formattedChallenges);
        }

        const ageResponse = await statisticService.getAgeDistribution();
        if (ageResponse.data?.result) {
          const formattedAgeData = ageResponse.data.result.map(
            (item: AgeGroup) => ({
              name: item._id,
              value: item.count,
            })
          );
          setAgeDistribution(formattedAgeData);
        }
      } catch (err) {
        console.error("Error fetching statistics data:", err);
        setError("Failed to load statistics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, currentYear]);

  if (loading) {
    return <StatisticsSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-100 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const usersChange = overviewMetrics
    ? calculatePercentageChange(
        overviewMetrics.total_users_current_month,
        overviewMetrics.total_users_last_month
      )
    : "0%";

  const usersTrend = overviewMetrics
    ? determineTrend(
        overviewMetrics.total_users_current_month,
        overviewMetrics.total_users_last_month
      )
    : "up";

  // Calculate challenge stats
  const challengesChange = overviewMetrics
    ? calculatePercentageChange(
        overviewMetrics.total_active_challenges_current_month,
        overviewMetrics.total_active_challenges_last_month
      )
    : "0%";

  const challengesTrend = overviewMetrics
    ? determineTrend(
        overviewMetrics.total_active_challenges_current_month,
        overviewMetrics.total_active_challenges_last_month
      )
    : "up";

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={overviewMetrics?.total_users_current_month.toString() || "0"}
          change={usersChange}
          trend={usersTrend as "up" | "down"}
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
          value={
            overviewMetrics?.total_active_challenges_current_month.toString() ||
            "0"
          }
          change={challengesChange}
          trend={challengesTrend as "up" | "down"}
          icon={Target}
        />
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>
            Monthly user acquisition and retention in {timeRange || currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={userGrowthData}
            areas={[
              {
                dataKey: "totalUsers",
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Participation</CardTitle>
            <CardDescription>
              Top 5 challenges by participation in {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topChallenges.length > 0 ? (
              <div className="space-y-3">
                {topChallenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="max-w-[250px]">
                        <h4
                          className="font-medium line-clamp-1"
                          title={challenge.name}
                        >
                          {challenge.name}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-lg">
                        {challenge.participants}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        participants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No challenge data available
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>Age distribution of users</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {ageDistribution.length > 0 ? (
              <PieChart
                data={ageDistribution}
                dataKey="value"
                nameKey="name"
                width={600}
                height={200}
                showLabels={false}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No demographic data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton loader for the statistics page
function StatisticsSkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-md" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
