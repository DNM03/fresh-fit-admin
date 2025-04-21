import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  ArrowRight,
  Check,
  Trophy,
  Target,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import type { ChallengeType, PlanType, SetInPlanType } from "@/constants/types";
import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
import InputWithLabel from "@/components/inputs/input-with-label";
import { Form } from "@/components/ui/form";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";

export default function ExerciseChallengeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [, setChallengeImage] = useState<ImageFile[]>([]);
  const [, setPrizeImage] = useState<ImageFile[]>([]);
  const [, setTargetImage] = useState<ImageFile[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<PlanType[]>([]);
  const [availablePlans] = useState<PlanType[]>([
    {
      id: "plan-1",
      name: "30-Day Weight Loss",
      description: "A comprehensive plan to lose weight in 30 days",
      duration: 30,
    },
    {
      id: "plan-2",
      name: "Muscle Building",
      description: "Focus on building muscle mass over 8 weeks",
      duration: 56,
    },
    {
      id: "plan-3",
      name: "Cardio Boost",
      description: "Improve cardiovascular health in 4 weeks",
      duration: 28,
    },
    {
      id: "plan-4",
      name: "Flexibility & Mobility",
      description: "Enhance flexibility and joint mobility",
      duration: 21,
    },
  ]);

  const [planSets] = useState<{ [key: string]: SetInPlanType[] }>({
    "plan-1": [
      {
        id: "set-1-1",
        setId: "set-001",
        week: 1,
        day: 1,
        caloriesBurned: 350,
        name: "Upper Body Strength",
      },
      {
        id: "set-1-2",
        setId: "set-002",
        week: 1,
        day: 3,
        caloriesBurned: 420,
        name: "Lower Body Power",
      },
    ],
    "plan-2": [
      {
        id: "set-2-1",
        setId: "set-007",
        week: 1,
        day: 2,
        caloriesBurned: 320,
        name: "Back & Biceps",
      },
      {
        id: "set-2-2",
        setId: "set-008",
        week: 1,
        day: 4,
        caloriesBurned: 300,
        name: "Shoulder Sculpt",
      },
    ],
    "plan-3": [
      {
        id: "set-3-1",
        setId: "set-004",
        week: 1,
        day: 1,
        caloriesBurned: 500,
        name: "HIIT Cardio",
      },
    ],
    "plan-4": [
      {
        id: "set-4-1",
        setId: "set-006",
        week: 1,
        day: 2,
        caloriesBurned: 200,
        name: "Mobility & Flexibility",
      },
    ],
  });

  const defaultValues: Partial<ChallengeType> = {
    name: "",
    description: "",
    type: "exercise",
    prize_title: "",
    target: "weight_loss",
    fat_percent: 0,
    weight_loss_target: 0,
    status: "draft",
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  };

  const form = useForm<ChallengeType>({
    defaultValues: defaultValues as ChallengeType,
  });

  const handleAddPlan = (planId: string) => {
    const plan = availablePlans.find((p) => p.id === planId);
    if (!plan) return;

    if (selectedPlans.some((p) => p.id === planId)) {
      alert("This plan is already added to the challenge");
      return;
    }

    setSelectedPlans((prev) => [...prev, plan]);
  };

  const handleRemovePlan = (planId: string) => {
    setSelectedPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    if (selectedPlans.length === 0) {
      alert("Please add at least one exercise plan to the challenge");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }

    form.setValue("start_date", startDate);
    form.setValue("end_date", endDate);

    form.setValue("created_at", new Date());
    form.setValue("updated_at", new Date());

    // form.setValue("uuid", crypto.randomUUID());

    console.log("Saving exercise challenge:", {
      ...data,
      plans: selectedPlans,
    });

    setFormSubmitted(true);
  });

  const nextStep = () => {
    const fieldsToValidate: (keyof ChallengeType)[] = [];

    if (currentStep === 1) {
      fieldsToValidate.push("name", "description", "target");
    } else if (currentStep === 2) {
      fieldsToValidate.push("prize_title");
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
          <h2 className="text-2xl font-bold mb-2">Challenge Created!</h2>
          <p className="text-gray-600 mb-6">
            Your new exercise challenge has been successfully saved.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium">{form.getValues().name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {form.getValues().description}
            </p>
            <div className="flex justify-between text-sm">
              <span>{selectedPlans.length} exercise plans</span>
              <span>
                {startDate && endDate
                  ? `${format(startDate, "MMM d")} - ${format(
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
              setSelectedPlans([]);
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
                Enter the details about your exercise challenge.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<ChallengeType>
                  fieldTitle="Challenge Name"
                  nameInSchema="name"
                  placeholder="E.g., 30-Day Fitness Challenge"
                  className="w-full"
                  required
                />

                <SelectWithLabel<ChallengeType>
                  fieldTitle="Target Goal"
                  nameInSchema="target"
                  data={[
                    { id: "weight_loss", description: "Weight Loss" },
                    { id: "muscle_gain", description: "Muscle Gain" },
                    { id: "endurance", description: "Endurance" },
                    { id: "flexibility", description: "Flexibility" },
                    { id: "general", description: "General Fitness" },
                  ]}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <TextAreaWithLabel<ChallengeType>
                  fieldTitle="Description"
                  nameInSchema="description"
                  placeholder="Describe the challenge and its goals..."
                  className="h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePickerWithLabel<ChallengeType>
                  fieldTitle="Start Date"
                  nameInSchema="start_date"
                  required
                />

                <DatePickerWithLabel<ChallengeType>
                  fieldTitle="End Date"
                  nameInSchema="end_date"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithLabel<ChallengeType>
                  fieldTitle="Weight Loss Target (kg)"
                  nameInSchema="weight_loss_target"
                  placeholder="E.g., 5"
                  type="number"
                  className="w-full"
                  required
                />

                <InputWithLabel<ChallengeType>
                  fieldTitle="Fat Percentage (%)"
                  nameInSchema="fat_percent"
                  placeholder="E.g., 15"
                  type="number"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Challenge Image</Label>
                <ImageDropzone
                  maxImages={1}
                  maxSizeInMB={20}
                  onImagesChange={(value) => {
                    setChallengeImage(value);
                    // if (value.length > 0) {
                    //   form.setValue("image", "https://example.com/image-url");
                    // } else {
                    //   form.setValue("image", "");
                    // }
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
              <InputWithLabel<ChallengeType>
                fieldTitle="Prize Title"
                nameInSchema="prize_title"
                placeholder="E.g., Fitness Tracker"
                className="w-full"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Prize Image</Label>
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setPrizeImage(value);
                      //   if (value.length > 0) {
                      //     form.setValue("image", "https://example.com/image-url");
                      //   } else {
                      //     form.setValue("image", "");
                      //   }
                    }}
                    icon={<Trophy className="h-16 w-16 text-gray-300 mb-4" />}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Image</Label>
                  <ImageDropzone
                    maxImages={1}
                    maxSizeInMB={20}
                    onImagesChange={(value) => {
                      setTargetImage(value);
                      //   if (value.length > 0) {
                      //     form.setValue("image", "https://example.com/image-url");
                      //   } else {
                      //     form.setValue("image", "");
                      //   }
                    }}
                    icon={<Target className="h-16 w-16 text-gray-300 mb-4" />}
                  />
                </div>
              </div>

              <SelectWithLabel<ChallengeType>
                fieldTitle="Target Type"
                nameInSchema="target"
                data={[
                  { id: "weight_loss", description: "Weight Loss" },
                  { id: "muscle_gain", description: "Muscle Gain" },
                  { id: "endurance", description: "Endurance" },
                ]}
                className="w-full"
                required
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-primary mb-2">
                Step 3: Exercise Plans
              </h2>
              <p className="text-sm text-primary">
                Select exercise plans to include in this challenge.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Available Exercise Plans</Label>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {availablePlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAddPlan(plan.id)}
                      >
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {plan.description}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              {plan.duration} days
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-primary"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Plans</Label>
                {selectedPlans.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPlans.map((plan) => (
                      <Card key={plan.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {plan.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              {plan.duration} days
                            </div>

                            {/* Show exercise sets for this plan */}
                            {planSets[plan.id] && (
                              <div className="mt-3 border-t pt-3">
                                <h5 className="text-sm font-medium mb-2">
                                  Exercise Sets:
                                </h5>
                                <div className="space-y-2">
                                  {planSets[plan.id].map((set) => (
                                    <div
                                      key={set.id}
                                      className="text-xs bg-gray-50 p-2 rounded flex justify-between"
                                    >
                                      <span>{set.name}</span>
                                      <span className="text-gray-500">
                                        Week {set.week}, Day {set.day}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePlan(plan.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">No exercise plans added yet</p>
                  </div>
                )}
              </div>
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
        <h1 className="text-2xl font-bold">Create Exercise Challenge</h1>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit}>
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
                      Exercise Plans
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

                {currentStep < 3 ? (
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
                    Create Challenge
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
