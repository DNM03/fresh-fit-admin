import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, PlusCircle, Trash2, ChevronRight } from "lucide-react";
import type {
  DishType,
  IngredientType,
  DishIngredientType,
} from "@/constants/types";
import InputWithLabel from "@/components/inputs/input-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";

export default function DishForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const defaultValues: Partial<DishType> = {
    name: "",
    description: "",
    image: "",
    calories: 0,
    instructions: "",
    prepTime: 0,
  };

  const form = useForm<DishType>({
    defaultValues: defaultValues as DishType,
    mode: "onChange",
  });

  const [ingredients, setIngredients] = useState<
    Array<DishIngredientType & { name: string }>
  >([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    IngredientType[]
  >([
    {
      id: "1",
      name: "Chicken Breast",
      calories: 165,
      carbs: 0,
      fat: 3.6,
      image: "/placeholder.svg?height=100&width=100",
      sugar: 0,
      cholesterol: 85,
      sodium: 74,
      description: "Lean protein source, boneless and skinless.",
    },
    {
      id: "2",
      name: "Brown Rice",
      calories: 112,
      carbs: 24,
      fat: 0.9,
      image: "/placeholder.svg?height=100&width=100",
      sugar: 0.4,
      cholesterol: 0,
      sodium: 5,
      description: "Whole grain rice with a nutty flavor.",
    },
    {
      id: "3",
      name: "Olive Oil",
      calories: 119,
      carbs: 0,
      fat: 14,
      image: "/placeholder.svg?height=100&width=100",
      sugar: 0,
      cholesterol: 0,
      sodium: 0,
      description: "Heart-healthy cooking oil.",
    },
  ]);

  const [newIngredient, setNewIngredient] = useState<
    DishIngredientType & { name: string }
  >({
    dishId: "",
    ingredientId: "",
    quantity: 0,
    unit: "",
    name: "",
  });

  const handleIngredientSelect = (ingredientId: string) => {
    const selected = availableIngredients.find(
      (ing) => ing.id === ingredientId
    );
    if (selected) {
      setNewIngredient((prev) => ({
        ...prev,
        ingredientId,
        name: selected.name,
      }));
    }
  };

  const handleAddIngredient = () => {
    if (
      !newIngredient.ingredientId ||
      !newIngredient.quantity ||
      !newIngredient.unit
    ) {
      alert("Please fill in all ingredient fields");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      { ...newIngredient, dishId: "temp-id" },
    ]);
    setNewIngredient({
      dishId: "",
      ingredientId: "",
      quantity: 0,
      unit: "",
      name: "",
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  async function submitForm(data: DishType) {
    if (ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    console.log("Saving dish:", { ...data, ingredients });

    setFormSubmitted(true);
  }

  const nextStep = () => {
    const fieldsToValidate: (keyof DishType)[] = [];

    if (currentStep === 1) {
      fieldsToValidate.push("name", "description", "calories", "prepTime");
    } else if (currentStep === 2) {
      fieldsToValidate.push("instructions");
    }

    const isValid = fieldsToValidate.every((field) => {
      const valid = form.trigger(field);
      return valid;
    });

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    if (formSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Dish Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new dish has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>{ingredients.length} ingredients</span>
              <span>{form.getValues().calories} calories</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
              form.reset(defaultValues);
              setIngredients([]);
            }}
            className="bg-primary hover:opacity-80"
          >
            Create Another Dish
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 1: Basic Information
              </h2>
              <p className="text-sm text-primary">
                Enter the details about your dish.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<DishType>
                  fieldTitle="Dish Name"
                  nameInSchema="name"
                  placeholder="E.g., Grilled Chicken Salad"
                  className="w-full"
                  required
                />

                <InputWithLabel<DishType>
                  fieldTitle="Preparation Time (minutes)"
                  nameInSchema="prepTime"
                  placeholder="E.g., 30"
                  className="w-full"
                  type="number"
                  required
                />
              </div>

              <TextAreaWithLabel<DishType>
                fieldTitle="Description"
                nameInSchema="description"
                placeholder="A brief description of the dish..."
                className="w-full h-24"
                required
              />

              <InputWithLabel<DishType>
                fieldTitle="Calories"
                nameInSchema="calories"
                placeholder="E.g., 350"
                className="w-full"
                type="number"
                required
              />

              <div className="space-y-2">
                <Label>Image</Label>
                <ImageDropzone
                  maxImages={1}
                  maxSizeInMB={20}
                  onImagesChange={(value) => {
                    setImageFiles(value);
                    if (value.length > 0) {
                      form.setValue("image", "https://example.com/image-url");
                    } else {
                      form.setValue("image", "");
                    }
                  }}
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 2: Cooking Instructions
              </h2>
              <p className="text-sm text-primary">
                Provide step-by-step instructions for preparing this dish.
              </p>
            </div>

            <div className="space-y-6">
              <TextAreaWithLabel<DishType>
                fieldTitle="Instructions"
                nameInSchema="instructions"
                placeholder="1. Preheat oven to 350°F.
2. Season chicken with salt and pepper.
3. Heat oil in a pan over medium heat.
..."
                className="w-full min-h-[300px]"
                required
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 3: Ingredients
              </h2>
              <p className="text-sm text-primary">
                Add ingredients required for this dish.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-green-200 p-4">
                <h3 className="font-medium text-lg mb-4">Add Ingredient</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ingredientId">Ingredient</Label>
                    <Select
                      onValueChange={(value) => handleIngredientSelect(value)}
                      value={newIngredient.ingredientId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a set" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIngredients.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="E.g., 2"
                      value={newIngredient.quantity || ""}
                      onChange={(e) =>
                        setNewIngredient((prev) => ({
                          ...prev,
                          quantity: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="E.g., cups, tbsp"
                      value={newIngredient.unit}
                      onChange={(e) =>
                        setNewIngredient((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleAddIngredient}
                    className="bg-green-600 hover:bg-green-700"
                    type="button"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>
              </Card>

              {ingredients.length > 0 ? (
                <div className="max-h-96 overflow-y-auto border rounded-lg mb-6 shadow-sm">
                  <div className="p-2 space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <Card key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium">{ingredient.name}</div>
                            <div className="text-sm text-gray-600">
                              {ingredient.quantity} {ingredient.unit}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg mb-6 bg-gray-50">
                  <p className="text-gray-500">No ingredients added yet</p>
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Dish</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <Card className="p-6">
            {!formSubmitted && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 1
                          ? "bg-primary text-white"
                          : "bg-gray-200"
                      } mr-2`}
                    >
                      1
                    </div>
                    <span
                      className={
                        currentStep >= 1
                          ? "text-primary font-medium"
                          : "text-gray-400"
                      }
                    >
                      Basic Info
                    </span>
                  </div>
                  <div className="flex-1 mx-4 h-1 bg-gray-200">
                    <div
                      className={`h-1 bg-primary transition-all ${
                        currentStep >= 2 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 2
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      } mr-2`}
                    >
                      2
                    </div>
                    <span
                      className={
                        currentStep >= 2
                          ? "text-primary font-medium"
                          : "text-gray-400"
                      }
                    >
                      Instructions
                    </span>
                  </div>
                  <div className="flex-1 mx-4 h-1 bg-gray-200">
                    <div
                      className={`h-1 bg-primary transition-all ${
                        currentStep >= 3 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 3
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      } mr-2`}
                    >
                      3
                    </div>
                    <span
                      className={
                        currentStep >= 3
                          ? "text-primary font-medium"
                          : "text-gray-400"
                      }
                    >
                      Ingredients
                    </span>
                  </div>
                </div>
              </div>
            )}

            {renderStepContent()}

            {!formSubmitted && (
              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary hover:opacity-80"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-primary hover:opacity-80">
                    Save Dish
                  </Button>
                )}
              </div>
            )}
          </Card>
        </form>
      </Form>
    </div>
  );
}
