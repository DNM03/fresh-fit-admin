import { Form } from "@/components/ui/form";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientType } from "@/constants/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { CardContent, CardFooter } from "@/components/ui/card";
import InputWithLabel from "@/components/inputs/input-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import mediaService from "@/services/media.service";
import ingredientService from "@/services/ingredient.service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function IngredientForm() {
  const [activeTab, setActiveTab] = React.useState("details");
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = React.useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: IngredientType = {
    id: "temporary-id",
    name: "",
    calories: 0,
    carbs: 0,
    fat: 0,
    image: "",
    sugar: 0,
    cholesterol: 0,
    sodium: 0,
    description: "",
  };

  const formSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    fat: z.number(),
    image: z.string(),
    sugar: z.number(),
    cholesterol: z.number(),
    sodium: z.number(),
    description: z.string(),
  });

  const form = useForm<IngredientType>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors, isValid } = formState;

  const hasDetailsErrors = !!(
    errors.calories ||
    errors.carbs ||
    errors.fat ||
    errors.sugar ||
    errors.cholesterol ||
    errors.sodium
  );

  const hasImageErrors = !!errors.image;

  async function submitForm(data: IngredientType) {
    setIsSubmitting(true);
    try {
      let imageRes;
      if (imageFiles[0]?.file) {
        imageRes = await mediaService.backupUploadImage(imageFiles[0].file);
      }

      const { id, ...ingredientData } = data;
      const response = await ingredientService.addIngredient({
        ...ingredientData,
        image:
          imageRes?.result?.url ||
          "https://sahabatlautlestari.com/wp-content/uploads/2023/05/Tuna-Species-Overview-2048x1311.png",
      });

      console.log("Ingredient created successfully:", response);
      toast.success("Ingredient created successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      form.reset(defaultValues);
      setImageFiles([]);
      navigate(-1);
    } catch (error) {
      console.error(error);
      // Error feedback
      toast.error("Failed to create ingredient. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      form.reset(defaultValues);
      setImageFiles([]);
      setActiveTab("details");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto  mt-8">
      <div className="mb-6 px-6">
        <h1 className="text-2xl font-semibold">Add New Ingredient</h1>

        <p>Fill out the details to add a new ingredient to your library</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6 relative">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative  !px-0">
                <TabsTrigger
                  value="details"
                  className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Step 1: Ingredient Details
                  {hasDetailsErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="flex items-center justify-center  transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
                >
                  Step 2: Media Upload
                  {hasImageErrors && (
                    <span className="absolute top-1 right-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </TabsTrigger>

                <motion.div
                  className="absolute bottom-0 h-1 bg-primary rounded-full"
                  layout
                  initial={false}
                  animate={{ left: activeTab === "details" ? "0%" : "50%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: "50%" }}
                />
              </TabsList>
            </div>
            <CardContent className="px-6 pb-4">
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="space-y-6">
                  {/* Name and Description - Full width */}
                  <div className="w-full">
                    <InputWithLabel<IngredientType>
                      fieldTitle="Name"
                      nameInSchema="name"
                      placeholder="E.g, Chicken Breast"
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="w-full">
                    <TextAreaWithLabel<IngredientType>
                      fieldTitle="Description"
                      nameInSchema="description"
                      placeholder="E.g., Chicken breast is a lean source of protein..."
                      className="w-full min-h-32"
                      required
                    />
                  </div>

                  {/* Nutritional Information - Grid Layout */}
                  <div>
                    <h3 className="text-md font-medium mb-3">
                      Nutritional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InputWithLabel<IngredientType>
                        fieldTitle="Calories"
                        nameInSchema="calories"
                        placeholder="E.g, 165"
                        className="w-full"
                        type="number"
                        required
                      />
                      <InputWithLabel<IngredientType>
                        fieldTitle="Carbs (g)"
                        nameInSchema="carbs"
                        placeholder="E.g, 0"
                        className="w-full"
                        type="number"
                        required
                      />
                      <InputWithLabel<IngredientType>
                        fieldTitle="Fat (g)"
                        nameInSchema="fat"
                        placeholder="E.g, 3.6"
                        className="w-full"
                        type="number"
                        required
                      />
                      <InputWithLabel<IngredientType>
                        fieldTitle="Sugar (g)"
                        nameInSchema="sugar"
                        placeholder="E.g, 0"
                        className="w-full"
                        type="number"
                        required
                      />
                      <InputWithLabel<IngredientType>
                        fieldTitle="Sodium (mg)"
                        nameInSchema="sodium"
                        placeholder="E.g, 74"
                        className="w-full"
                        type="number"
                        required
                      />
                      <InputWithLabel<IngredientType>
                        fieldTitle="Cholesterol (mg)"
                        nameInSchema="cholesterol"
                        placeholder="E.g, 85"
                        className="w-full"
                        type="number"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    disabled={hasDetailsErrors}
                  >
                    Continue to Media Upload
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="media" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 6">
                  <div className="space-y-2">
                    <p className="text-base font-semibold">Ingredient Image</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a clear image showing the ingredient (max 20MB)
                    </p>
                    <ImageDropzone
                      maxImages={1}
                      maxSizeInMB={20}
                      onImagesChange={(value) => {
                        setImageFiles(value);
                        if (value.length > 0) {
                          form.setValue(
                            "image",
                            "https://example.com/image-url"
                          );
                        } else {
                          form.setValue("image", "");
                        }
                      }}
                    />
                    {errors.image && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.image.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Back to Details
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
            <CardFooter className="px-6 py-4 border-t flex justify-between">
              <Button type="button" onClick={handleReset} variant="outline">
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-6"
              >
                {isSubmitting ? "Saving..." : "Save Ingredient"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default IngredientForm;
