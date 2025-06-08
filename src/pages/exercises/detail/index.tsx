import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  Trash2,
  Edit,
  ExternalLink,
  PlaySquare,
} from "lucide-react";
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
import { ExerciseType } from "@/constants/types";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateExerciseForm from "@/features/exercises/update-exercise-form";
import { toast } from "sonner";

function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await exerciseService.getExerciseById(id);
        console.log("Exercise response:", response, id);
        if (response.data?.exercise) {
          setExercise(response.data.exercise);
        } else {
          setError("Exercise not found");
        }
      } catch (err) {
        console.error("Error fetching exercise:", err);
        setError("Failed to load exercise details");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await exerciseService.deleteExercise(id);
      toast.success("Exercise deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting exercise:", err);
      toast.error("Failed to delete exercise. Please try again.", {
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
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-2 gap-4">
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

  if (error || !exercise) {
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
                {error || "Failed to load exercise"}
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Exercises
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
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Exercises
        </Button>
        <div className="flex space-x-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Exercise</DialogTitle>
                <DialogDescription>
                  Make changes to the exercise details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateExerciseForm
                  exercise={exercise}
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
                <Trash2 className="mr-2 h-4 w-4" /> Delete Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{exercise.name}"? This action
                  cannot be undone.
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
                  {isDeleting ? "Deleting..." : "Delete Exercise"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{exercise.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md mr-2">
              {exercise.category}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
              {exercise.experience_level}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="instructions">
                Instructions & Tips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {exercise.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="font-semibold mb-2">Primary Information</h3>
                  <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50 rounded">
                      <dt className="text-sm font-medium text-gray-500">
                        Type
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {exercise.type}
                      </dd>
                    </div>
                    <div className="px-4 py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Calories
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {exercise.calories_burn_per_minutes} per minute
                      </dd>
                    </div>
                    <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50 rounded">
                      <dt className="text-sm font-medium text-gray-500">
                        Equipment
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {exercise.equipment || "None"}
                      </dd>
                    </div>
                    <div className="px-4 py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Mechanics
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {exercise.mechanics}
                      </dd>
                    </div>
                    <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-gray-50 rounded">
                      <dt className="text-sm font-medium text-gray-500">
                        Force Type
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {exercise.forceType}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Muscle Information</h3>
                  <div className="space-y-4">
                    {exercise.target_muscle && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm font-medium mb-1">
                          Target Muscle
                        </h4>
                        <p className="text-sm mb-2">
                          {exercise.target_muscle.name}
                        </p>
                        {exercise.target_muscle.image && (
                          <img
                            src={exercise.target_muscle.image}
                            alt={`${exercise.target_muscle.name} muscle`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                      </div>
                    )}

                    {exercise.secondary_muscle && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm font-medium mb-1">
                          Secondary Muscles
                        </h4>
                        <p className="text-sm mb-2">
                          {exercise.secondary_muscle.name}
                        </p>
                        {exercise.secondary_muscle.image && (
                          <img
                            src={exercise.secondary_muscle.image}
                            alt={`${exercise.secondary_muscle.name} muscle`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-3">
                  <PlaySquare className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Exercise Media</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {exercise.image ? (
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 flex items-center">
                          <img
                            src="/icons/image.svg"
                            alt=""
                            className="w-4 h-4 mr-2"
                          />
                          Image Reference
                        </h3>
                        <a
                          href={exercise.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 flex items-center"
                        >
                          View full size{" "}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>

                      <div className="relative overflow-hidden rounded-md aspect-[4/3] bg-white">
                        <img
                          src={exercise.image}
                          alt={exercise.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-exercise.png";
                            e.currentTarget.classList.add("opacity-60");
                          }}
                        />
                      </div>

                      <p className="text-sm text-slate-500 italic">
                        Visual demonstration of proper{" "}
                        {exercise.name.toLowerCase()} form
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-6 space-y-3 shadow-sm border border-dashed border-slate-300">
                      <img
                        src="/icons/no-image.svg"
                        alt="No image"
                        className="w-16 h-16 opacity-40"
                      />
                      <p className="text-slate-500 text-center">
                        No image available for this exercise
                      </p>
                    </div>
                  )}

                  {exercise.video ? (
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 flex items-center">
                          <PlaySquare className="h-4 w-4 mr-2 text-red-500" />
                          Video Demonstration
                        </h3>
                        <a
                          href={exercise.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 flex items-center"
                        >
                          Open Video <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>

                      <div className="relative overflow-hidden rounded-md aspect-video bg-black">
                        {exercise.video.includes("youtube.com") ||
                        exercise.video.includes("youtu.be") ? (
                          // YouTube video handling
                          <iframe
                            src={exercise.video
                              .replace(
                                "youtube.com/watch?v=",
                                "youtube.com/embed/"
                              )
                              .replace("youtu.be/", "youtube.com/embed/")}
                            title={`${exercise.name} demonstration`}
                            width="100%"
                            height="100%"
                            allowFullScreen
                            className="border-0"
                            loading="lazy"
                          />
                        ) : exercise.video.includes("vimeo.com") ? (
                          // Vimeo video handling
                          <iframe
                            src={exercise.video.replace(
                              "vimeo.com/",
                              "player.vimeo.com/video/"
                            )}
                            title={`${exercise.name} demonstration`}
                            width="100%"
                            height="100%"
                            allowFullScreen
                            className="border-0"
                            loading="lazy"
                          />
                        ) : exercise.video.match(/\.(mp4|webm|ogv)$/i) ? (
                          // Direct video file handling
                          <video
                            controls
                            className="w-full h-full"
                            preload="metadata"
                          >
                            <source
                              src={exercise.video}
                              type={`video/${exercise.video.split(".").pop()}`}
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          // Fallback for other video sources
                          <div className="flex flex-col items-center justify-center h-full">
                            <a
                              href={exercise.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
                            >
                              <PlaySquare className="mr-2 h-5 w-5" />
                              Watch Video
                            </a>
                            <p className="text-white text-sm mt-2">
                              Video available at external source
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 italic">
                        Watch the proper technique and movement pattern for{" "}
                        {exercise.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-6 space-y-3 shadow-sm border border-dashed border-slate-300">
                      <PlaySquare className="w-16 h-16 opacity-40" />
                      <p className="text-slate-500 text-center">
                        No video available for this exercise
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 border-t pt-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">
                    Additional Resources
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          exercise.name + " proper form"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PlaySquare className="h-4 w-4" /> Find more videos
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          exercise.name + " muscle anatomy"
                        )}&tbm=isch`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src="/icons/muscles.svg"
                          alt=""
                          className="w-4 h-4"
                        />{" "}
                        Muscle anatomy
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 pt-4">
              {exercise.instructions && (
                <div>
                  <h3 className="font-semibold mb-1">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {exercise.instructions}
                  </p>
                </div>
              )}

              {exercise.tips && (
                <div>
                  <h3 className="font-semibold mb-1">Tips</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {exercise.tips}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        {/* <CardFooter className="border-t p-4 text-sm text-muted-foreground">
          <div className="w-full flex justify-between">
            <span>Created: {new Date(exercise.created_at).toLocaleDateString()}</span>
            {exercise.updated_at && (
              <span>Last updated: {new Date(exercise.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </CardFooter> */}
      </Card>
    </div>
  );
}

export default ExerciseDetail;
