import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart } from "./line-chart";
import {
  Calendar,
  CalendarX,
  Star,
  Clock,
  Users,
  ChevronRight,
  CircleUser,
} from "lucide-react";
import statisticService from "@/services/statistic.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AppointmentTabProps {
  timeRange: string;
}

interface MonthlyAppointment {
  month: number;
  count: number;
  name?: string;
}

interface Expert {
  id: string;
  userId: string;
  avatar: string;
  fullName: string;
  bookingCount?: number;
  rating?: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function AppointmentTab({ timeRange }: AppointmentTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MonthlyAppointment[]>([]);
  const [topBookedExperts, setTopBookedExperts] = useState<Expert[]>([]);
  const [topRatedExperts, setTopRatedExperts] = useState<Expert[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [yearOptions] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  });

  // Format data for the line chart
  const appointmentData = stats.map((item) => ({
    name: MONTH_NAMES[item.month - 1],
    Appointments: item.count,
  }));

  // Calculate summary statistics
  const totalAppointments = stats.reduce((sum, month) => sum + month.count, 0);
  const maxMonthCount = Math.max(...stats.map((month) => month.count), 0);
  const maxMonth =
    stats.find((month) => month.count === maxMonthCount)?.month || 0;
  const avgAppointmentsPerMonth = totalAppointments / 12;

  // Find the maximum booking count (for progress bar normalization)
  const maxBookingCount = Math.max(
    ...topBookedExperts.map((expert) => expert.bookingCount || 0),
    1
  );

  useEffect(() => {
    const fetchAppointmentStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await statisticService.getAppointmentStats(
          selectedYear
        );
        if (response.data?.data?.statistic) {
          setStats(response.data.data.statistic);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching appointment statistics:", err);
        setError("Failed to load appointment statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentStats();
  }, [selectedYear, timeRange]);

  // Fetch top experts data
  useEffect(() => {
    const fetchTopExperts = async () => {
      setExpertsLoading(true);

      try {
        const bookingResponse =
          await statisticService.getAppointmentTop5BookedExperts();
        console.log("Top booked experts response:", bookingResponse);
        if (bookingResponse.data?.data?.experts) {
          setTopBookedExperts(bookingResponse.data.data.experts);
        }

        const ratingResponse =
          await statisticService.getAppointmentTop5RatingExperts();
        if (ratingResponse.data?.data?.experts) {
          setTopRatedExperts(ratingResponse.data.data.experts);
        }
      } catch (err) {
        console.error("Error fetching top experts data:", err);
      } finally {
        setExpertsLoading(false);
      }
    };

    fetchTopExperts();
  }, []);

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    if (!isNaN(year)) {
      setSelectedYear(year);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <AppointmentTabSkeletonLoader />;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Appointment Statistics
        </h2>
        <Select
          value={selectedYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {totalAppointments}
              </CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total appointments scheduled in {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Busiest Month
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {maxMonthCount > 0 ? MONTH_NAMES[maxMonth - 1] : "N/A"}
              </CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {maxMonthCount} appointment
              {maxMonthCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Average
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {avgAppointmentsPerMonth.toFixed(1)}
              </CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Average appointments per month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>
            Monthly Appointment Distribution ({selectedYear})
          </CardTitle>
          <CardDescription>
            Number of appointments scheduled each month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentData.length > 0 ? (
            <div className="h-[350px]">
              <LineChart
                data={appointmentData}
                lines={[
                  {
                    dataKey: "Appointments",
                    name: "Appointments",
                    color: "#0ea5e9",
                  },
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
              <CalendarX className="h-10 w-10 mb-2" />
              <p className="text-lg font-medium">
                No appointment data available
              </p>
              <p className="text-sm">
                Try selecting a different year or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Experts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 5 Most Booked Experts */}
        <Card className="relative overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 absolute top-0 left-0 right-0" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Top 5 Most Booked Experts
            </CardTitle>
            <CardDescription>
              Specialists with the highest number of appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expertsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : topBookedExperts.length > 0 ? (
              <div className="space-y-4">
                {topBookedExperts.map((expert, index) => (
                  <div
                    key={expert.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-muted-foreground w-5 text-center">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={expert.avatar} alt={expert.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(expert.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{expert.fullName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Progress
                          value={
                            ((expert.bookingCount || 0) / maxBookingCount) * 100
                          }
                          className="h-2"
                        />
                        <span className="text-sm font-medium text-muted-foreground min-w-[32px] text-right">
                          {expert.bookingCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mb-2 opacity-20" />
                <p>No expert data available</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" asChild className="ml-auto">
              <Link to="/specialists">
                View all specialists
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Top 5 Highest Rated Experts */}
        <Card className="relative overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 absolute top-0 left-0 right-0" />
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              Top 5 Highest Rated Experts
            </CardTitle>
            <CardDescription>
              Specialists with the best client ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expertsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : topRatedExperts.length > 0 ? (
              <div className="space-y-4">
                {topRatedExperts.map((expert, index) => (
                  <div
                    key={expert.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-muted-foreground w-5 text-center">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={expert.avatar} alt={expert.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(expert.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{expert.fullName}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.round(expert.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="ml-1.5 text-sm text-muted-foreground">
                          {expert.rating || 0}/5
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-2"
                    >
                      <Link to={`/specialists/detail/${expert.id}`}>
                        <CircleUser className="h-4 w-4 mr-1" />
                        Profile
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mb-2 opacity-20" />
                <p>No rating data available</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" asChild className="ml-auto">
              <Link to="/specialists">
                View all specialists
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>
            Detailed view of appointments by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.map((monthData) => (
              <div
                key={monthData.month}
                className={`p-4 rounded-lg border ${
                  monthData.count > 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="font-medium">
                  {MONTH_NAMES[monthData.month - 1]}
                </p>
                <div className="flex items-end justify-between mt-1">
                  <p
                    className={`text-2xl font-bold ${
                      monthData.count > 0 ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {monthData.count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    appointment{monthData.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentTabSkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Skeleton className="h-8 w-32 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AppointmentTab;
