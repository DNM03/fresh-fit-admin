import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, ArrowRight } from "lucide-react";
import type { MealType, DishType } from "@/constants/types";
import InputWithLabel from "@/components/inputs/input-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import { Form } from "@/components/ui/form";
import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
import DishSelector from "./dish-selector";

export default function MealForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [, setImageFiles] = useState<ImageFile[]>([]);
  const [availableDishes] = useState<DishType[]>([
    {
      id: "dish-1",
      name: "Grilled Chicken Salad",
      description:
        "Fresh greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette.",
      image: "/placeholder.svg?height=100&width=100",
      calories: 350,
      instructions: "Mix all ingredients together.",
      prepTime: 20,
    },
    {
      id: "dish-2",
      name: "Salmon with Roasted Vegetables",
      description:
        "Oven-baked salmon fillet with seasonal roasted vegetables and herbs.",
      image: "/placeholder.svg?height=100&width=100",
      calories: 420,
      instructions: "Bake salmon and roast vegetables.",
      prepTime: 35,
    },
    {
      id: "dish-3",
      name: "Vegetable Stir Fry",
      description: "Mixed vegetables stir-fried with tofu in a savory sauce.",
      image: "/placeholder.svg?height=100&width=100",
      calories: 280,
      instructions: "Stir fry all ingredients.",
      prepTime: 25,
    },
    {
      id: "dish-4",
      name: "Quinoa Bowl",
      description:
        "Protein-rich quinoa with roasted vegetables and tahini dressing.",
      image: "/placeholder.svg?height=100&width=100",
      calories: 310,
      instructions: "Cook quinoa and mix with vegetables.",
      prepTime: 30,
    },
  ]);

  const [selectedDishes, setSelectedDishes] = useState<
    (DishType & { quantity?: number })[]
  >([]);

  const defaultValues: Partial<MealType> = {
    name: "",
    description: "",
    image: "",
    calories: 0,
    prepTime: 0,
    mealType: "breakfast",
    date: new Date(),
  };

  const form = useForm<MealType>({
    defaultValues: defaultValues as MealType,
  });

  const handleAddDish = (dish: DishType & { quantity?: number }) => {
    setSelectedDishes((prev) => [...prev, dish]);

    const totalCalories =
      selectedDishes.reduce(
        (sum, d) => sum + d.calories * (d.quantity || 1),
        0
      ) +
      dish.calories * (dish.quantity || 1);
    form.setValue("calories", totalCalories);

    const maxPrepTime = Math.max(
      ...selectedDishes.map((d) => d.prepTime),
      dish.prepTime
    );
    form.setValue("prepTime", maxPrepTime);
  };

  const handleRemoveDish = (dishId: string) => {
    const dishToRemove = selectedDishes.find((d) => d.id === dishId);
    if (!dishToRemove) return;

    setSelectedDishes((prev) => prev.filter((d) => d.id !== dishId));

    const totalCalories = selectedDishes
      .filter((d) => d.id !== dishId)
      .reduce((sum, d) => sum + d.calories * (d.quantity || 1), 0);
    form.setValue("calories", totalCalories > 0 ? totalCalories : 0);

    if (selectedDishes.length > 1) {
      const maxPrepTime = Math.max(
        ...selectedDishes.filter((d) => d.id !== dishId).map((d) => d.prepTime)
      );
      form.setValue("prepTime", maxPrepTime);
    } else {
      form.setValue("prepTime", 0);
    }
  };

  const handleUpdateQuantity = (dishId: string, quantity: number) => {
    setSelectedDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, quantity } : d))
    );

    const totalCalories = selectedDishes.reduce((sum, d) => {
      if (d.id === dishId) {
        return sum + d.calories * quantity;
      }
      return sum + d.calories * (d.quantity || 1);
    }, 0);

    form.setValue("calories", totalCalories);
  };

  async function submitForm(data: MealType) {
    if (selectedDishes.length === 0) {
      alert("Please add at least one dish to the meal");
      return;
    }

    if (date) {
      form.setValue("date", date);
    }

    console.log("Saving meal:", { ...data, dishes: selectedDishes });

    setFormSubmitted(true);
  }

  const nextStep = () => {
    const fieldsToValidate: (keyof MealType)[] = [];

    if (currentStep === 1) {
      fieldsToValidate.push("name", "description", "mealType");
    }

    const isValid = fieldsToValidate.every((field) => {
      return form.trigger(field);
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
          <h2 className="text-2xl font-bold mb-2">Meal Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new meal has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>{selectedDishes.length} dishes</span>
              <span>{form.getValues().calories} calories</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
              form.reset(defaultValues);
              setSelectedDishes([]);
              setDate(new Date());
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Another Meal
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-green-600 mb-2">
                Step 1: Basic Information
              </h2>
              <p className="text-sm text-green-600">
                Enter the details about your meal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<MealType>
                  fieldTitle="Meal Name"
                  nameInSchema="name"
                  placeholder="E.g., Monday Breakfast"
                  className="w-full"
                  required
                />

                <div className="space-y-2">
                  <DatePickerWithLabel<MealType>
                    fieldTitle="Date"
                    nameInSchema="date"
                  />
                </div>
              </div>

              <TextAreaWithLabel<MealType>
                fieldTitle="Description"
                nameInSchema="description"
                placeholder="A brief description of the meal..."
                className="w-full h-24"
                required
              />

              <div className="space-y-2">
                <Label className=" text-base">
                  Meal Type<span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  defaultValue="breakfast"
                  onValueChange={(value) =>
                    form.setValue(
                      "mealType",
                      value as "breakfast" | "lunch" | "dinner"
                    )
                  }
                  className="flex flex-row space-x-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breakfast" id="breakfast" />
                    <Label htmlFor="breakfast">Breakfast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lunch" id="lunch" />
                    <Label htmlFor="lunch">Lunch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinner" id="dinner" />
                    <Label htmlFor="dinner">Dinner</Label>
                  </div>
                </RadioGroup>
              </div>

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
              <h2 className="text-lg font-medium text-green-600 mb-2">
                Step 2: Add Dishes
              </h2>
              <p className="text-sm text-green-600">
                Select dishes to include in this meal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calories (auto-calculated)</Label>
                  <Input
                    value={form.getValues().calories}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preparation Time (minutes, auto-calculated)</Label>
                  <Input
                    value={form.getValues().prepTime}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <DishSelector
                availableDishes={availableDishes}
                selectedDishes={selectedDishes}
                onAddDish={handleAddDish}
                onRemoveDish={handleRemoveDish}
                onUpdateQuantity={handleUpdateQuantity}
              />
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
        <h1 className="text-2xl font-bold">Add New Meal</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <Card className="p-6">
            {!formSubmitted && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 1
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
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
                      Add Dishes
                    </span>
                  </div>
                </div>
              </div>
            )}

            {renderStepContent()}

            {!formSubmitted && (
              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="mr-2"
                  >
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary hover:opacity-80"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-primary hover:opacity-80">
                    Save Meal
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
