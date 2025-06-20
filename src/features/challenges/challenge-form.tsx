import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ArrowRight, Check, Trophy, ImageIcon } from "lucide-react";
import type { PlanType } from "@/constants/types";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import InputWithLabel from "@/components/inputs/input-with-label";
import { Form } from "@/components/ui/form";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
import { AddUpdateChallengeData } from "@/types/challenge.type";
import mediaService from "@/services/media.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import challengeService from "@/services/challenge.service";
import HealthPlanSelector from "./health-plan-selector";
import { toast } from "sonner";
import { addWeeks } from "date-fns";

export default function ChallengeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [, setStartDate] = useState<Date | undefined>(new Date());
  const [weeksDuration, setWeeksDuration] = useState<number>(4); // Default 4 weeks
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [challengeImage, setChallengeImage] = useState<ImageFile[]>([]);
  const [prizeImage, setPrizeImage] = useState<ImageFile[]>([]);
  const [targetImage] = useState<ImageFile[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedHealthPlan, setSelectedHealthPlan] = useState<any | null>(
    null
  );

  const defaultValues: Partial<AddUpdateChallengeData> = {
    name: "",
    description: "",
    type: "Combo",
    prize_title: "",
    target: "WeightLoss",
    fat_percent: 0,
    weight_loss_target: 0,
    status: "Inactive",
    start_date: new Date(new Date().setDate(new Date().getDate() + 1)),
    end_date: addWeeks(
      new Date(new Date().setDate(new Date().getDate() + 1)),
      4
    ),
    weeks_duration: 4,
    health_plan_id: null,
  };

  const form = useForm<AddUpdateChallengeData>({
    defaultValues: defaultValues as AddUpdateChallengeData,
    mode: "all",
    reValidateMode: "onChange",
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Challenge name is required"),
        description: z.string().min(1, "Description is required"),
        type: z.string().min(1, "Challenge type is required"),
        prize_title: z.string().min(1, "Prize title is required"),
        target: z.enum(["WeightLoss", "MuscleGain", "Maintain", "BuildBody"], {
          required_error: "Target type is required",
        }),
        fat_percent: z.number().min(0, "Fat percentage must be at least 0"),
        weight_loss_target: z
          .number()
          .min(0, "Weight loss target must be at least 0"),
        status: z.enum(["Active", "Inactive"], {
          required_error: "Status is required",
        }),
        start_date: z.date().refine((date) => date > new Date(), {
          message: "Start date must be in the future",
        }),
        end_date: z.date(),
        weeks_duration: z
          .number()
          .min(1, "Duration must be at least 1 week")
          .max(52, "Duration cannot exceed 52 weeks")
          .optional(),
        image: z.string().optional(),
        prize_image: z.string().optional(),
        target_image: z.string().optional(),
        health_plan_id: z.string().nullable().optional(),
      })
    ),
  });

  const startDateValue = form.watch("start_date");

  useEffect(() => {
    if (form.getValues().start_date && weeksDuration) {
      const newEndDate = addWeeks(startDateValue, weeksDuration);
      setEndDate(newEndDate);
      form.setValue("end_date", newEndDate);
    }
  }, [startDateValue, weeksDuration]);

  const handleAddHealthPlan = (plan: any) => {
    setSelectedHealthPlan(plan);
    setWeeksDuration(plan.number_of_weeks || 4);
    form.setValue("weeks_duration", plan.number_of_weeks || 4);
    toast.success(
      "Update challenge weeks duration to " + (plan.number_of_weeks || 4),
      {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      }
    );
  };

  const handleRemoveHealthPlan = () => {
    setSelectedHealthPlan(null);
  };

  const onSubmit = form.handleSubmit(async (_data) => {
    try {
      setIsSubmitting(true);
      if (!startDateValue) {
        toast.error("Please select a start date", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
        return;
      }

      const calculatedEndDate = addWeeks(startDateValue, weeksDuration);

      const healthPlanId = selectedHealthPlan?._id;

      form.setValue("start_date", startDateValue);
      form.setValue("end_date", calculatedEndDate);
      form.setValue("weeks_duration", weeksDuration);

      if (selectedPlan) {
        form.setValue("health_plan_id", selectedPlan.id);
      }

      if (challengeImage.length > 0) {
        try {
          if (challengeImage[0]?.file) {
            const imageResponse = await mediaService.backupUploadImage(
              challengeImage[0].file
            );
            form.setValue("image", imageResponse.result.url);
          }
        } catch (error) {
          console.error("Error uploading challenge image:", error);
          toast.error("Failed to upload challenge image. Please try again.", {
            style: {
              background: "#cc3131",
              color: "#fff",
            },
          });
          return;
        }
      }
      if (prizeImage.length > 0) {
        try {
          if (prizeImage[0]?.file) {
            const prizeResponse = await mediaService.backupUploadImage(
              prizeImage[0].file
            );
            form.setValue("prize_image", prizeResponse.result.url);
          }
        } catch (error) {
          console.error("Error uploading prize image:", error);
          toast.error("Failed to upload prize image. Please try again.", {
            style: {
              background: "#cc3131",
              color: "#fff",
            },
          });
          return;
        }
      }
      if (targetImage.length > 0) {
        try {
          if (targetImage[0]?.file) {
            const targetResponse = await mediaService.backupUploadImage(
              targetImage[0].file
            );
            form.setValue("target_image", targetResponse.result.url);
          }
        } catch (error) {
          console.error("Error uploading target image:", error);
          toast.error("Failed to upload target image. Please try again.", {
            style: {
              background: "#cc3131",
              color: "#fff",
            },
          });
          return;
        }
      }

      const updatedData = form.getValues();

      console.log("Saving challenge:", {
        ...updatedData,
        start_date: startDateValue.toISOString(),
        end_date: calculatedEndDate.toISOString(),
        weeks_duration: weeksDuration,
        health_plan_id: healthPlanId,
      });

      const { weeks_duration, ...dataWithoutWeeksDuration } = updatedData;
      const response = await challengeService.addChallenge({
        ...dataWithoutWeeksDuration,
        start_date: startDateValue.toISOString(),
        end_date: calculatedEndDate.toISOString(),
        health_plan_id: healthPlanId,
        target_image: "",
      });
      if (!response || !response.data) {
        toast.error("Failed to create challenge. Please try again.", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
        throw new Error("Failed to create challenge. No response data.");
      }
      console.log("Challenge created successfully:", response.data);
      toast.success("Challenge created successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error saving challenge:", error);
      toast.error(
        "Failed to create challenge. Make sure all images are uploaded.",
        {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const nextStep = async () => {
    const fieldsToValidate: (keyof AddUpdateChallengeData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate.push(
        "name",
        "description",
        "type",
        "start_date",
        "weeks_duration", // Replace end_date with weeks_duration
        "status"
      );
    } else if (currentStep === 2) {
      fieldsToValidate.push("prize_title", "target");
    }

    const validateFields = async () => {
      const results = await Promise.all(
        fieldsToValidate.map(async (field) => {
          const result = await form.trigger(field);
          console.log(
            `Field: ${field}, Value: "${form.getValues(
              field
            )}", Valid: ${result}`
          );
          return result;
        })
      );

      const isValid = results.every((valid) => valid === true);
      return isValid;
    };

    const isValid = await validateFields();

    console.log("Validation result for step", currentStep, isValid);

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
          <h2 className="text-2xl font-bold mb-2">Challenge Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new challenge has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>Type: {form.getValues().type}</span>
              <span>
                {startDateValue && endDate
                  ? `${format(startDateValue, "MMM d")} - ${format(
                      endDate,
                      "MMM d, yyyy"
                    )}`
                  : "No dates set"}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setFormSubmitted(false);
              setCurrentStep(1);
              form.reset(defaultValues);
              setSelectedPlan(null);
              setStartDate(new Date());
              setEndDate(
                new Date(new Date().setMonth(new Date().getMonth() + 1))
              );
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Another Challenge
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
                Enter the details about your challenge.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <InputWithLabel<AddUpdateChallengeData>
                  fieldTitle="Challenge Name"
                  nameInSchema="name"
                  placeholder="E.g., 90 days burning fat with Mr.Levi"
                  className="w-full"
                  required
                />

                <SelectWithLabel<AddUpdateChallengeData>
                  fieldTitle="Challenge Type"
                  nameInSchema="type"
                  data={[
                    { id: "Fitness", description: "Fitness" },
                    { id: "Eating", description: "Eating" },
                    { id: "Combo", description: "Combo" },
                  ]}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <TextAreaWithLabel<AddUpdateChallengeData>
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="You will loss 2% fat after completed this challenge"
                  className="h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePickerWithLabel<AddUpdateChallengeData>
                  fieldTitle="Start Date"
                  nameInSchema="start_date"
                  required
                />

                <div className="space-y-2">
                  <Label
                    htmlFor="weeks_duration"
                    className="text-base font-medium"
                  >
                    Duration (weeks)<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      id="weeks_duration"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      min="1"
                      max="52"
                      value={weeksDuration}
                      onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          if (value > 52) {
                            value = 52;
                          }
                          if (value > 0) {
                            setWeeksDuration(value);
                            form.setValue("weeks_duration", value);
                          }
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.weeks_duration && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.weeks_duration.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Display calculated end date as read-only */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  End Date (calculated)
                </Label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70"
                  value={endDate ? format(endDate, "MMMM dd, yyyy") : ""}
                  readOnly
                  disabled
                />
              </div>

              <SelectWithLabel<AddUpdateChallengeData>
                fieldTitle="Status"
                nameInSchema="status"
                data={[
                  { id: "Active", description: "Active" },
                  { id: "Inactive", description: "Inactive" },
                ]}
                className="w-full"
                required
              />

              <div className="space-y-2">
                <Label>Challenge Image</Label>
                <ImageDropzone
                  maxImages={1}
                  maxSizeInMB={20}
                  onImagesChange={(value) => {
                    setChallengeImage(value);
                  }}
                  icon={<ImageIcon className="h-16 w-16 text-gray-300 mb-4" />}
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
                Step 2: Prize & Target
              </h2>
              <p className="text-sm text-primary">
                Set up the prize and target details for your challenge.
              </p>
            </div>

            <div className="space-y-6">
              <InputWithLabel<AddUpdateChallengeData>
                fieldTitle="Prize Title"
                nameInSchema="prize_title"
                placeholder="E.g., Fitness Tracker"
                className="w-full"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label>Prize Image</Label>
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setPrizeImage(value);
                    }}
                    icon={<Trophy className="h-16 w-16 text-gray-300 mb-4" />}
                  />
                </div>
                {/* 
                <div className="space-y-2">
                  <Label>Target Image</Label>
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setTargetImage(value);
                    }}
                    icon={<Target className="h-16 w-16 text-gray-300 mb-4" />}
                  />
                </div> */}
              </div>

              <SelectWithLabel<AddUpdateChallengeData>
                fieldTitle="Target Type"
                nameInSchema="target"
                data={[
                  { id: "WeightLoss", description: "Weight Loss" },
                  { id: "MuscleGain", description: "Muscle Gain" },
                  { id: "Maintain", description: "Maintain" },
                  { id: "BuildBody", description: "Build Body" },
                ]}
                className="w-full"
                required
              />

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<AddUpdateChallengeData>
                  fieldTitle="Weight Loss Target (kg)"
                  nameInSchema="weight_loss_target"
                  placeholder="E.g., 100"
                  type="number"
                  className="w-full"
                  onChange={(e) => {
                    const numericValue = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    form.setValue("weight_loss_target", numericValue || 0);
                  }}
                />

                <InputWithLabel<AddUpdateChallengeData>
                  fieldTitle="Fat Percentage (%)"
                  nameInSchema="fat_percent"
                  placeholder="E.g., 10"
                  type="number"
                  className="w-full"
                  onChange={(e) => {
                    const numericValue = e.target.value
                      ? parseFloat(e.target.value)
                      : null;
                    form.setValue("fat_percent", numericValue || 0);
                  }}
                />
              </div> */}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 3: Health Plan
              </h2>
              <p className="text-sm text-primary">
                Select a health plan to associate with this challenge.
              </p>
            </div>

            <div className="space-y-6">
              <HealthPlanSelector
                selectedPlans={selectedHealthPlan ? [selectedHealthPlan] : []}
                onAddPlan={handleAddHealthPlan}
                onRemovePlan={() => handleRemoveHealthPlan()}
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
        <h1 className="text-2xl font-bold">Create Challenge</h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          onError={(error) => console.error("Form validation failed", error)}
        >
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
                      Prize & Target
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
                      Health Plan
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

                {currentStep < 3 && (
                  <Button
                    type={"button"}
                    onClick={nextStep}
                    className="bg-primary hover:opacity-80"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    type="submit"
                    className="bg-primary hover:opacity-80"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Is submitting..." : "Create Challenge"}
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
