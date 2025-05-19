import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ChevronRight, Dumbbell, Trophy, Users } from "lucide-react";
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

import { ExerciseTooltip, MealTooltip } from "@/components/ui/custom-tooltip";
import { useEffect, useState } from "react";
import statisticService from "@/services/statistic.service";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [, setTopStat] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch top stat data from API
    const fetchTopStat = async () => {
      try {
        const response = await statisticService.getTop();
        const data = response.data.result.rersult;
        setTopStat(data);
      } catch (error) {
        console.error("Error fetching top stat:", error);
      }
    };

    fetchTopStat();
  }, []);
  // Data for exercise plans
  const exercises = [
    {
      planName: "Legs Extreme",
      duration: "1 month",
      type: "Advanced",
      chosenBy: 100,
    },
    {
      planName: "Cardio Blast",
      duration: "2 weeks",
      type: "Intermediate",
      chosenBy: 150,
    },
    {
      planName: "Full Body Workout",
      duration: "3 months",
      type: "Beginner",
      chosenBy: 200,
    },
    {
      planName: "Strength Training",
      duration: "6 weeks",
      type: "Advanced",
      chosenBy: 120,
    },
    {
      planName: "Yoga Flex",
      duration: "1 month",
      type: "Beginner",
      chosenBy: 180,
    },
  ];

  // Data for meal plans
  const meals = [
    {
      planName: "Keto Diet",
      type: "Breakfast",
      calories: 500,
      chosenBy: 90,
    },
    {
      planName: "Vegan Cleanse",
      type: "Lunch",
      calories: 400,
      chosenBy: 110,
    },
    {
      planName: "Paleo Plan",
      type: "Dinner",
      calories: 600,
      chosenBy: 130,
    },
    {
      planName: "Mediterranean",
      type: "Breakfast",
      calories: 450,
      chosenBy: 95,
    },
    {
      planName: "Low Carb Diet",
      type: "Lunch",
      calories: 350,
      chosenBy: 120,
    },
  ];

  // Data for challenges
  const challenges = [
    {
      title: "30 Day Plank Challenge",
      description: "Hold a plank for 30 days",
      duration: "30 days",
      participants: 100,
      progress: 65,
      thumbnail: "/placeholder.svg?height=80&width=120",
    },
    {
      title: "100 Pushups Challenge",
      description: "Do 100 pushups in a day",
      duration: "1 day",
      participants: 50,
      progress: 80,
      thumbnail: "/placeholder.svg?height=80&width=120",
    },
    {
      title: "30 Day Squat Challenge",
      description: "Do squats for 30 days",
      duration: "30 days",
      participants: 80,
      progress: 45,
      thumbnail: "/placeholder.svg?height=80&width=120",
    },
  ];

  // Data for top contributors
  const users = [
    {
      avatar: "/placeholder.svg?height=40&width=40",
      name: "John Doe",
      posts: 10,
      point: 1000,
      level: "Gold",
    },
    {
      avatar: "/placeholder.svg?height=40&width=40",
      name: "Jane Smith",
      posts: 15,
      point: 1500,
      level: "Platinum",
    },
    {
      avatar: "/placeholder.svg?height=40&width=40",
      name: "Alice Johnson",
      posts: 8,
      point: 800,
      level: "Silver",
    },
  ];

  // Summary data
  const summaryData = [
    {
      title: "Active Users",
      value: "2,845",
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Active Challenges",
      value: "24",
      change: "+3.2%",
      icon: Trophy,
    },
    {
      title: "Workout Plans",
      value: "156",
      change: "+8.1%",
      icon: Dumbbell,
    },
  ];

  // Colors for charts
  const COLORS = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Sage Green
    "#FFEEAD", // Cream Yellow
  ];

  // Get level badge color
  // const getLevelColor = (level: string) => {
  //   switch (level) {
  //     case "Gold":
  //       return "bg-amber-500 hover:bg-amber-600";
  //     case "Platinum":
  //       return "bg-slate-400 hover:bg-slate-500";
  //     case "Silver":
  //       return "bg-gray-300 hover:bg-gray-400 text-gray-800";
  //     default:
  //       return "bg-primary hover:bg-primary/90";
  //   }
  // };

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
      <div className="grid gap-4 md:grid-cols-3">
        {summaryData.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    item.change.startsWith("+")
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {item.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Exercise Plans Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Top Exercise Plans</CardTitle>
            <CardDescription>
              Most popular workout plans by participation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exercises}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="chosenBy"
                    nameKey="planName"
                    label={({ name, percent }) => {
                      return percent > 0.1
                        ? `${name} (${(percent * 100).toFixed(0)}%)`
                        : "";
                    }}
                  >
                    {exercises.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ExerciseTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plans Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Top Meal Plans</CardTitle>
            <CardDescription>
              Calories and popularity comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={meals}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="planName"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<MealTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="calories"
                    fill="#FF6B6B"
                    radius={4}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="chosenBy"
                    fill="#4ECDC4"
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
              {challenges.map((challenge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="hidden sm:block">
                    <img
                      src={challenge.thumbnail || "/placeholder.svg"}
                      alt={challenge.title}
                      className="h-16 w-24 rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{challenge.title}</h4>
                      <Badge variant="outline">{challenge.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center text-sm">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        <span>{challenge.participants}</span>
                      </div>
                      <div className="flex w-1/2 items-center gap-2">
                        <Progress value={challenge.progress} className="h-2" />
                        <span className="text-xs">{challenge.progress}%</span>
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
                  <TableHead className="text-right">Posts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">{user.posts}</TableCell>
                  </TableRow>
                ))}
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
