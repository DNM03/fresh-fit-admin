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
import mediaService from "@/services/media.service";
import exerciseService from "@/services/exercise.service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function ExerciseForm() {
  const [activeTab, setActiveTab] = React.useState("details");
  const [imageFiles, setImageFiles] = React.useState<ImageFile[]>([]);
  const [videoFile, setVideoFile] = React.useState<VideoFile | null>(null);
  const [targetMuscleImage, setTargetMuscleImage] = React.useState<ImageFile[]>(
    []
  );
  const [secondaryMuscleImage, setSecondaryMuscleImage] = React.useState<
    ImageFile[]
  >([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  const defaultValues: ExerciseType = {
    name: "",
    description: "",
    category: "Cardio",
    calories_burn_per_minutes: 0,
    type: "Activation",
    equipment: "",
    mechanics: "Compound",
    forceType: "Compression",
    experience_level: "Beginner",
    target_muscle: {
      name: "",
      image: "",
    },
    secondary_muscle: {
      name: "",
      image: "",
    },
    // image: "",
    // video: "",
  };

  const formSchema = z.object({
    name: z.string().nonempty("Exercise name is required"),
    description: z.string().nonempty("Description is required"),
    category: z.enum(["Cardio", "Strength"], {
      errorMap: () => ({ message: "Please select a category" }),
    }),
    calories_burn_per_minutes: z.coerce
      .number()
      .int("Must be a whole number")
      .positive("Must be greater than 0"),
    type: z.enum(
      [
        "Activation",
        "Conditioning",
        "Olympic_Lifting",
        "Plyometrics",
        "Powerlifting",
        "SMR",
        "Strength",
        "Stretching",
        "Strongman",
        "Warmup",
      ],
      {
        errorMap: () => ({ message: "Please select a type" }),
      }
    ),
    equipment: z.string().optional(),
    mechanics: z.enum(["Compound", "Isolation"], {
      errorMap: () => ({ message: "Please select a mechanics type" }),
    }),
    forceType: z.enum(
      [
        "Compression",
        "Dynamic_Stretching",
        "Hinge_Bilateral",
        "Hinge_Unilateral",
        "Isometric",
        "Press_Bilateral",
        "Pull",
        "Pull_Bilateral",
        "Pull_Unilateral",
        "Push",
        "Push_Bilateral",
        "Push_Unilateral",
        "Static",
        "Static_Stretching",
      ],
      {
        errorMap: () => ({ message: "Please select a force type" }),
      }
    ),
    experience_level: z.enum(["Beginner", "Intermediate", "Advanced"], {
      errorMap: () => ({ message: "Please select an experience level" }),
    }),
    // image: z.string().url("Please upload an image"),
    // video: z.string().url("Please upload a video"),
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
    errors.calories_burn_per_minutes
  );

  const hasMediaErrors = !!(errors.image || errors.video);

  async function submitForm(data: ExerciseType) {
    setIsSubmitting(true);
    try {
      let imageRes;
      let videoRes;
      let targetMuscleImageRes;
      let secondaryMuscleImageRes;
      if (imageFiles[0]?.file) {
        imageRes = await mediaService.backupUploadImage(imageFiles[0].file);
      }
      if (videoFile) {
        videoRes = await mediaService.backupUploadVideo(videoFile.file);
      }
      if (targetMuscleImage[0]?.file) {
        targetMuscleImageRes = await mediaService.backupUploadImage(
          targetMuscleImage[0].file
        );
      }
      if (secondaryMuscleImage[0]?.file) {
        secondaryMuscleImageRes = await mediaService.backupUploadImage(
          secondaryMuscleImage[0].file
        );
      }
      const response = await exerciseService.addExercise({
        name: data.name,
        description: data.description,
        category: data.category,
        calories_burn_per_minutes: data.calories_burn_per_minutes,
        image: imageRes?.result?.url || "",
        video: videoRes?.result.url || "",
        target_muscle: {
          name: data.target_muscle?.name || "",
          image: targetMuscleImageRes?.result?.url || "",
        },
        type: data.type,
        equipment: data.equipment,
        mechanics: data.mechanics,
        forceType: data.forceType,
        experience_level: data.experience_level,
        secondary_muscle: {
          name: data.secondary_muscle?.name || "",
          image: secondaryMuscleImageRes?.result?.url || "",
        },
        instructions: data.instructions,
        tips: data.tips,
      });

      console.log("Exercise created successfully:", response);
      // console.log(data);
      toast.success("Exercise created successfully!");
      form.reset(defaultValues);
      setImageFiles([]);
      setVideoFile(null);
      navigate(-1);
    } catch (error) {
      console.error(error);
      // Error feedback
      toast.error("Failed to create exercise. Please try again.");
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
                    required
                    data={[
                      { description: "Cardio", id: "Cardio" },
                      { description: "Strength", id: "Strength" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel<ExerciseType>
                    fieldTitle="Calories Burned Per Minute"
                    nameInSchema="calories_burn_per_minutes"
                    placeholder="E.g., 10"
                    className="w-full"
                    type="number"
                    required
                  />
                  <SelectWithLabel<ExerciseType>
                    fieldTitle="Type"
                    nameInSchema="type"
                    className="w-full"
                    required
                    data={[
                      { description: "Activation", id: "Activation" },
                      { description: "Conditioning", id: "Conditioning" },
                      { description: "Olympic_Lifting", id: "Olympic_Lifting" },
                      { description: "Plyometrics", id: "Plyometrics" },
                      { description: "Powerlifting", id: "Powerlifting" },
                      { description: "SMR", id: "SMR" },
                      { description: "Strength", id: "Strength" },
                      { description: "Stretching", id: "Stretching" },
                      { description: "Strongman", id: "Strongman" },
                      { description: "Warmup", id: "Warmup" },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectWithLabel<ExerciseType>
                    fieldTitle="Force Type"
                    nameInSchema="forceType"
                    className="w-full"
                    required
                    data={[
                      { description: "Compression", id: "Compression" },
                      {
                        description: "Dynamic Stretching",
                        id: "Dynamic_Stretching",
                      },
                      { description: "Hinge Bilateral", id: "Hinge_Bilateral" },
                      {
                        description: "Hinge Unilateral",
                        id: "Hinge_Unilateral",
                      },
                      { description: "Isometric", id: "Isometric" },
                      { description: "Press Bilateral", id: "Press_Bilateral" },
                      { description: "Pull", id: "Pull" },
                      { description: "Pull Bilateral", id: "Pull_Bilateral" },
                      { description: "Pull Unilateral", id: "Pull_Unilateral" },
                      { description: "Push", id: "Push" },
                      { description: "Push Bilateral", id: "Push_Bilateral" },
                      { description: "Push Unilateral", id: "Push_Unilateral" },
                      { description: "Static", id: "Static" },
                      {
                        description: "Static Stretching",
                        id: "Static_Stretching",
                      },
                    ]}
                  />
                  <SelectWithLabel<ExerciseType>
                    fieldTitle="Experience Level"
                    nameInSchema="experience_level"
                    className="w-full"
                    required
                    data={[
                      { description: "Beginner", id: "Beginner" },
                      { description: "Intermediate", id: "Intermediate" },
                      { description: "Advanced", id: "Advanced" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel<ExerciseType>
                    fieldTitle="Equipment"
                    nameInSchema="equipment"
                    placeholder="E.g., Dumbbells, Barbell, Resistance Bands"
                    className="w-full"
                  />
                  <SelectWithLabel<ExerciseType>
                    fieldTitle="Mechanics"
                    nameInSchema="mechanics"
                    className="w-full"
                    required
                    data={[
                      { description: "Compound", id: "Compound" },
                      { description: "Isolation", id: "Isolation" },
                    ]}
                  />
                </div>

                <TextAreaWithLabel<ExerciseType>
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="E.g., Helps to build chest muscles and improve upper body strength"
                  className="w-full min-h-32"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextAreaWithLabel<ExerciseType>
                    fieldTitle="Instructions"
                    nameInSchema="instructions"
                    placeholder="E.g., Keep your back straight and core engaged"
                    className="w-full min-h-32"
                  />
                  <TextAreaWithLabel<ExerciseType>
                    fieldTitle="Tips"
                    nameInSchema="tips"
                    placeholder="E.g., Avoid locking your elbows at the top of the movement"
                    className="w-full min-h-32"
                  />
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
                <div className="space-y-2 grid grid-cols-2 gap-4">
                  <div>
                    <InputWithLabel<ExerciseType>
                      fieldTitle="Target Muscle Name"
                      nameInSchema="target_muscle.name"
                      placeholder="E.g., Pectoralis Major (Chest)"
                      className="w-full"
                    />
                    <div className="mt-2">
                      <p className="text-base font-semibold">
                        Target Muscle Image
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Upload a clear image showing the muscle (max 20MB)
                      </p>
                      <ImageDropzone
                        maxImages={1}
                        maxSizeInMB={20}
                        onImagesChange={(value) => {
                          setTargetMuscleImage(value);
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
                  <div>
                    <InputWithLabel<ExerciseType>
                      fieldTitle="Secondary Muscle Name"
                      nameInSchema="secondary_muscle.name"
                      placeholder="E.g., Triceps Brachii"
                      className="w-full"
                    />
                    <div className="mt-2">
                      <p className="text-base font-semibold">
                        Secondary Muscle Image
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Upload a clear image showing the muscle (max 20MB)
                      </p>
                      <ImageDropzone
                        maxImages={1}
                        maxSizeInMB={20}
                        onImagesChange={(value) => {
                          setSecondaryMuscleImage(value);
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
                </div>
                <hr />
                <div className="space-y-2 grid grid-cols-2 gap-4">
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
