import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import reportService from "@/services/report.service";

interface ReportUser {
  _id: string;
  fullName: string;
  email: string;
  verify: number;
  username: string;
  avatar: string;
}

interface ReportDetail {
  _id: string;
  from: ReportUser;
  title: string;
  message: string;
  image: string;
  status: "Read" | "Unread";
  created_at: string;
  updated_at: string;
}

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [report, setReport] = useState<ReportDetail | null>(null);

  useEffect(() => {
    if (id) {
      fetchReportDetail(id);
    }
  }, [id]);

  const fetchReportDetail = async (reportId: string) => {
    setIsLoading(true);
    try {
      const response = await reportService.getReportById(reportId);
      setReport(response.data.report);

      if (response.data.report.status === "Unread") {
        await reportService.updateReportStatus([reportId], "Read");
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Failed to load report details", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP p");
  };

  const handleGoBack = () => {
    navigate("/reports");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 !border-none mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Report Details</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-pulse">Loading report details...</div>
        </div>
      ) : !report ? (
        <div className="text-center py-6 text-muted-foreground">
          Report not found.
        </div>
      ) : (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge
                  variant={report.status === "Read" ? "outline" : "default"}
                >
                  {report.status === "Read" ? (
                    <Eye className="mr-1 h-3 w-3" />
                  ) : (
                    <EyeOff className="mr-1 h-3 w-3" />
                  )}
                  {report.status}
                </Badge>
                <span>Submitted on {formatDate(report.created_at)}</span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={report.from.avatar}
                  alt={report.from.username}
                />
                <AvatarFallback>
                  {report.from.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{report.from.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {report.from.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Username: {report.from.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Message</h3>
                <p className="mt-1 whitespace-pre-wrap">{report.message}</p>
              </div>

              {report.image && (
                <div>
                  <h3 className="text-lg font-medium">Attached Image</h3>
                  <div className="mt-2">
                    <img
                      src={report.image}
                      alt="Report attachment"
                      className="max-h-96 rounded-md object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Reports
            </Button>

            <div className="flex gap-2">
              {/* Additional action buttons can go here */}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default ReportDetailPage;
