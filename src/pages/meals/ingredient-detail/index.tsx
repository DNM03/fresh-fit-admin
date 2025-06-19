import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChevronLeft, Trash2, ExternalLink, Utensils } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Define interfaces for the API response
interface ServingData {
  serving_id: string;
  serving_description: string;
  serving_url: string;
  metric_serving_amount: string;
  metric_serving_unit: string;
  number_of_units: string;
  measurement_description: string;
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  saturated_fat: string;
  polyunsaturated_fat: string;
  monounsaturated_fat: string;
  cholesterol: string;
  sodium: string;
  potassium: string;
  fiber: string;
  sugar: string;
  vitamin_a: string;
  vitamin_c: string;
  calcium: string;
  iron: string;
}

interface FatSecretIngredient {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  servings: {
    serving: ServingData[] | ServingData;
  };
}

// Original interface for backward compatibility
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
  const location = useLocation();
  const passedState = location.state?.ingredientData?.name;
  const navigate = useNavigate();

  // State for original ingredient data
  const [ingredient, setIngredient] = useState<IngredientType | null>(null);

  // New state for FatSecret data
  const [fatSecretData, setFatSecretData] = useState<ServingData | null>(null);
  const [foodDetails, setFoodDetails] = useState<{
    name: string;
    type: string;
    url: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchIngredient = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Get FatSecret data by name if available
        if (passedState) {
          // Add retry logic for FatSecret API
          let retryCount = 0;
          const maxRetries = 3;
          let fatSecretSuccess = false;
          let fatSecretError = null;

          while (retryCount < maxRetries && !fatSecretSuccess) {
            try {
              console.log(
                `Attempting FatSecret API call (attempt ${
                  retryCount + 1
                }/${maxRetries})...`
              );

              const fatSecretResponse =
                await ingredientService.getIngredientByName(passedState);
              console.log(
                `FatSecret response attempt ${retryCount + 1}:`,
                fatSecretResponse
              );

              if (fatSecretResponse.data?.ingredient) {
                const fsIngredient = fatSecretResponse.data
                  .ingredient as FatSecretIngredient;

                // Extract the first serving data
                let servingData: ServingData | null = null;

                if (Array.isArray(fsIngredient.servings.serving)) {
                  // If there are multiple servings, take the first one
                  servingData = fsIngredient.servings.serving[0];
                } else if (fsIngredient.servings.serving) {
                  // If there's only one serving
                  servingData = fsIngredient.servings.serving;
                }

                if (servingData) {
                  setFatSecretData(servingData);
                  setFoodDetails({
                    name: fsIngredient.food_name,
                    type: fsIngredient.food_type,
                    url: fsIngredient.food_url,
                  });
                  fatSecretSuccess = true;
                }
              }

              // If we get here without throwing an error, we can exit the retry loop
              break;
            } catch (err) {
              fatSecretError = err;
              retryCount++;
              console.error(
                `FatSecret API call failed (attempt ${retryCount}/${maxRetries}):`,
                err
              );

              if (retryCount < maxRetries) {
                // Wait a bit before retrying (using exponential backoff)
                const delayMs = Math.min(
                  1000 * Math.pow(2, retryCount - 1),
                  5000
                );
                console.log(`Retrying in ${delayMs}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
              }
            }
          }

          if (!fatSecretSuccess && retryCount === maxRetries) {
            console.error(
              `All ${maxRetries} attempts to call FatSecret API failed:`,
              fatSecretError
            );
            // Don't set error here, we'll fall back to the original data
          }
        }

        // Also get our database ingredient data
        const response = await ingredientService.getIngredientById(id);
        console.log("Ingredient database response:", response);

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
  }, [id, passedState]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await ingredientService.deleteIngredient(id);
      toast.success("Ingredient deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting ingredient:", err);
      toast.error("Failed to delete ingredient. Please try again.", {
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

  if (error || (!ingredient && !fatSecretData)) {
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
                {error || "Failed to load ingredient data"}
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

  // Use FatSecret data if available, otherwise fall back to our database data
  const displayName = foodDetails?.name || ingredient?.name || "";
  const calories = fatSecretData
    ? parseInt(fatSecretData.calories)
    : ingredient?.calories || 0;

  const displayCarbs = fatSecretData
    ? parseFloat(fatSecretData.carbohydrate)
    : ingredient?.cab || 0;

  const displayProtein = fatSecretData
    ? parseFloat(fatSecretData.protein)
    : ingredient?.protein || 0;

  const displayFat = fatSecretData
    ? parseFloat(fatSecretData.fat)
    : ingredient?.fat || 0;

  const displaySugar = fatSecretData
    ? parseFloat(fatSecretData.sugar)
    : ingredient?.sugar || 0;

  const displayCholesterol = fatSecretData
    ? parseFloat(fatSecretData.cholesterol)
    : ingredient?.cholesterol || 0;

  const displaySodium = fatSecretData
    ? parseFloat(fatSecretData.sodium)
    : ingredient?.sodium || 0;

  // Extra nutrition data from FatSecret
  const servingDescription = fatSecretData?.serving_description || "100g";
  const fiber = fatSecretData?.fiber ? parseFloat(fatSecretData.fiber) : null;
  const potassium = fatSecretData?.potassium
    ? parseFloat(fatSecretData.potassium)
    : null;
  const vitaminA = fatSecretData?.vitamin_a
    ? parseFloat(fatSecretData.vitamin_a)
    : null;
  const vitaminC = fatSecretData?.vitamin_c
    ? parseFloat(fatSecretData.vitamin_c)
    : null;
  const calcium = fatSecretData?.calcium
    ? parseFloat(fatSecretData.calcium)
    : null;
  const iron = fatSecretData?.iron ? parseFloat(fatSecretData.iron) : null;

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
                  Are you sure you want to delete "{passedState}"? This action
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
                {passedState}
              </CardTitle>
              <div className="flex items-center mt-2">
                <Badge className="bg-primary/10 text-primary mr-2">
                  <Utensils className="h-3 w-3 mr-1" /> Ingredient
                </Badge>
                {foodDetails?.type && (
                  <Badge variant="outline">{foodDetails.type}</Badge>
                )}
              </div>
            </div>
            {calories > 0 && (
              <div className="bg-amber-50 px-4 py-2 rounded-2xl text-center">
                <p className="text-xs text-amber-600 font-medium">Calories</p>
                <p className="text-2xl font-bold text-amber-700">{calories}</p>
                <p className="text-xs text-amber-600">
                  per {servingDescription}
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
              {foodDetails?.url && (
                <TabsTrigger value="source" className="ml-auto">
                  <ExternalLink className="h-3 w-3 mr-1" /> Source
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ingredient?.image && (
                  <div className="space-y-2">
                    <img
                      src={ingredient.image}
                      alt={displayName}
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
                  {ingredient?.description && (
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
                    <p className="text-sm text-gray-500 mb-3">
                      Per {servingDescription}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-600 font-medium">
                          Protein
                        </p>
                        <p className="text-xl font-bold text-blue-700">
                          {displayProtein}g
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-xs text-green-600 font-medium">
                          Carbs
                        </p>
                        <p className="text-xl font-bold text-green-700">
                          {displayCarbs}g
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-xs text-red-600 font-medium">Fat</p>
                        <p className="text-xl font-bold text-red-700">
                          {displayFat}g
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <p className="text-xs text-purple-600 font-medium">
                          Sugar
                        </p>
                        <p className="text-xl font-bold text-purple-700">
                          {displaySugar}g
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {fatSecretData && (
                <div className="mt-6 bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    Additional Nutrition Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fiber !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Dietary Fiber
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {fiber}g
                        </p>
                      </div>
                    )}

                    {potassium !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Potassium
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {potassium}mg
                        </p>
                      </div>
                    )}

                    {vitaminA !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Vitamin A
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {vitaminA}%
                        </p>
                      </div>
                    )}

                    {vitaminC !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Vitamin C
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {vitaminC}%
                        </p>
                      </div>
                    )}

                    {calcium !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Calcium
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {calcium}%
                        </p>
                      </div>
                    )}

                    {iron !== null && (
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-gray-600 font-medium">
                          Iron
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {iron}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="pt-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-bold text-center border-b border-gray-300 pb-2">
                  Nutrition Facts
                </h3>
                <p className="text-center text-sm py-1">
                  Serving Size: {servingDescription}
                </p>

                <div className="py-2 border-b border-gray-300">
                  <p className="font-bold">Calories: {calories}</p>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Fat</p>
                    <p>{displayFat}g</p>
                  </div>

                  {fatSecretData?.saturated_fat && (
                    <div className="flex justify-between pl-6 mt-1">
                      <p>Saturated Fat</p>
                      <p>{parseFloat(fatSecretData.saturated_fat)}g</p>
                    </div>
                  )}

                  {fatSecretData?.polyunsaturated_fat && (
                    <div className="flex justify-between pl-6 mt-1">
                      <p>Polyunsaturated Fat</p>
                      <p>{parseFloat(fatSecretData.polyunsaturated_fat)}g</p>
                    </div>
                  )}

                  {fatSecretData?.monounsaturated_fat && (
                    <div className="flex justify-between pl-6 mt-1">
                      <p>Monounsaturated Fat</p>
                      <p>{parseFloat(fatSecretData.monounsaturated_fat)}g</p>
                    </div>
                  )}
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Cholesterol</p>
                    <p>{displayCholesterol}mg</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Sodium</p>
                    <p>{displaySodium}mg</p>
                  </div>
                </div>

                {potassium !== null && (
                  <div className="py-2 border-b border-gray-300">
                    <div className="flex justify-between">
                      <p className="font-bold">Potassium</p>
                      <p>{potassium}mg</p>
                    </div>
                  </div>
                )}

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Carbohydrates</p>
                    <p>{displayCarbs}g</p>
                  </div>

                  {fiber !== null && (
                    <div className="flex justify-between pl-6 mt-1">
                      <p>Dietary Fiber</p>
                      <p>{fiber}g</p>
                    </div>
                  )}

                  <div className="flex justify-between pl-6 mt-1">
                    <p>Sugars</p>
                    <p>{displaySugar}g</p>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex justify-between">
                    <p className="font-bold">Protein</p>
                    <p>{displayProtein}g</p>
                  </div>
                </div>

                {/* Vitamins and Minerals */}
                {(vitaminA !== null ||
                  vitaminC !== null ||
                  calcium !== null ||
                  iron !== null) && (
                  <div className="py-2 mt-4 border-t border-gray-300">
                    {vitaminA !== null && (
                      <div className="flex justify-between mt-1">
                        <p>Vitamin A</p>
                        <p>{vitaminA}%</p>
                      </div>
                    )}
                    {vitaminC !== null && (
                      <div className="flex justify-between mt-1">
                        <p>Vitamin C</p>
                        <p>{vitaminC}%</p>
                      </div>
                    )}
                    {calcium !== null && (
                      <div className="flex justify-between mt-1">
                        <p>Calcium</p>
                        <p>{calcium}%</p>
                      </div>
                    )}
                    {iron !== null && (
                      <div className="flex justify-between mt-1">
                        <p>Iron</p>
                        <p>{iron}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  The % Daily Value (DV) tells you how much a nutrient in a
                  serving of food contributes to a daily diet. 2,000 calories a
                  day is used for general nutrition advice.
                </p>
                {foodDetails?.url && (
                  <p className="mt-2">
                    Source data from{" "}
                    <a
                      href={foodDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      FatSecret
                    </a>
                  </p>
                )}
              </div>
            </TabsContent>

            {foodDetails?.url && (
              <TabsContent value="source" className="pt-4">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Data Source</h3>
                  <p className="mb-3">
                    This nutrition information is provided by FatSecret's food
                    database.
                  </p>
                  <p className="mb-6">
                    For more detailed information about this ingredient,
                    including other serving sizes and additional nutritional
                    data, visit the original source:
                  </p>
                  <a
                    href={foodDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on FatSecret
                  </a>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>

        {(ingredient?.created_at || ingredient?.updated_at) && (
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
