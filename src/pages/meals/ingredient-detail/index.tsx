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
  ExternalLink,
  Utensils,
} from "lucide-react";
import ingredientService from "@/services/ingredient.service";
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
import UpdateIngredientForm from "@/features/meal/update-ingredient-form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface IngredientType {
  _id: string;
  name: string;
  description: string;
  calories: number;
  image?: string;
  cab: number;
  sodium: number;
  sugar: number;
  cholesterol: number;
  fat: number;
  protein: number;
  created_at?: string;
  updated_at?: string;
}

function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState<IngredientType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchIngredient = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await ingredientService.getIngredientById(id);
        console.log("Ingredient response:", response, id);
        if (response.data?.ingredient) {
          setIngredient(response.data.ingredient);
        } else {
          setError("Ingredient not found");
        }
      } catch (err) {
        console.error("Error fetching ingredient:", err);
        setError("Failed to load ingredient details");
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await ingredientService.deleteIngredient(id);
      toast.success("Ingredient deleted successfully");
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting ingredient:", err);
      toast.error("Failed to delete ingredient. Please try again.");
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
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !ingredient) {
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
                {error || "Failed to load ingredient"}
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Ingredients
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
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Ingredients
        </Button>
        <div className="flex space-x-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Ingredient</DialogTitle>
                <DialogDescription>
                  Make changes to the ingredient details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateIngredientForm
                  ingredient={ingredient}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    // Refresh the ingredient data
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
                <Trash2 className="mr-2 h-4 w-4" /> Delete Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{ingredient.name}"? This
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
                  {isDeleting ? "Deleting..." : "Delete Ingredient"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {ingredient.name}
              </CardTitle>
              <div className="flex items-center mt-2">
                <Badge className="bg-primary/10 text-primary">
                  <Utensils className="h-3 w-3 mr-1" /> Ingredient
                </Badge>
              </div>
            </div>
            {ingredient.calories > 0 && (
              <div className="bg-amber-50 px-4 py-2 rounded-full text-center">
                <p className="text-xs text-amber-600 font-medium">Calories</p>
                <p className="text-2xl font-bold text-amber-700">
                  {ingredient.calories}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ingredient.image && (
                  <div className="space-y-2">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-64 object-cover rounded-md shadow-md"
                    />
                    <div className="flex justify-end">
                      <a
                        href={ingredient.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center"
                      >
                        View full image{" "}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  {ingredient.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {ingredient.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Key Nutrition
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-600 font-medium">
                          Protein
                        </p>
                        <p className="text-xl font-bold text-blue-700">
                          {ingredient.protein}g
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-xs text-green-600 font-medium">
                          Carbs
                        </p>
                        <p className="text-xl font-bold text-green-700">
                          {ingredient.cab}g
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-xs text-red-600 font-medium">Fat</p>
                        <p className="text-xl font-bold text-red-700">
                          {ingredient.fat}g
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <p className="text-xs text-purple-600 font-medium">
                          Sugar
                        </p>
                        <p className="text-xl font-bold text-purple-700">
                          {ingredient.sugar}g
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="pt-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-bold text-center border-b border-gray-300 pb-2">
                  Nutrition Facts
                </h3>

                <div className="py-2 border-b border-gray-300">
                  <p className="font-bold">Calories: {ingredient.calories}</p>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Fat</p>
                    <p>{ingredient.fat}g</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Cholesterol</p>
                    <p>{ingredient.cholesterol}mg</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Sodium</p>
                    <p>{ingredient.sodium}mg</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Carbohydrates</p>
                    <p>{ingredient.cab}g</p>
                  </div>

                  <div className="flex justify-between pl-6 mt-1">
                    <p>Sugars</p>
                    <p>{ingredient.sugar}g</p>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex justify-between">
                    <p className="font-bold">Protein</p>
                    <p>{ingredient.protein}g</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  The % Daily Value (DV) tells you how much a nutrient in a
                  serving of food contributes to a daily diet. 2,000 calories a
                  day is used for general nutrition advice.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {(ingredient.created_at || ingredient.updated_at) && (
          <CardFooter className="border-t p-4 text-sm text-muted-foreground">
            <div className="w-full flex justify-between">
              {ingredient.created_at && (
                <span>
                  Created:{" "}
                  {new Date(ingredient.created_at).toLocaleDateString()}
                </span>
              )}
              {ingredient.updated_at && (
                <span>
                  Last updated:{" "}
                  {new Date(ingredient.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default IngredientDetail;
