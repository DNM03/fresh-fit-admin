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
import { RadialBarChart } from "./radial-bar-chart";
import { LineChart } from "./line-chart";
import { AreaChart } from "./area-chart";
import { getLevelColor } from "./statistics-data";
import { userGrowthData, goalAchievementData } from "./statistics-data";

interface UsersTabProps {
  timeRange: string;
}

export function UsersTab({ timeRange }: UsersTabProps) {
  console.log("UsersTab rendered with timeRange:", timeRange);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={userGrowthData}
              lines={[
                {
                  dataKey: "users",
                  name: "Active Users",
                  color: "#FF6B6B",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Retention</CardTitle>
            <CardDescription>Monthly user retention rates</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={userGrowthData}
              areas={[
                {
                  dataKey: "churnedUsers",
                  name: "Churned Users",
                  color: "#FF6B6B",
                  gradientId: "colorChurned",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Achievement</CardTitle>
          <CardDescription>User goal achievement by category</CardDescription>
        </CardHeader>
        <CardContent>
          <RadialBarChart data={goalAchievementData} dataKey="value" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Users</CardTitle>
          <CardDescription>Most active users this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold">{i + 1}</span>
                  </div>
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                    <AvatarFallback>U{i + 1}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User Name {i + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 50) + 10} workouts completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {Math.floor(Math.random() * 1000) + 500} points
                  </Badge>
                  <Badge
                    className={getLevelColor(
                      ["Gold", "Platinum", "Silver"][i % 3]
                    )}
                  >
                    {["Gold", "Platinum", "Silver"][i % 3]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            View all users
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
