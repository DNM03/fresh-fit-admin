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

            <TabsContent value="media" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exercise.image && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Exercise Image</h3>
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full rounded-md shadow-md"
                    />
                    <div className="flex justify-end">
                      <a
                        href={exercise.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center"
                      >
                        View full size <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}

                {exercise.video && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Exercise Video</h3>
                    <div className="aspect-video w-full rounded-md overflow-hidden shadow-md">
                      <iframe
                        src={exercise.video}
                        title={`${exercise.name} demonstration`}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        className="border-0"
                      />
                    </div>
                    <div className="flex justify-end">
                      <a
                        href={exercise.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center"
                      >
                        Watch on YouTube <PlaySquare className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
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
