import { useEffect, useState, useRef, useCallback } from "react";
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
import { Eye, EyeOff, Loader2, ArrowDown, ArrowUp, Search } from "lucide-react";
import reportService from "@/services/report.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Add new state for search and sort
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at"); // default sort by creation date
  const [orderBy, setOrderBy] = useState<string>("DESC"); // default newest first

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search or sort changes
  useEffect(() => {
    setReports([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedSearchQuery, sortBy, orderBy]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setOrderBy(orderBy === "ASC" ? "DESC" : "ASC");
  };

  const fetchReports = useCallback(
    async (resetPage = false) => {
      if (isLoading || (!hasMore && !resetPage)) return;

      setIsLoading(true);
      try {
        const currentPage = resetPage ? 1 : page;

        const response = await reportService.searchReports({
          page: currentPage,
          limit,
          search: debouncedSearchQuery,
          sort_by: sortBy,
          order_by: orderBy,
        });

        const data = response.data.result as ReportsResponse;

        console.log("Fetched reports:", data);

        if (data.reports && data.reports.length > 0) {
          setReports((prev) => {
            if (resetPage) {
              return data.reports;
            }

            const existingIds = new Set(prev.map((report) => report._id));
            const newReports = data.reports.filter(
              (report) => !existingIds.has(report._id)
            );
            return [...prev, ...newReports];
          });

          setPage((prev) => (resetPage ? 2 : prev + 1));

          if (currentPage >= data.total_pages) {
            setHasMore(false);
          } else {
            setHasMore(true);
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
    },
    [isLoading, page, limit, debouncedSearchQuery, sortBy, orderBy, hasMore]
  );

  const handleRefresh = () => {
    setReports([]);
    setPage(1);
    setHasMore(true);
    fetchReports(true);
  };

  useEffect(() => {
    fetchReports(true);
  }, [debouncedSearchQuery, sortBy, orderBy]);

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
  }, [isLoading, hasMore, fetchReports]);

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
          <Button onClick={handleRefresh}>Reload</Button>
        </CardHeader>

        <div className="px-6 pt-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-1 md:col-span-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-1 flex space-x-2">
              <div className="flex-1">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="created_at">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                title={orderBy === "ASC" ? "Sort Ascending" : "Sort Descending"}
              >
                {orderBy === "ASC" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

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
