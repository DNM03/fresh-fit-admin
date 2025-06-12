import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputWithLabel from "@/components/inputs/input-with-label";
import { Input } from "@/components/ui/input";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import mealService from "@/services/meal.service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import DishSelector from "@/features/meal/dish-selector";
import { DishType } from "@/constants/types";
import { toast } from "sonner";

interface MealType {
  _id: string;
  name: string;
  description: string;
  calories: number;
  pre_time: number; // in seconds
  meal_type: "Breakfast" | "Lunch" | "Dinner";
  date: string;
  dishes: DishType[];
  created_at?: string;
  updated_at?: string;
}

interface UpdateMealFormProps {
  meal: MealType;
  onSuccess: () => void;
}

function UpdateMealForm({ meal, onSuccess }: UpdateMealFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(meal.date));
  const [selectedDishes, setSelectedDishes] = useState<
    (DishType & { quantity?: number })[]
  >(meal.dishes.map((dish) => ({ ...dish, quantity: 1 })));

  // Convert pre_time from seconds to minutes for the form
  const preTimeInMinutes = Math.floor(meal.pre_time / 60);

  const formSchema = z.object({
    name: z.string().nonempty("Meal name is required"),
    description: z.string().optional(),
    calories: z.coerce.number().nonnegative("Must be a non-negative number"),
    pre_time: z.coerce.number().nonnegative("Must be a non-negative number"),
    meal_type: z.enum(["Breakfast", "Lunch", "Dinner"]),
  });

  const defaultValues = {
    name: meal.name || "",
    description: meal.description || "",
    calories: meal.calories || 0,
    pre_time: preTimeInMinutes || 0,
    meal_type: meal.meal_type || "Breakfast",
  };

  const form = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  // Calculate initial calories and prep time on component mount
  useEffect(() => {
    if (selectedDishes.length > 0) {
      const totalCalories = selectedDishes.reduce(
        (sum, d) => sum + d.calories * (d.quantity || 1),
        0
      );

      const totalPrepTime = selectedDishes.reduce(
        (sum, d) => sum + d.prep_time,
        0
      );

      // Update form values
      form.setValue("calories", totalCalories);
      form.setValue("pre_time", totalPrepTime / 60); // Convert to minutes
    }
  }, []); // Empty dependency array ensures it only runs once on mount

  const { formState, watch, setValue } = form;
  const { errors, isValid } = formState;
  const watchMealType = watch("meal_type");

  const hasBasicErrors = !!(
    errors.name ||
    errors.description ||
    errors.calories ||
    errors.pre_time
  );

  // Updated handleAddDish to calculate totals
  const handleAddDish = (dish: DishType & { quantity?: number }) => {
    setSelectedDishes((prev) => {
      const updatedDishes = [...prev, dish];

      // Calculate new totals
      const totalCalories = updatedDishes.reduce(
        (sum, d) => sum + d.calories * (d.quantity || 1),
        0
      );

      const totalPrepTime = updatedDishes.reduce(
        (sum, d) => sum + d.prep_time,
        0
      );

      // Update form values
      form.setValue("calories", totalCalories);
      form.setValue("pre_time", totalPrepTime / 60);

      return updatedDishes;
    });
  };

  // Updated handleRemoveDish to recalculate totals
  const handleRemoveDish = (dishId: string) => {
    setSelectedDishes((prev) => {
      const filteredDishes = prev.filter((dish) => dish._id !== dishId);

      // Calculate new totals for remaining dishes
      const totalCalories = filteredDishes.reduce(
        (sum, d) => sum + d.calories * (d.quantity || 1),
        0
      );
      form.setValue("calories", totalCalories);

      if (filteredDishes.length > 0) {
        const totalPrepTime = filteredDishes.reduce(
          (sum, d) => sum + d.prep_time,
          0
        );
        form.setValue("pre_time", totalPrepTime / 60);
      } else {
        form.setValue("pre_time", 0);
      }

      return filteredDishes;
    });
  };

  async function submitForm(data: any) {
    if (!meal._id) return;

    setIsSubmitting(true);
    try {
      const preTimeInSeconds = data.pre_time * 60;

      const dishIds = selectedDishes.map((dish) => dish._id);

      const response = await mealService.updateMealPlan(meal._id, {
        name: data.name,
        description: data.description,
        calories: data.calories,
        pre_time: preTimeInSeconds,
        meal_type: data.meal_type,
        date: selectedDate.toISOString(),
        dishes: dishIds,
      });

      console.log("Meal updated successfully:", response);
      toast.success("Meal updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update meal. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="relative">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
                <TabsTrigger
                  value="basic"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Basic Details
                  {hasBasicErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="dishes"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Dishes
                </TabsTrigger>

                <motion.div
                  className="absolute bottom-0 h-1 bg-primary rounded-full"
                  layout
                  initial={false}
                  animate={{
                    left: activeTab === "basic" ? "0%" : "50%",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: "50%" }}
                />
              </TabsList>
            </div>

            <CardContent className="pb-4">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel
                    fieldTitle="Meal Name"
                    nameInSchema="name"
                    placeholder="E.g., Healthy Lunch"
                    className="w-full"
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select
                      value={watchMealType}
                      onValueChange={(
                        value: "Breakfast" | "Lunch" | "Dinner"
                      ) => {
                        setValue("meal_type", value, {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <SelectTrigger id="meal-type">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Breakfast">Breakfast</SelectItem>
                          <SelectItem value="Lunch">Lunch</SelectItem>
                          <SelectItem value="Dinner">Dinner</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories (auto-calculated)</Label>
                    <Input
                      id="calories"
                      readOnly
                      className="bg-gray-50"
                      value={form.watch("calories").toFixed(2)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pre_time">
                      Preparation Time (minutes, auto-calculated)
                    </Label>
                    <Input
                      id="pre_time"
                      readOnly
                      className="bg-gray-50"
                      value={form.watch("pre_time")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <TextAreaWithLabel
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="E.g., A nutritious and balanced meal..."
                  className="w-full"
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("dishes")}
                    disabled={hasBasicErrors}
                  >
                    Continue to Dishes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="dishes" className="mt-0 space-y-6">
                <DishSelector
                  selectedDishes={selectedDishes}
                  onAddDish={handleAddDish}
                  onRemoveDish={handleRemoveDish}
                />

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back to Basic Details
                  </Button>
                </div>
              </TabsContent>
            </CardContent>

            <CardFooter className="py-4 border-t flex justify-between">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !isValid || isSubmitting || selectedDishes.length === 0
                }
                className="px-6"
              >
                {isSubmitting ? "Updating..." : "Update Meal"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default UpdateMealForm;
