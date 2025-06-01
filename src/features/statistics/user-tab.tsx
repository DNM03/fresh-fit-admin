import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "./pie-chart";
import statisticService from "@/services/statistic.service";
import { Activity, Award, User } from "lucide-react";

interface UsersTabProps {
  timeRange: string;
}

interface UserLevel {
  _id: string;
  count: number;
  name?: string;
  value?: number;
}

interface UserIntensity {
  _id: string;
  count: number;
  name?: string;
  value?: number;
}

interface ActiveUser {
  totalCompletedSets: number;
  user_id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
}

interface UserStats {
  user_level_statistic: UserLevel[];
  user_intensity_level_statistic: UserIntensity[];
  top_5_active_users: ActiveUser[];
}

export function UsersTab({ timeRange }: UsersTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Process data for charts
  const userLevels =
    userStats?.user_level_statistic.map((level) => ({
      name: level._id,
      value: level.count,
    })) || [];

  const intensityLevels =
    userStats?.user_intensity_level_statistic.map((intensity) => ({
      name: intensity._id,
      value: intensity.count,
    })) || [];

  // Helper to get color based on user level
  const getLevelColor = (level: string): string => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-blue-100 text-blue-800";
      case "Advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get color based on intensity level
  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case "Sedentary":
        return "bg-gray-100 text-gray-800";
      case "Light":
        return "bg-blue-100 text-blue-800";
      case "Moderate":
        return "bg-green-100 text-green-800";
      case "Active":
        return "bg-yellow-100 text-yellow-800";
      case "Very Active":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await statisticService.getUserStats();
        if (response.data?.result) {
          setUserStats(response.data.result);
        }
      } catch (err) {
        console.error("Error fetching user statistics:", err);
        setError("Failed to load user statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [timeRange]);

  if (loading) {
    return <UserTabSkeletonLoader />;
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Levels</CardTitle>
            <CardDescription>
              Distribution of user fitness levels
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {userLevels.length > 0 ? (
              <div className="w-full">
                <PieChart data={userLevels} dataKey="value" nameKey="name" />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {userLevels.map((level) => (
                    <Badge
                      key={level.name}
                      className={getLevelColor(level.name || "")}
                    >
                      {level.name}: {level.value}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No user level data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Intensity</CardTitle>
            <CardDescription>
              User activity intensity distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {intensityLevels.length > 0 ? (
              <div className="w-full">
                <PieChart
                  data={intensityLevels}
                  dataKey="value"
                  nameKey="name"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {intensityLevels.map((intensity) => (
                    <Badge
                      key={intensity.name}
                      className={getIntensityColor(intensity.name || "")}
                    >
                      {intensity.name}: {intensity.value}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No intensity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Active Users</CardTitle>
            <CardDescription>
              Most active users by completed workout sets
            </CardDescription>
          </div>
          <Award className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {userStats?.top_5_active_users &&
          userStats.top_5_active_users.length > 0 ? (
            <div className="space-y-4">
              {userStats.top_5_active_users.map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Activity className="h-3 w-3" />
                      <span>{user.totalCompletedSets} sets completed</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No active users data</h3>
              <p className="text-sm text-muted-foreground">
                User activity data will appear here once available
              </p>
            </div>
          )}
        </CardContent>

        {userStats?.top_5_active_users &&
          userStats.top_5_active_users.length > 0 && (
            <CardFooter>
              <Button variant="ghost" className="w-full">
                View all users
              </Button>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}

function UserTabSkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-[200px] mx-auto rounded-full" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
