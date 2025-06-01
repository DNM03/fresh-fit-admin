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
  Clock,
  Utensils,
  PlusCircle,
  Star,
} from "lucide-react";
import dishService from "@/services/dish.service";
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
import UpdateDishForm from "@/features/meal/update-dish-form";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddIngredientToDishForm from "@/features/meal/add-ingredient-to-dish-form";
import UpdateDishIngredientForm from "@/features/meal/update-dish-ingredient-form";
import { toast } from "sonner";

interface Ingredient {
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
}

interface IngredientInDish {
  _id: string;
  quantity: string | number;
  unit: string;
  ingredient: Ingredient;
}

interface DishType {
  _id: string;
  name: string;
  description: string;
  calories: number;
  prep_time: number;
  rating: number;
  image?: string;
  instruction: string;
  fat: number;
  saturatedFat: number;
  cholesterol: number;
  sodium: number;
  carbohydrate: number;
  fiber: number;
  sugar: number;
  protein: number;
  ingredients: IngredientInDish[];
  created_at?: string;
  updated_at?: string;
}

function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<DishType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isAddIngredientDialogOpen, setIsAddIngredientDialogOpen] =
    useState(false);
  const [isUpdateIngredientDialogOpen, setIsUpdateIngredientDialogOpen] =
    useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientInDish | null>(null);
  const [isRemovingIngredient, setIsRemovingIngredient] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(
    null
  );
  const [isDeleteIngredientDialogOpen, setIsDeleteIngredientDialogOpen] =
    useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await dishService.getDishById(id);
        if (response.data?.dish) {
          setDish(response.data.dish);
        } else {
          setError("Dish not found");
        }
      } catch (err) {
        console.error("Error fetching dish:", err);
        setError("Failed to load dish details");
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  const handleRemoveIngredient = async (ingredientId: string) => {
    if (!id || !ingredientId) return;

    try {
      setIsRemovingIngredient(true);
      await dishService.deleteDishIngredient(id, ingredientId);

      const response = await dishService.getDishById(id);
      if (response.data?.dish) {
        setDish(response.data.dish);
      }

      toast.success("Ingredient removed successfully!");
    } catch (err) {
      console.error("Error removing ingredient:", err);
      toast.error("Failed to remove ingredient. Please try again.");
    } finally {
      setIsRemovingIngredient(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const refreshDishData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await dishService.getDishById(id);
      if (response.data?.dish) {
        setDish(response.data.dish);
      }
    } catch (err) {
      console.error("Error refreshing dish data:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
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

  if (error || !dish) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600">{error || "Failed to load dish"}</p>
              <Button onClick={handleGoBack} className="mt-4">
                Return to Dishes
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
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dishes
        </Button>
        <div className="flex space-x-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Dish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Dish</DialogTitle>
                <DialogDescription>
                  Make changes to the dish details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UpdateDishForm
                  dish={dish}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    refreshDishData();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">{dish.name}</CardTitle>
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {dish.prep_time / 60} minutes
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {dish.calories} calories
                </Badge>
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="flex">{renderStars(dish.rating)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dish?.image && (
                  <div className="space-y-2">
                    <img
                      src={dish?.image}
                      alt={dish?.name}
                      className="w-full h-64 object-cover rounded-md shadow-md"
                    />
                    <div className="flex justify-end">
                      <a
                        href={dish?.image}
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
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {dish.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Quick Facts</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-amber-50 p-3 rounded-md">
                        <p className="text-xs text-amber-600 font-medium">
                          Calories
                        </p>
                        <p className="text-xl font-bold text-amber-700">
                          {dish.calories}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-xs text-green-600 font-medium">
                          Prep Time
                        </p>
                        <p className="text-xl font-bold text-green-700">
                          {dish.prep_time} min
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-600 font-medium">
                          Ingredients
                        </p>
                        <p className="text-xl font-bold text-blue-700">
                          {dish.ingredients.length}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <p className="text-xs text-purple-600 font-medium">
                          Protein
                        </p>
                        <p className="text-xl font-bold text-purple-700">
                          {dish.protein}g
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="pt-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Ingredients</h3>
                <Dialog
                  open={isAddIngredientDialogOpen}
                  onOpenChange={setIsAddIngredientDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Ingredient to Dish</DialogTitle>
                      <DialogDescription>
                        Select an ingredient and specify the quantity
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <AddIngredientToDishForm
                        dishId={dish._id}
                        onSuccess={() => {
                          setIsAddIngredientDialogOpen(false);
                          refreshDishData();
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                {dish.ingredients.length > 0 ? (
                  <div className="space-y-3">
                    {dish.ingredients.map((item) => (
                      <Card
                        key={item._id}
                        className="p-4 border hover:border-primary/20 transition-colors"
                      >
                        <div className="flex justify-between">
                          <div className="flex space-x-3">
                            {item.ingredient?.image && (
                              <div className="h-12 w-12 rounded-md overflow-hidden">
                                <img
                                  src={item.ingredient?.image}
                                  alt={item.ingredient?.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">
                                {item.ingredient?.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item?.quantity} {item?.unit}
                              </p>
                              {item.ingredient?.calories > 0 && (
                                <p className="text-xs text-amber-600">
                                  {item.ingredient?.calories} calories
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Dialog
                              open={
                                isUpdateIngredientDialogOpen &&
                                selectedIngredient?._id === item._id
                              }
                              onOpenChange={(open) => {
                                setIsUpdateIngredientDialogOpen(open);
                                if (!open) setSelectedIngredient(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setSelectedIngredient(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Update Ingredient</DialogTitle>
                                  <DialogDescription>
                                    Update quantity and unit for{" "}
                                    {item.ingredient?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <UpdateDishIngredientForm
                                    dishId={dish._id}
                                    ingredientItem={item}
                                    onSuccess={() => {
                                      setIsUpdateIngredientDialogOpen(false);
                                      setSelectedIngredient(null);
                                      refreshDishData();
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog
                              open={
                                isDeleteIngredientDialogOpen &&
                                ingredientToDelete === item._id
                              }
                              onOpenChange={(open) => {
                                setIsDeleteIngredientDialogOpen(open);
                                if (!open) setIngredientToDelete(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setIngredientToDelete(item._id);
                                    setIsDeleteIngredientDialogOpen(true);
                                  }}
                                  disabled={isRemovingIngredient}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Remove Ingredient</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to remove{" "}
                                    {item.ingredient?.name} from this dish? This
                                    action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsDeleteIngredientDialogOpen(false);
                                      setIngredientToDelete(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      handleRemoveIngredient(item?._id);
                                      setIsDeleteIngredientDialogOpen(false);
                                      setIngredientToDelete(null);
                                    }}
                                    disabled={isRemovingIngredient}
                                  >
                                    {isRemovingIngredient
                                      ? "Removing..."
                                      : "Remove Ingredient"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No ingredients
                    </h3>
                    <p className="mt-1 text-gray-500">
                      This dish doesn't have any ingredients yet.
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => setIsAddIngredientDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="instructions" className="pt-4">
              {dish.instruction ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Cooking Instructions
                  </h3>
                  {dish.instruction.split("|").map((step, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex items-start">
                        <div className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                      </div>
                      <p className="flex-1 text-gray-700">{step.trim()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-gray-600">
                    No instructions available for this dish.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="pt-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl font-bold text-center border-b border-gray-300 pb-2">
                  Nutrition Facts
                </h3>
                <div className="text-sm text-gray-500 text-center mt-1 mb-2">
                  Per serving
                </div>

                <div className="py-2 border-b border-gray-300">
                  <p className="font-bold text-2xl">
                    Calories: {dish.calories}
                  </p>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Fat</p>
                    <p>{dish.fat}g</p>
                  </div>
                  <div className="flex justify-between pl-6 mt-1">
                    <p>Saturated Fat</p>
                    <p>{dish.saturatedFat}g</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Cholesterol</p>
                    <p>{dish.cholesterol}mg</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Sodium</p>
                    <p>{dish.sodium}mg</p>
                  </div>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex justify-between">
                    <p className="font-bold">Total Carbohydrates</p>
                    <p>{dish.carbohydrate}g</p>
                  </div>
                  <div className="flex justify-between pl-6 mt-1">
                    <p>Dietary Fiber</p>
                    <p>{dish.fiber}g</p>
                  </div>
                  <div className="flex justify-between pl-6 mt-1">
                    <p>Sugars</p>
                    <p>{dish.sugar}g</p>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex justify-between">
                    <p className="font-bold">Protein</p>
                    <p>{dish.protein}g</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  * Percent Daily Values are based on a 2,000 calorie diet. Your
                  daily values may be higher or lower depending on your calorie
                  needs.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {(dish.created_at || dish.updated_at) && (
          <CardFooter className="border-t p-4 text-sm text-muted-foreground">
            <div className="w-full flex justify-between">
              {dish.created_at && (
                <span>
                  Created: {new Date(dish.created_at).toLocaleDateString()}
                </span>
              )}
              {dish.updated_at && (
                <span>
                  Last updated: {new Date(dish.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default DishDetail;
