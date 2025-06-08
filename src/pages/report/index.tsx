import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import reportService from "@/services/report.service";

interface Report {
  _id: string;
  from: string;
  title: string;
  message: string;
  image: string;
  status: "Read" | "Unread";
  created_at: string;
  updated_at: string;
}

interface ReportsResponse {
  reports: Report[];
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

function ReportPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 10;
  const observerTarget = useRef(null);

  const fetchReports = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await reportService.searchReports({ page, limit });
      const data = response.data.result as ReportsResponse;

      console.log("Fetched reports:", data);

      if (data.reports && data.reports.length > 0) {
        setReports((prev) => {
          const existingIds = new Set(prev.map((report) => report._id));
          const newReports = data.reports.filter(
            (report) => !existingIds.has(report._id)
          );
          return [...prev, ...newReports];
        });

        setPage((prev) => prev + 1);

        if (page >= data.total_pages) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchReports();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchReports();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isLoading, hasMore]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const handleViewReport = (id: string) => {
    navigate(`/reports/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6 ml-1">
        User Reports
      </h1>

      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <div>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              View and manage user reports submitted through the application.
            </CardDescription>
          </div>
          <Button onClick={fetchReports}>Reload</Button>
        </CardHeader>
        <CardContent>
          {reports.length === 0 && isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No reports found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={`${report._id}-${index}`}>
                      <TableCell className="font-medium">
                        {report.title}
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "Read" ? "outline" : "default"
                          }
                        >
                          {report.status === "Read" ? (
                            <Eye className="mr-1 h-3 w-3" />
                          ) : (
                            <EyeOff className="mr-1 h-3 w-3" />
                          )}
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReport(report._id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Loading indicator at the bottom for infinite scroll */}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Intersection observer target element */}
              {!isLoading && hasMore && (
                <div ref={observerTarget} className="h-4" />
              )}

              {/* No more reports message */}
              {!hasMore && reports.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No more reports to load
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportPage;
