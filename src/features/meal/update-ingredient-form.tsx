import React from "react";
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
import ingredientService from "@/services/ingredient.service";

interface IngredientType {
  _id?: string;
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

interface UpdateIngredientFormProps {
  ingredient: IngredientType;
  onSuccess: () => void;
}

function UpdateIngredientForm({
  ingredient,
  onSuccess,
}: UpdateIngredientFormProps) {
  const [activeTab, setActiveTab] = React.useState("basic");
  const [imageFiles, setImageFiles] = React.useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: IngredientType = {
    name: ingredient.name || "",
    description: ingredient.description || "",
    calories: ingredient.calories || 0,
    image: ingredient.image || "",
    cab: ingredient.cab || 0,
    sodium: ingredient.sodium || 0,
    sugar: ingredient.sugar || 0,
    cholesterol: ingredient.cholesterol || 0,
    fat: ingredient.fat || 0,
    protein: ingredient.protein || 0,
  };

  const formSchema = z.object({
    name: z.string().nonempty("Ingredient name is required"),
    description: z.string().optional(),
    calories: z.coerce.number().nonnegative("Must be a non-negative number"),
    image: z.string().optional(),
    cab: z.coerce.number().nonnegative("Must be a non-negative number"),
    sodium: z.coerce.number().nonnegative("Must be a non-negative number"),
    sugar: z.coerce.number().nonnegative("Must be a non-negative number"),
    cholesterol: z.coerce.number().nonnegative("Must be a non-negative number"),
    fat: z.coerce.number().nonnegative("Must be a non-negative number"),
    protein: z.coerce.number().nonnegative("Must be a non-negative number"),
  });

  const form = useForm<any>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors, isValid } = formState;

  const hasBasicErrors = !!(
    errors.name ||
    errors.description ||
    errors.calories
  );

  const hasNutritionErrors = !!(
    errors.cab ||
    errors.sodium ||
    errors.sugar ||
    errors.cholesterol ||
    errors.fat ||
    errors.protein
  );

  async function submitForm(data: IngredientType) {
    if (!ingredient._id) return;

    setIsSubmitting(true);
    try {
      let imageRes;

      // Only upload new media if files are selected
      if (imageFiles[0]?.file) {
        imageRes = await mediaService.backupUploadImage(imageFiles[0].file);
      }

      const response = await ingredientService.updateIngredient(
        ingredient._id,
        {
          name: data.name,
          description: data.description,
          calories: data.calories,
          image: imageRes?.result?.url || data.image,
          cab: data.cab,
          sodium: data.sodium,
          sugar: data.sugar,
          cholesterol: data.cholesterol,
          fat: data.fat,
          protein: data.protein,
        }
      );

      console.log("Ingredient updated successfully:", response);
      alert("Ingredient updated successfully!");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to update ingredient. Please try again.");
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
                  Basic Details
                  {hasBasicErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="nutrition"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Nutrition Facts
                  {hasNutritionErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="media"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Image
                </TabsTrigger>

                <motion.div
                  className="absolute bottom-0 h-1 bg-primary rounded-full"
                  layout
                  initial={false}
                  animate={{
                    left:
                      activeTab === "basic"
                        ? "0%"
                        : activeTab === "nutrition"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel<IngredientType>
                    fieldTitle="Ingredient Name"
                    nameInSchema="name"
                    placeholder="E.g., Tuna"
                    className="w-full"
                    required
                  />
                  <InputWithLabel<IngredientType>
                    fieldTitle="Calories"
                    nameInSchema="calories"
                    placeholder="E.g., 154"
                    className="w-full"
                    type="number"
                    required
                  />
                </div>

                <TextAreaWithLabel<IngredientType>
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="E.g., High-quality tuna rich in protein and omega-3 fatty acids"
                  className="w-full min-h-32"
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("nutrition")}
                    disabled={hasBasicErrors}
                  >
                    Continue to Nutrition Facts
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputWithLabel<IngredientType>
                    fieldTitle="Carbohydrates (g)"
                    nameInSchema="cab"
                    placeholder="E.g., 0"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel<IngredientType>
                    fieldTitle="Protein (g)"
                    nameInSchema="protein"
                    placeholder="E.g., 25"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel<IngredientType>
                    fieldTitle="Fat (g)"
                    nameInSchema="fat"
                    placeholder="E.g., 5"
                    className="w-full"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputWithLabel<IngredientType>
                    fieldTitle="Sugar (g)"
                    nameInSchema="sugar"
                    placeholder="E.g., 0"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel<IngredientType>
                    fieldTitle="Sodium (mg)"
                    nameInSchema="sodium"
                    placeholder="E.g., 300"
                    className="w-full"
                    type="number"
                  />
                  <InputWithLabel<IngredientType>
                    fieldTitle="Cholesterol (mg)"
                    nameInSchema="cholesterol"
                    placeholder="E.g., 50"
                    className="w-full"
                    type="number"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back to Basic Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    disabled={hasNutritionErrors}
                  >
                    Continue to Image
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <p className="text-base font-semibold">Ingredient Image</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload a clear image of the ingredient (max 20MB)
                  </p>
                  {ingredient.image && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Current image:</p>
                      <img
                        src={ingredient.image}
                        alt="Current ingredient"
                        className="w-48 h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setImageFiles(value);
                    }}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("nutrition")}
                  >
                    Back to Nutrition Facts
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
                {isSubmitting ? "Updating..." : "Update Ingredient"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default UpdateIngredientForm;
