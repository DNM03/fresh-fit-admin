import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputWithLabel from "@/components/inputs/input-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import mediaService from "@/services/media.service";
import dishService from "@/services/dish.service";
import { toast } from "sonner";

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
}

interface UpdateDishFormProps {
  dish: DishType;
  onSuccess: () => void;
}

function UpdateDishForm({ dish, onSuccess }: UpdateDishFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    name: dish.name || "",
    description: dish.description || "",
    calories: dish.calories || 0,
    prep_time: dish.prep_time || 0,
    instruction: dish.instruction || "",
    image: dish.image || "",
    fat: dish.fat || 0,
    saturatedFat: dish.saturatedFat || 0,
    cholesterol: dish.cholesterol || 0,
    sodium: dish.sodium || 0,
    carbohydrate: dish.carbohydrate || 0,
    fiber: dish.fiber || 0,
    sugar: dish.sugar || 0,
    protein: dish.protein || 0,
  };

  const formSchema = z.object({
    name: z.string().nonempty("Dish name is required"),
    description: z.string().optional(),
    calories: z.coerce.number().nonnegative("Must be a non-negative number"),
    prep_time: z.coerce.number().nonnegative("Must be a non-negative number"),
    instruction: z.string().optional(),
    image: z.string().optional(),
    fat: z.coerce.number().nonnegative("Must be a non-negative number"),
    saturatedFat: z.coerce
      .number()
      .nonnegative("Must be a non-negative number"),
    cholesterol: z.coerce.number().nonnegative("Must be a non-negative number"),
    sodium: z.coerce.number().nonnegative("Must be a non-negative number"),
    carbohydrate: z.coerce
      .number()
      .nonnegative("Must be a non-negative number"),
    fiber: z.coerce.number().nonnegative("Must be a non-negative number"),
    sugar: z.coerce.number().nonnegative("Must be a non-negative number"),
    protein: z.coerce.number().nonnegative("Must be a non-negative number"),
  });

  const form = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors, isValid } = formState;

  const hasBasicErrors = !!(
    errors.name ||
    errors.description ||
    errors.calories ||
    errors.prep_time
  );

  const hasInstructionErrors = !!errors.instruction;

  const hasNutritionErrors = !!(
    errors.fat ||
    errors.saturatedFat ||
    errors.cholesterol ||
    errors.sodium ||
    errors.carbohydrate ||
    errors.fiber ||
    errors.sugar ||
    errors.protein
  );

  async function submitForm(data: any) {
    if (!dish._id) return;

    setIsSubmitting(true);
    try {
      let imageRes;

      if (imageFiles[0]?.file) {
        imageRes = await mediaService.backupUploadImage(imageFiles[0].file);
      }

      const response = await dishService.updateDishInfo(dish._id, {
        name: data.name,
        description: data.description,
        calories: data.calories,
        prep_time: data.prep_time,
        instruction: data.instruction,
        image: imageRes?.result?.url || data.image,
        fat: data.fat,
        saturatedFat: data.saturatedFat,
        cholesterol: data.cholesterol,
        sodium: data.sodium,
        carbohydrate: data.carbohydrate,
        fiber: data.fiber,
        sugar: data.sugar,
        protein: data.protein,
      });

      console.log("Dish updated successfully:", response);
      toast.success("Dish updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update dish. Please try again.", {
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
              <TabsList className="grid grid-cols-3 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
                <TabsTrigger
                  value="basic"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Basic Info
                  {hasBasicErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="instructions"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Instructions
                  {hasInstructionErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="nutrition"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Nutrition
                  {hasNutritionErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <motion.div
                  className="absolute bottom-0 h-1 bg-primary rounded-full"
                  layout
                  initial={false}
                  animate={{
                    left:
                      activeTab === "basic"
                        ? "0%"
                        : activeTab === "instructions"
                        ? "33.33%"
                        : "66.66%",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: "33.33%" }}
                />
              </TabsList>
            </div>

            <CardContent className="pb-4">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <InputWithLabel
                    fieldTitle="Dish Name"
                    nameInSchema="name"
                    placeholder="E.g., Canh Chua"
                    className="w-full"
                    required
                  />
                  <InputWithLabel
                    fieldTitle="Preparation Time (minutes)"
                    nameInSchema="prep_time"
                    placeholder="E.g., 30"
                    className="w-full"
                    type="number"
                    required
                  />
                </div>

                <TextAreaWithLabel
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="A brief description of the dish..."
                  className="w-full h-24"
                />

                <InputWithLabel
                  fieldTitle="Calories"
                  nameInSchema="calories"
                  placeholder="E.g., 350"
                  className="w-full"
                  type="number"
                />

                <div className="space-y-2">
                  <p className="text-base font-semibold">Dish Image</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload an image of the prepared dish (max 20MB)
                  </p>
                  {dish.image && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Current image:</p>
                      <img
                        src={dish.image}
                        alt="Current dish"
                        className="w-48 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => setImageFiles(value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("instructions")}
                    disabled={hasBasicErrors}
                  >
                    Continue to Instructions
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="mt-0 space-y-4">
                <TextAreaWithLabel
                  fieldTitle="Cooking Instructions"
                  nameInSchema="instruction"
                  placeholder="Enter step-by-step instructions, using '|' to separate steps. For example:
1. Prepare all ingredients.|2. Heat oil in a pan.|3. Add vegetables and stir-fry for 2 minutes."
                  className="w-full min-h-[300px]"
                />

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back to Basic Info
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("nutrition")}
                    disabled={hasInstructionErrors}
                  >
                    Continue to Nutrition
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                  <InputWithLabel
                    fieldTitle="Fat (g)"
                    nameInSchema="fat"
                    placeholder="E.g., 10"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Saturated Fat (g)"
                    nameInSchema="saturatedFat"
                    placeholder="E.g., 2"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Cholesterol (mg)"
                    nameInSchema="cholesterol"
                    placeholder="E.g., 50"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Sodium (mg)"
                    nameInSchema="sodium"
                    placeholder="E.g., 200"
                    className="w-full"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                  <InputWithLabel
                    fieldTitle="Carbohydrates (g)"
                    nameInSchema="carbohydrate"
                    placeholder="E.g., 30"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Fiber (g)"
                    nameInSchema="fiber"
                    placeholder="E.g., 5"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Sugar (g)"
                    nameInSchema="sugar"
                    placeholder="E.g., 5"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel
                    fieldTitle="Protein (g)"
                    nameInSchema="protein"
                    placeholder="E.g., 25"
                    className="w-full"
                    type="number"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("instructions")}
                  >
                    Back to Instructions
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
                disabled={!isValid || isSubmitting}
                className="px-6"
              >
                {isSubmitting ? "Updating..." : "Update Dish"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default UpdateDishForm;
