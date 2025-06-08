import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Trash2,
  Edit,
  Clock,
  Dumbbell,
  List,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import setService from "@/services/set.service";
import exerciseService from "@/services/exercise.service";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import UpdateExerciseSetForm from "@/features/exercises/update-exercise-set-form";
import { toast } from "sonner";

interface Exercise {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

interface ExerciseInSet {
  _id: string;
  exercise_id: string;
  duration: number;
  reps: number;
  round: number;
  timePerRound: number;
  rest_per_round: number;
  estimated_calories_burned: number;
  status: string;
  orderNumber: number;
  exercise?: Exercise;
}

interface ExerciseSet {
  _id: string;
  name: string;
  type: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  number_of_exercises: number;
  set_exercises: ExerciseInSet[];
  status: string;
  time: string;
  image: string;
  total_calories: number;
  is_youtube_workout: boolean;
  youtube_id: string | null;
  created_at?: string;
  updated_at?: string;
}

function ExerciseSetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exerciseSet, setExerciseSet] = useState<ExerciseSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exerciseDetails, setExerciseDetails] = useState<{
    [key: string]: Exercise;
  }>({});

  useEffect(() => {
    const fetchExerciseSet = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await setService.getSetById(id);
        if (response.data?.set) {
          setExerciseSet(response.data.set);

          const exerciseIds = response.data.set.set_exercises.map(
            (exercise: ExerciseInSet) => exercise.exercise_id
          );

          await fetchExerciseDetails(exerciseIds);
        } else {
          setError("Exercise set not found");
        }
      } catch (err) {
        console.error("Error fetching exercise set:", err);
        setError("Failed to load exercise set details");
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseSet();
  }, [id]);

  const fetchExerciseDetails = async (exerciseIds: string[]) => {
    try {
      const details: { [key: string]: Exercise } = {};

      // Fetch details for each exercise in parallel
      await Promise.all(
        exerciseIds.map(async (exerciseId) => {
          try {
            const response = await exerciseService.getExerciseById(exerciseId);
            if (response.data?.exercise) {
              details[exerciseId] = response.data.exercise;
            }
          } catch (error) {
            console.error(`Failed to fetch exercise ${exerciseId}:`, error);
          }
        })
      );

      setExerciseDetails(details);
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await setService.deleteSet(id);
      toast.success("Exercise set deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting exercise set:", err);
      toast.error("Failed to delete exercise set. Please try again.", {
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

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
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
              <Skeleton className="h-40 w-full" />
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exerciseSet) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600">
                {error || "Failed to load exercise set"}
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Exercise Sets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Exercise Sets
        </Button>
        <div className="flex space-x-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Set
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Exercise Set</DialogTitle>
                <DialogDescription>
                  Make changes to the exercise set details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateExerciseSetForm
                  exerciseSet={exerciseSet as any}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    window.location.reload();
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
                <Trash2 className="mr-2 h-4 w-4" /> Delete Set
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{exerciseSet.name}"? This
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
                  {isDeleting ? "Deleting..." : "Delete Exercise Set"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="relative overflow-hidden">
          {exerciseSet.image && (
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url(${exerciseSet.image})` }}
            />
          )}
          <div className="relative">
            <CardTitle className="text-2xl font-bold">
              {exerciseSet.name}
            </CardTitle>
            <div className="flex items-center text-sm mt-2 space-x-2">
              <Badge
                variant="outline"
                className={getDifficultyColor(exerciseSet.type)}
              >
                {exerciseSet.type}
              </Badge>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span>
                  {exerciseSet.time
                    ? exerciseSet.time.includes(" seconds")
                      ? exerciseSet.time.replace(/ \d+ seconds/, "")
                      : exerciseSet.time
                    : "No time specified"}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Dumbbell className="mr-1 h-4 w-4" />
                <span>{exerciseSet.total_calories} calories</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <List className="mr-1 h-4 w-4" />
                <span>{exerciseSet.number_of_exercises} exercises</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              {exerciseSet.is_youtube_workout && (
                <TabsTrigger value="video">Video</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              {exerciseSet.description && (
                <div>
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {exerciseSet.description || "No description available."}
                  </p>
                </div>
              )}

              {exerciseSet.image && (
                <div>
                  <h3 className="font-semibold mb-1">Cover Image</h3>
                  <div className="mt-2 rounded-md overflow-hidden border">
                    <img
                      src={exerciseSet.image}
                      alt={exerciseSet.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Set Summary</h3>
                <dl className="divide-y divide-gray-100 border rounded-md">
                  <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">
                      Difficulty
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {exerciseSet.type}
                    </dd>
                  </div>
                  <div className="px-4 py-2 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Time
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {exerciseSet.time}
                    </dd>
                  </div>
                  <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Calories
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {exerciseSet.total_calories}
                    </dd>
                  </div>
                  <div className="px-4 py-2 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Number of Exercises
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {exerciseSet.number_of_exercises}
                    </dd>
                  </div>
                  {exerciseSet.is_youtube_workout && (
                    <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50">
                      <dt className="text-sm font-medium text-gray-500">
                        YouTube Workout
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">Yes</dd>
                    </div>
                  )}
                </dl>
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="pt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {exerciseSet.set_exercises.length > 0 ? (
                    exerciseSet.set_exercises.map(
                      (exerciseItem: any, index: number) => {
                        const exercise =
                          exerciseDetails[exerciseItem.exercise_id];

                        return (
                          <Card
                            key={exerciseItem._id}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col md:flex-row">
                              {exercise?.image && (
                                <div className="w-full md:w-1/4">
                                  <img
                                    src={exercise.image}
                                    alt={exercise.name || "Exercise image"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="p-4 flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-lg">
                                      {index + 1}.{" "}
                                      {exercise?.name || "Unknown Exercise"}
                                    </h3>
                                    {exercise?.category && (
                                      <Badge variant="outline" className="mt-1">
                                        {exercise.category}
                                      </Badge>
                                    )}
                                  </div>
                                  {exercise?._id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        navigate(
                                          `/manage-exercises/exercises/${exercise._id}`
                                        )
                                      }
                                    >
                                      View Details
                                    </Button>
                                  )}
                                </div>

                                {exercise?.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {exercise.description}
                                  </p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                                  <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="text-xs text-gray-500">
                                      Duration
                                    </p>
                                    <p className="font-medium">
                                      {exerciseItem.duration}s
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="text-xs text-gray-500">
                                      Reps
                                    </p>
                                    <p className="font-medium">
                                      {exerciseItem.reps || "N/A"}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="text-xs text-gray-500">
                                      Rounds
                                    </p>
                                    <p className="font-medium">
                                      {exerciseItem.round}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="text-xs text-gray-500">
                                      Calories
                                    </p>
                                    <p className="font-medium">
                                      {exerciseItem.estimated_calories_burned}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 text-sm flex justify-between">
                                  <div>
                                    <span className="text-gray-500">
                                      Rest per round:
                                    </span>{" "}
                                    {exerciseItem.rest_per_round}s
                                  </div>
                                  {exerciseItem.timePerRound > 0 && (
                                    <div>
                                      <span className="text-gray-500">
                                        Time per round:
                                      </span>{" "}
                                      {exerciseItem.timePerRound}s
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      }
                    )
                  ) : (
                    <div className="text-center py-10">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">
                        No exercises found
                      </h3>
                      <p className="mt-1 text-gray-500">
                        This exercise set doesn't have any exercises.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {exerciseSet.is_youtube_workout && exerciseSet.youtube_id && (
              <TabsContent value="video" className="pt-4">
                <div className="aspect-video w-full rounded-md overflow-hidden shadow-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${exerciseSet.youtube_id}`}
                    title={`${exerciseSet.name} workout video`}
                    width="100%"
                    height="100%"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${exerciseSet.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center"
                  >
                    Watch on YouTube <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>

        <CardFooter className="border-t p-4 text-sm text-muted-foreground">
          {exerciseSet.created_at && (
            <div className="w-full flex justify-between">
              <span>
                Created: {new Date(exerciseSet.created_at).toLocaleDateString()}
              </span>
              {exerciseSet.updated_at && (
                <span>
                  Last updated:{" "}
                  {new Date(exerciseSet.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ExerciseSetDetail;
