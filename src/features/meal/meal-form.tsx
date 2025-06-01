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
import mediaService from "@/services/media.service";
import mealService from "@/services/meal.service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MealForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [availableDishes] = useState<DishType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [selectedDishes, setSelectedDishes] = useState<
    (DishType & { quantity?: number })[]
  >([]);

  const defaultValues: Partial<MealType> = {
    name: "",
    description: "",
    image: "",
    calories: 0,
    pre_time: 0,
    mealType: "Breakfast",
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

    const totalPrepTime =
      selectedDishes.reduce((sum, d) => sum + d.prep_time, 0) + dish.prep_time;
    form.setValue("pre_time", totalPrepTime / 60);
  };

  const handleRemoveDish = (dishId: string) => {
    const dishToRemove = selectedDishes.find((d) => d._id === dishId);
    if (!dishToRemove) return;

    setSelectedDishes((prev) => prev.filter((d) => d._id !== dishId));

    const totalCalories = selectedDishes
      .filter((d) => d._id !== dishId)
      .reduce((sum, d) => sum + d.calories * (d.quantity || 1), 0);
    form.setValue("calories", totalCalories > 0 ? totalCalories : 0);

    if (selectedDishes.length > 1) {
      const totalPrepTime = selectedDishes
        .filter((d) => d._id !== dishId)
        .reduce((sum, d) => sum + d.prep_time, 0);
      form.setValue("pre_time", totalPrepTime / 60);
    } else {
      form.setValue("pre_time", 0);
    }
  };

  async function submitForm(data: MealType) {
    try {
      setIsLoading(true);
      if (selectedDishes.length === 0) {
        toast.error("Please add at least one dish to the meal");
        return;
      }
      let imageRes;
      if (imageFiles[0]?.file) {
        imageRes = await mediaService.uploadImage(imageFiles[0].file);
      }

      if (date) {
        form.setValue("date", date);
      }
      const finalData = {
        ...data,
        pre_time: data.pre_time * 60,
        dishes: selectedDishes.map((dish) => dish._id),
        image: imageRes?.result?.url || "",
        date: data.date ? new Date(data.date) : new Date(),
        meal_type: data.mealType || "Breakfast",
      };
      const response = await mealService.addNewMealPlan(finalData);
      if (response) {
        setFormSubmitted(true);
        setImageFiles([]);
        setSelectedDishes([]);
        toast.success("Meal created successfully!");
        form.reset(defaultValues);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting meal form:", error);
      toast.error("Failed to create meal. Please try again.");
    } finally {
      setIsLoading(false);
      setFormSubmitted(true);
    }
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
                  defaultValue="Breakfast"
                  onValueChange={(value) =>
                    form.setValue(
                      "mealType",
                      value as "Breakfast" | "Lunch" | "Dinner"
                    )
                  }
                  className="flex flex-row space-x-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Breakfast" id="Breakfast" />
                    <Label htmlFor="Breakfast">Breakfast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Lunch" id="Lunch" />
                    <Label htmlFor="Lunch">Lunch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Dinner" id="Dinner" />
                    <Label htmlFor="Dinner">Dinner</Label>
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
                    value={form.getValues().pre_time}
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

                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary hover:opacity-80"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="submit"
                    className="bg-primary hover:opacity-80"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Meal"}
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
