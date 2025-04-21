import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import VideoDropzone, { VideoFile } from "@/components/ui/video-dropzone";
import { ExerciseType } from "@/constants/types";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function ExerciseForm() {
  const [activeTab, setActiveTab] = React.useState("details");
  const [, setImageFiles] = React.useState<ImageFile[]>([]);
  const [, setVideoFile] = React.useState<VideoFile | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: ExerciseType = {
    name: "",
    description: "",
    category: "cardio",
    calories_burned_per_minute: 0,
    image: "",
    video: "",
  };

  const formSchema = z.object({
    name: z.string().nonempty("Exercise name is required"),
    description: z.string().nonempty("Description is required"),
    category: z.enum(["cardio", "strength"], {
      errorMap: () => ({ message: "Please select a category" }),
    }),
    calories_burned_per_minute: z.coerce
      .number()
      .int("Must be a whole number")
      .positive("Must be greater than 0"),
    image: z.string().url("Please upload an image"),
    video: z.string().url("Please upload a video"),
  });

  const form = useForm<ExerciseType>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const { formState } = form;
  const { errors, isValid } = formState;

  const hasDetailsErrors = !!(
    errors.name ||
    errors.description ||
    errors.category ||
    errors.calories_burned_per_minute
  );

  const hasMediaErrors = !!(errors.image || errors.video);

  async function submitForm(data: ExerciseType) {
    setIsSubmitting(true);
    try {
      console.log(data);
      alert("Exercise created successfully!");
      form.reset(defaultValues);
      setImageFiles([]);
      setVideoFile(null);
    } catch (error) {
      console.error(error);
      // Error feedback
      alert("Failed to create exercise. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      form.reset(defaultValues);
      setImageFiles([]);
      setVideoFile(null);
      setActiveTab("details");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto  mt-8">
      <div className="mb-6 px-6">
        <h1 className="text-2xl font-semibold">Add New Exercise</h1>

        <p>Fill out the details to add a new exercise to your library</p>
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
                  Step 1: Exercise Details
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
                  {hasMediaErrors && (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel<ExerciseType>
                    fieldTitle="Exercise Name"
                    nameInSchema="name"
                    placeholder="E.g., Push-ups"
                    className="w-full"
                    required
                  />
                  <SelectWithLabel<ExerciseType>
                    fieldTitle="Category"
                    nameInSchema="category"
                    className="w-full"
                    data={[
                      { description: "Cardio", id: "cardio" },
                      { description: "Strength", id: "strength" },
                    ]}
                  />
                </div>

                <InputWithLabel<ExerciseType>
                  fieldTitle="Calories Burned Per Minute"
                  nameInSchema="calories_burned_per_minute"
                  placeholder="E.g., 10"
                  className="w-full"
                  type="number"
                  required
                />

                <TextAreaWithLabel<ExerciseType>
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="E.g., Helps to build chest muscles and improve upper body strength"
                  className="w-full min-h-32"
                  required
                />

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-base font-semibold">Exercise Image</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a clear image showing the exercise position (max
                      20MB)
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

                  <div className="space-y-2">
                    <p className="text-base font-semibold">Exercise Video</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a demonstration video showing proper form (max
                      50MB)
                    </p>
                    <VideoDropzone
                      onVideoChange={(video) => {
                        setVideoFile(video);
                        if (video) {
                          form.setValue(
                            "video",
                            "https://example.com/video-url"
                          );
                        } else {
                          form.setValue("video", "");
                        }
                      }}
                      maxSizeInMB={50}
                      allowedTypes={["video/mp4", "video/webm"]}
                    />
                    {errors.video && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.video.message}
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
                {isSubmitting ? "Saving..." : "Save Exercise"}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default ExerciseForm;
