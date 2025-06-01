import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect, useState } from "react";
import statisticService from "@/services/statistic.service";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [adminDashboard, setAdminDashboard] = useState<any>();
  const [challengesDashboard, setChallengesDashboard] = useState<any>();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const response = await statisticService.getAdminDashboard();
        const data = response.data.result;
        console.log("Admin Dashboard Data:", data);
        setAdminDashboard(data);
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
      }
    };
    const fetchChallengesDashboard = async () => {
      try {
        const response = await statisticService.getChallengesDashboard();
        const data = response.data.result.challenges;
        console.log("Challenges Dashboard Data:", data);
        setChallengesDashboard(data);
      } catch (error) {
        console.error("Error fetching challenges dashboard:", error);
      }
    };

    fetchAdminDashboard();
    fetchChallengesDashboard();
  }, []);
  const COLORS = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Sage Green
    "#FFEEAD", // Cream Yellow
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Dashboard</h1>
        <p className="text-muted-foreground">
          Track your fitness community's progress and engagement
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminDashboard?.total_active_users_current_month}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
              // className={
              //   item.change.startsWith("+")
              //     ? "text-green-500"
              //     : "text-red-500"
              // }
              >
                {adminDashboard &&
                adminDashboard?.total_active_users_current_month &&
                adminDashboard?.total_active_users_last_month
                  ? (
                      ((adminDashboard?.total_active_users_current_month -
                        adminDashboard?.total_active_users_last_month) /
                        adminDashboard?.total_active_users_last_month) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminDashboard?.total_active_challenges_current_month}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
              // className={
              //   item.change.startsWith("+")
              //     ? "text-green-500"
              //     : "text-red-500"
              // }
              >
                {adminDashboard &&
                adminDashboard?.total_active_challenges_current_month &&
                adminDashboard?.total_active_challenges_last_month
                  ? (
                      ((adminDashboard?.total_active_challenges_current_month -
                        adminDashboard?.total_active_challenges_last_month) /
                        adminDashboard?.total_active_challenges_last_month) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Exercise Plans Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Top Exercises</CardTitle>
            <CardDescription>Most popular exercises by users</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adminDashboard?.top_5_exercises
                      ?.slice(0, 5)
                      ?.map((exercise: any) => ({
                        planName: exercise.name,
                        value: exercise.chosen_count || 1,
                        type: exercise.experience_level || "Unknown",
                        rating: exercise.rating || 0,
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="planName"
                    label={({ name, percent }) => {
                      return percent > 0.1 ? `${name}` : "";
                    }}
                  >
                    {(adminDashboard?.top_5_exercises?.slice(0, 5) || [])?.map(
                      (_entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    content={(props) => {
                      const { active, payload } = props;
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-md p-2 shadow-md">
                            <p className="font-medium">{data.planName}</p>
                            <p>{data.rating} ⭐</p>
                            <p className="text-sm">Type: {data.type}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plans Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Top Rated Dishes</CardTitle>
            <CardDescription>
              Highest rated dishes by user ratings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={adminDashboard?.top_5_dishes
                    ?.slice(0, 5)
                    ?.map((dish: any) => ({
                      planName: dish.name,
                      shortName:
                        dish.name.length > 10
                          ? dish.name.substring(0, 10) + "..."
                          : dish.name,
                      calories: dish.calories || 0,
                      rating: dish.rating || 0,
                    }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11 }}
                    tickMargin={5}
                  />
                  <YAxis yAxisId="left" name="Rating" />
                  <YAxis yAxisId="right" orientation="right" name="Name" />
                  <Tooltip
                    content={(props) => {
                      const { active, payload } = props;
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-md p-2 shadow-md">
                            <p className="font-medium">{data.planName}</p>
                            <p className="text-sm">
                              Rating: {data.rating.toFixed(1)} ⭐
                            </p>
                            <p className="text-sm">Calories: {data.calories}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="rating"
                    name="Rating"
                    fill="#FF6B6B"
                    radius={4}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="calories"
                    name="Calories"
                    fill="#006B6B"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Current Challenges</CardTitle>
            <CardDescription>
              Active fitness challenges with participation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {challengesDashboard?.map((challenge: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="hidden sm:block">
                    <img
                      src={challenge.image || "/placeholder.svg"}
                      alt={challenge.name}
                      className="h-16 w-24 rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{challenge.name}</h4>
                      <Badge variant="outline">{challenge.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description?.length > 100
                        ? challenge.description.substring(0, 100) + "..."
                        : challenge.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center text-sm">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        <span>{challenge.total_participation}</span>
                      </div>
                      <div className="flex w-1/2 items-center gap-2">
                        <Progress
                          value={Math.round(
                            (challenge.total_completed_participation /
                              challenge.total_participation) *
                              100
                          )}
                          className="h-2"
                        />
                        <span className="text-xs">
                          {challenge.total_participation > 0
                            ? Math.round(
                                (challenge.total_completed_participation /
                                  challenge.total_participation) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate("/manage-challenges")}
              >
                View all challenges
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Most active community members</CardDescription>
          </CardHeader>
          <CardContent className="p-0 px-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Posts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(adminDashboard?.top_5_contributors || [])?.map(
                  (user: any, index: number) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.user_fullname
                                ? user.user_fullname.charAt(0)
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.user_fullname || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.user_username || "user"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{user.user_email || "No email"}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.user_phoneNumber || "No phone"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.totalPosts || 0}
                      </TableCell>
                    </TableRow>
                  )
                )}
                {(!adminDashboard?.top_5_contributors ||
                  adminDashboard.top_5_contributors.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No contributor data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate("/community")}
              >
                View the community
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
