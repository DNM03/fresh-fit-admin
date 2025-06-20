import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertCircle, ImageIcon, Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { addWeeks, differenceInWeeks } from "date-fns";

import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import HealthPlanSelector from "./health-plan-selector";

import challengeService from "@/services/challenge.service";
import mediaService from "@/services/media.service";
import { toast } from "sonner";

interface UpdateChallengeFormProps {
  challenge: any;
  onSuccess: () => void;
}

export default function UpdateChallengeForm({
  challenge,
  onSuccess,
}: UpdateChallengeFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image files
  const [challengeImage, setChallengeImage] = useState<ImageFile[]>([]);
  const [prizeImage, setPrizeImage] = useState<ImageFile[]>([]);
  const [targetImage] = useState<ImageFile[]>([]);

  // Dates and duration
  const [startDate, setStartDate] = useState<Date | undefined>(
    challenge.start_date ? new Date(challenge.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    challenge.end_date ? new Date(challenge.end_date) : new Date()
  );

  // Calculate initial weeks duration based on start and end dates
  const initialWeeksDuration =
    startDate && endDate
      ? Math.max(1, Math.round(differenceInWeeks(endDate, startDate)))
      : 4;

  const [weeksDuration, setWeeksDuration] =
    useState<number>(initialWeeksDuration);

  // Health plan
  const [selectedHealthPlan, setSelectedHealthPlan] = useState<any | null>(
    challenge.health_plan || null
  );

  const schema = z.object({
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
    start_date: z.date(),
    weeks_duration: z
      .number()
      .min(1, "Duration must be at least 1 week")
      .max(52, "Duration cannot exceed 52 weeks"),
    end_date: z.date(),
    image: z.string().optional(),
    prize_image: z.string().optional(),
    target_image: z.string().optional(),
    health_plan_id: z.string().nullable().optional(),
  });

  const form = useForm({
    defaultValues: {
      name: challenge.name || "",
      description: challenge.description || "",
      type: challenge.type || "Combo",
      prize_title: challenge.prize_title || "",
      target: challenge.target || "WeightLoss",
      fat_percent: challenge.fat_percent || 0,
      weight_loss_target: challenge.weight_loss_target || 0,
      status: challenge.status || "Inactive",
      start_date: startDate,
      weeks_duration: initialWeeksDuration,
      end_date: endDate,
      image: challenge.image || "",
      prize_image: challenge.prize_image || "",
      target_image: challenge.target_image || "",
      health_plan_id: challenge.health_plan_id || null,
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { formState } = form;
  const { errors } = formState;

  const hasDetailsErrors = !!(
    errors.name ||
    errors.description ||
    errors.type ||
    errors.start_date ||
    errors.weeks_duration ||
    errors.status
  );

  const hasTargetPrizeErrors = !!(
    errors.prize_title ||
    errors.target ||
    errors.fat_percent ||
    errors.weight_loss_target
  );

  // Watch for changes to start date and weeks duration
  const watchStartDate = form.watch("start_date");
  const watchWeeksDuration = form.watch("weeks_duration");

  // Update end date when start date or weeks duration changes
  useEffect(() => {
    if (watchStartDate && watchWeeksDuration) {
      const newEndDate = addWeeks(watchStartDate, watchWeeksDuration);
      setEndDate(newEndDate);
      form.setValue("end_date", newEndDate);
    }
  }, [watchStartDate, watchWeeksDuration, form]);

  // Listen for form field changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "start_date" && value.start_date) {
        setStartDate(value.start_date as Date);
      }
      if (name === "weeks_duration" && value.weeks_duration) {
        setWeeksDuration(value.weeks_duration as number);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleAddHealthPlan = (plan: any) => {
    setSelectedHealthPlan(plan);

    // Update weeks duration to match the selected health plan
    if (plan && plan.number_of_weeks) {
      const planWeeks = plan.number_of_weeks;
      setWeeksDuration(planWeeks);
      form.setValue("weeks_duration", planWeeks);

      // Also update end date based on new duration
      if (watchStartDate) {
        const newEndDate = addWeeks(watchStartDate, planWeeks);
        setEndDate(newEndDate);
        form.setValue("end_date", newEndDate);
      }

      // Show success notification
      toast.success(
        `Challenge duration updated to ${planWeeks} weeks to match health plan`,
        {
          style: {
            background: "#3ac76b",
            color: "#fff",
          },
        }
      );
    }
  };

  const handleRemoveHealthPlan = () => {
    setSelectedHealthPlan(null);
  };

  const onSubmit = async (data: any) => {
    if (!challenge._id) return;

    setIsSubmitting(true);
    try {
      // Process images if changed
      let imageUrl = challenge.image;
      let prizeImageUrl = challenge.prize_image;
      let targetImageUrl = challenge.target_image;

      if (challengeImage.length > 0 && challengeImage[0]?.file) {
        const imageResponse = await mediaService.backupUploadImage(
          challengeImage[0].file
        );
        imageUrl = imageResponse.result.url;
      }

      if (prizeImage.length > 0 && prizeImage[0]?.file) {
        const prizeResponse = await mediaService.backupUploadImage(
          prizeImage[0].file
        );
        prizeImageUrl = prizeResponse.result.url;
      }

      if (targetImage.length > 0 && targetImage[0]?.file) {
        const targetResponse = await mediaService.backupUploadImage(
          targetImage[0].file
        );
        targetImageUrl = targetResponse.result.url;
      }

      const healthPlanId = selectedHealthPlan?._id || null;

      // Calculate end date based on start date and weeks duration
      const calculatedEndDate = addWeeks(data.start_date, data.weeks_duration);

      const updateData = {
        ...data,
        image: imageUrl,
        prize_image: prizeImageUrl,
        target_image: targetImageUrl,
        start_date: data.start_date.toISOString(),
        end_date: calculatedEndDate.toISOString(),
        health_plan_id: healthPlanId,
      };

      // Remove weeks_duration as it's not needed in the API
      const { weeks_duration, ...dataToSend } = updateData;

      console.log("Updating challenge with data:", dataToSend);

      const response = await challengeService.updateChallenge(
        challenge._id,
        dataToSend
      );
      console.log("Challenge updated successfully:", response);
      toast.success("Challenge updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
      window.location.reload();
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Failed to update challenge. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: string[] = [];

    // Only check health plan match when moving to the health plan tab
    if (activeTab === "details" && selectedHealthPlan?.number_of_weeks) {
      const currentWeeksDuration = form.getValues("weeks_duration");
      const planWeeks = selectedHealthPlan.number_of_weeks;

      if (currentWeeksDuration !== planWeeks) {
        // Offer to update the duration to match

        setWeeksDuration(planWeeks);
        form.setValue("weeks_duration", planWeeks);

        // Update end date
        if (watchStartDate) {
          const newEndDate = addWeeks(watchStartDate, planWeeks);
          setEndDate(newEndDate);
          form.setValue("end_date", newEndDate);
        }

        toast.success(
          `Challenge duration updated to ${planWeeks} weeks to match health plan`,
          {
            style: {
              background: "#3ac76b",
              color: "#fff",
            },
          }
        );
      }
    }

    if (activeTab === "details") {
      fieldsToValidate.push(
        "name",
        "description",
        "type",
        "start_date",
        "weeks_duration",
        "status"
      );
    } else if (activeTab === "targetprize") {
      fieldsToValidate.push(
        "prize_title",
        "target",
        "fat_percent",
        "weight_loss_target"
      );
    }

    const validateFields = async () => {
      const results = await Promise.all(
        fieldsToValidate.map(async (field) => {
          return await form.trigger(field as any);
        })
      );
      return results.every((result) => result === true);
    };

    const isValid = await validateFields();

    if (isValid) {
      setActiveTab((prev) =>
        prev === "details" ? "targetprize" : "healthplan"
      );
    }
  };

  const prevStep = () => {
    setActiveTab((prev) => (prev === "healthplan" ? "targetprize" : "details"));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <TabsList className="grid grid-cols-3 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
              <TabsTrigger
                value="details"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
              >
                Step 1: Basic Details
                {hasDetailsErrors && (
                  <span className="absolute top-1 right-1 text-red-500">
                    <AlertCircle size={16} />
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="targetprize"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
              >
                Step 2: Target & Prize
                {hasTargetPrizeErrors && (
                  <span className="absolute top-1 right-1 text-red-500">
                    <AlertCircle size={16} />
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="healthplan"
                className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-100"
              >
                Step 3: Health Plan
              </TabsTrigger>

              <motion.div
                className="absolute bottom-0 h-1 bg-primary rounded-full"
                layout
                initial={false}
                animate={{
                  left:
                    activeTab === "details"
                      ? "0%"
                      : activeTab === "targetprize"
                      ? "33.33%"
                      : "66.66%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: "33.33%" }}
              />
            </TabsList>
          </div>

          <div className="px-4 py-2">
            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel
                  fieldTitle="Challenge Name"
                  nameInSchema="name"
                  placeholder="E.g., 90 days burning fat with Mr.Levi"
                  className="w-full"
                  required
                />

                <SelectWithLabel
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
                <TextAreaWithLabel
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="You will loss 2% fat after completed this challenge"
                  className="h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePickerWithLabel
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
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          setWeeksDuration(value);
                          form.setValue("weeks_duration", value);
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
                  value={endDate ? endDate.toLocaleDateString() : ""}
                  readOnly
                  disabled
                />
              </div>

              <SelectWithLabel
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
                {challenge.image && (
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">
                      Current image:
                    </span>
                    <div className="mt-2 border rounded-md w-40 h-40 overflow-hidden">
                      <img
                        src={challenge.image}
                        alt="Current challenge"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/200x200/eee/ccc?text=Challenge";
                        }}
                      />
                    </div>
                  </div>
                )}
                <ImageDropzone
                  maxImages={1}
                  maxSizeInMB={20}
                  onImagesChange={(value) => {
                    setChallengeImage(value);
                  }}
                  icon={<ImageIcon className="h-16 w-16 text-gray-300 mb-4" />}
                />
              </div>
            </TabsContent>

            <TabsContent value="targetprize" className="mt-0 space-y-6">
              <InputWithLabel
                fieldTitle="Prize Title"
                nameInSchema="prize_title"
                placeholder="E.g., Fitness Tracker"
                className="w-full"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label>Prize Image</Label>
                  {challenge.prize_image && (
                    <div className="mb-3">
                      <span className="text-sm text-muted-foreground">
                        Current image:
                      </span>
                      <div className="mt-2 border rounded-md w-40 h-40 overflow-hidden">
                        <img
                          src={challenge.prize_image}
                          alt="Current prize"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/200x200/ffd/fc9?text=Prize";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setPrizeImage(value);
                    }}
                    icon={<Trophy className="h-16 w-16 text-gray-300 mb-4" />}
                  />
                </div>
              </div>

              <SelectWithLabel
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
            </TabsContent>

            <TabsContent value="healthplan" className="mt-0 space-y-6">
              <HealthPlanSelector
                selectedPlans={selectedHealthPlan ? [selectedHealthPlan] : []}
                onAddPlan={handleAddHealthPlan}
                onRemovePlan={handleRemoveHealthPlan}
              />

              <div className="text-sm text-muted-foreground mt-6">
                <p>
                  Select a health plan to associate with this challenge.
                  Participants will follow this plan throughout the challenge
                  duration.
                </p>
              </div>
            </TabsContent>
          </div>

          <div className="flex justify-between pt-6 border-t mt-6">
            {activeTab !== "details" ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous Step
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
            )}

            {activeTab !== "healthplan" && (
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            )}
            {activeTab === "healthplan" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Challenge"}
              </Button>
            )}
          </div>
        </Tabs>
      </form>
    </Form>
  );
}
