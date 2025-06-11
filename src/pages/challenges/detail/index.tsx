import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Trash2,
  Edit,
  CalendarRange,
  Trophy,
  Target,
  Flame,
  HeartPulse,
  Calendar,
  BarChart,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import challengeService from "@/services/challenge.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import UpdateChallengeForm from "@/features/challenges/update-challenge-form";
import { toast } from "sonner";

function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await challengeService.getChallengeById(id);
        console.log("Challenge data:", response);
        if (response.data?.challenge) {
          setChallenge(response.data.challenge);
        } else {
          setError("Challenge not found");
        }
      } catch (err) {
        console.error("Error fetching challenge:", err);
        setError("Failed to load challenge details");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await challengeService.deleteChallenge(id);
      toast.success("Challenge deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting challenge:", err);
      toast.error("Failed to delete challenge. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = () => {
    if (!challenge?.start_date || !challenge?.end_date) return 0;

    const start = new Date(challenge.start_date).getTime();
    const end = new Date(challenge.end_date).getTime();
    const now = Date.now();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.floor(((now - start) / (end - start)) * 100);
  };

  const openActivateDialog = () => {
    setNewStatus("Active");
    setIsStatusDialogOpen(true);
  };

  const openDeactivateDialog = () => {
    setNewStatus("Inactive");
    setIsStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!id || !newStatus) return;

    try {
      setIsStatusUpdating(true);
      // Update the challenge status
      if (newStatus === "Active") {
        await challengeService.activateChallenge(id);
      } else {
        await challengeService.deactivateChallenge(id);
      }

      setChallenge((prev: any) => ({
        ...prev,
        status: newStatus,
      }));

      toast(
        `The challenge has been ${
          newStatus === "Active" ? "activated" : "deactivated"
        } successfully.`
      );

      setIsStatusDialogOpen(false);
    } catch (err) {
      console.error(
        `Error ${
          newStatus === "Active" ? "activating" : "deactivating"
        } challenge:`,
        err
      );
      toast(
        `Failed to ${
          newStatus === "Active" ? "activate" : "deactivate"
        } challenge. Please try again.`
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const renderStatusButton = () => {
    if (!challenge) return null;

    if (challenge.status === "Active") {
      return (
        <Button
          variant="outline"
          className="flex items-center bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
          onClick={openDeactivateDialog}
        >
          <Pause className="mr-2 h-4 w-4" /> Deactivate Challenge
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline"
          className="flex items-center bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
          onClick={openActivateDialog}
        >
          <Play className="mr-2 h-4 w-4" /> Activate Challenge
        </Button>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600">
                {error || "Failed to load challenge"}
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Challenges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Challenges
        </Button>
        <div className="flex space-x-2">
          {renderStatusButton()}

          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Challenge</DialogTitle>
                <DialogDescription>
                  Make changes to the challenge details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateChallengeForm
                  challenge={challenge}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    // window.location.reload();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{challenge.name}"? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Challenge"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {newStatus === "Active" ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              )}
              {newStatus === "Active"
                ? "Activate Challenge"
                : "Deactivate Challenge"}
            </DialogTitle>
            <DialogDescription>
              {newStatus === "Active"
                ? "This will make the challenge visible and available to users."
                : "This will hide the challenge and prevent new users from joining."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isStatusUpdating}
            >
              Cancel
            </Button>
            <Button
              variant={newStatus === "Active" ? "default" : "outline"}
              onClick={handleStatusChange}
              disabled={isStatusUpdating}
              className={
                newStatus === "Active"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
              }
            >
              {isStatusUpdating
                ? "Processing..."
                : newStatus === "Active"
                ? "Activate"
                : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mb-6 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <Badge className={getStatusColor(challenge.status)}>
                {challenge.status}
              </Badge>
              <CardTitle className="text-2xl font-bold mt-2">
                {challenge.name}
              </CardTitle>
              <CardDescription className="text-base">
                {challenge.description}
              </CardDescription>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarRange className="h-3.5 w-3.5" />
                {formatDate(challenge.start_date)} -{" "}
                {formatDate(challenge.end_date)}
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-1 flex justify-between items-center">
              <span>Challenge Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="healthplan">Health Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    {challenge.image ? (
                      <img
                        src={challenge.image}
                        alt={challenge.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/800x400/eee/ccc?text=Challenge+Image";
                        }}
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-7">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium border-b pb-2 mb-3">
                      Prize Details
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md border overflow-hidden">
                        {challenge.prize_image ? (
                          <img
                            src={challenge.prize_image}
                            alt="Prize"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/100x100/ffd/fc9?text=Prize";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-100">
                            <Trophy className="h-8 w-8 text-amber-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {challenge.prize_title || "No prize title"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Awarded to participants who complete the challenge
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    {/* <h3 className="text-lg font-medium mb-2">
                      Challenge Information
                    </h3> */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Type
                        </div>
                        <div className="font-medium">{challenge.type}</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Target className="h-4 w-4 mr-1" />
                          Target
                        </div>
                        <div className="font-medium">{challenge.target}</div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium border-b pb-2 mb-3">
                      Target Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Weight Loss Target
                        </div>
                        <div className="font-medium">
                          {challenge.weight_loss_target} kg
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Fat Percentage Target
                        </div>
                        <div className="font-medium">
                          {challenge.fat_percent}%
                        </div>
                      </div>

                      {challenge.target_image && (
                        <div className="mt-3">
                          <div className="text-sm text-muted-foreground mb-2">
                            Target Image
                          </div>
                          <img
                            src={challenge.target_image}
                            alt="Target"
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/400x200/efe/6c6?text=Target";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div> */}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="healthplan" className="pt-4">
              {challenge.health_plan ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex flex-col items-start space-x-2">
                        <CardTitle className="text-lg">
                          {challenge.health_plan.name}
                        </CardTitle>
                        <CardDescription>
                          {challenge.health_plan.description}
                        </CardDescription>
                      </div>
                      {/* <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={() =>
                          navigate(
                            `/manage-challenges/health-plans/${challenge.health_plan.id}`
                          )
                        }
                      >
                        View Health Plan
                        <ChevronRight className="mr-2 h-4 w-4" />
                      </Button> */}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-md p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Duration
                          </div>
                          <div className="text-lg font-medium">
                            {challenge.health_plan.number_of_weeks} weeks
                          </div>
                        </div>
                        <div className="border rounded-md p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Level
                          </div>
                          <div className="text-lg font-medium">
                            {challenge.health_plan.level}
                          </div>
                        </div>
                        <div className="border rounded-md p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Status
                          </div>
                          <div className="text-lg font-medium">
                            {challenge.health_plan.status}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="border rounded-md p-4 bg-amber-50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground mb-1">
                              Calories Burned
                            </div>
                            <div className="flex items-center text-lg font-medium">
                              <Flame className="h-4 w-4 mr-1 text-amber-500" />
                              {challenge.health_plan
                                .estimated_calories_burned || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="border rounded-md p-4 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground mb-1">
                              Calories Intake
                            </div>
                            <div className="flex items-center text-lg font-medium">
                              <HeartPulse className="h-4 w-4 mr-1 text-green-500" />
                              {challenge.health_plan
                                .estimated_calories_intake || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          className="flex items-center"
                          onClick={() =>
                            navigate(
                              `/manage-challenges/health-plans/${challenge.health_plan._id}`
                            )
                          }
                        >
                          View Health Plan
                          <ChevronRight className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <div className="mb-4 opacity-50">
                    <BarChart className="h-16 w-16 mx-auto text-gray-400" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">
                    No Health Plan Assigned
                  </h3>
                  <p className="text-gray-500">
                    This challenge does not have an associated health plan.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t bg-gray-50 text-sm text-muted-foreground">
          <div className="w-full grid grid-cols-2 gap-2">
            <div>
              Created: {formatDate(challenge.created_at || challenge.createdAt)}
            </div>
            {challenge.updated_at && (
              <div className="text-right">
                Last updated: {formatDate(challenge.updated_at)}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ChallengeDetail;
