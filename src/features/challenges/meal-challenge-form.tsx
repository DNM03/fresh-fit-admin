// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { format } from "date-fns";
// import {
//   ArrowRight,
//   Check,
//   Trophy,
//   Target,
//   ImageIcon,
//   Plus,
//   Trash2,
//   Search,
//   Filter,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Checkbox } from "@/components/ui/checkbox";
// import type { ChallengeType, MealType, DishType } from "@/constants/types";
// import ImageDropzone, { ImageFile } from "@/components/ui/image-dropzone";
// import InputWithLabel from "@/components/inputs/input-with-label";
// import SelectWithLabel from "@/components/inputs/select-with-label";
// import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
// import DatePickerWithLabel from "@/components/inputs/date-picker-with-label";
// import { Form } from "@/components/ui/form";

// export default function MealChallengeForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [startDate, setStartDate] = useState<Date | undefined>(new Date());
//   const [endDate, setEndDate] = useState<Date | undefined>(
//     new Date(new Date().setMonth(new Date().getMonth() + 1))
//   );
//   const [, setChallengeImage] = useState<ImageFile[]>([]);
//   const [, setPrizeImage] = useState<ImageFile[]>([]);
//   const [, setTargetImage] = useState<ImageFile[]>([]);
//   const [selectedMeals, setSelectedMeals] = useState<MealType[]>([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedMealType, setSelectedMealType] = useState<string>("all");

//   const [availableMeals] = useState<MealType[]>([
//     {
//       id: "meal-1",
//       name: "Monday Breakfast",
//       description: "Healthy start to the week",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 450,
//       prepTime: 15,
//       mealType: "breakfast",
//       date: new Date(2023, 5, 12),
//     },
//     {
//       id: "meal-2",
//       name: "Protein Lunch",
//       description: "High protein lunch for workout day",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 650,
//       prepTime: 25,
//       mealType: "lunch",
//       date: new Date(2023, 5, 12),
//     },
//     {
//       id: "meal-3",
//       name: "Light Dinner",
//       description: "Light and nutritious evening meal",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 380,
//       prepTime: 20,
//       mealType: "dinner",
//       date: new Date(2023, 5, 12),
//     },
//     {
//       id: "meal-4",
//       name: "Tuesday Breakfast",
//       description: "Quick and energizing breakfast",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 420,
//       prepTime: 10,
//       mealType: "breakfast",
//       date: new Date(2023, 5, 13),
//     },
//     {
//       id: "meal-5",
//       name: "Vegetarian Lunch",
//       description: "Plant-based lunch with complete proteins",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 550,
//       prepTime: 30,
//       mealType: "lunch",
//       date: new Date(2023, 5, 13),
//     },
//     {
//       id: "meal-6",
//       name: "Protein Dinner",
//       description: "High protein dinner with lean meats",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 620,
//       prepTime: 35,
//       mealType: "dinner",
//       date: new Date(2023, 5, 13),
//     },
//     {
//       id: "meal-7",
//       name: "Wednesday Breakfast",
//       description: "Nutrient-dense breakfast bowl",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 480,
//       prepTime: 15,
//       mealType: "breakfast",
//       date: new Date(2023, 5, 14),
//     },
//     {
//       id: "meal-8",
//       name: "Light Lunch",
//       description: "Light lunch for recovery day",
//       image: "/placeholder.svg?height=100&width=100",
//       calories: 420,
//       prepTime: 20,
//       mealType: "lunch",
//       date: new Date(2023, 5, 14),
//     },
//   ]);

//   const [mealDishes] = useState<{ [key: string]: DishType[] }>({
//     "meal-1": [
//       {
//         id: "dish-1",
//         name: "Greek Yogurt Parfait",
//         description: "Layers of Greek yogurt, granola, and fresh berries.",
//         image: "/placeholder.svg?height=100&width=100",
//         calories: 220,
//         instructions: "Layer ingredients in a glass.",
//         prepTime: 5,
//       },
//       {
//         id: "dish-6",
//         name: "Avocado Toast",
//         description:
//           "Whole grain toast topped with mashed avocado, salt, and pepper.",
//         image: "/placeholder.svg?height=100&width=100",
//         calories: 240,
//         instructions: "Toast bread and spread avocado.",
//         prepTime: 5,
//       },
//     ],
//     "meal-2": [
//       {
//         id: "dish-1",
//         name: "Grilled Chicken Salad",
//         description:
//           "Fresh greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette.",
//         image: "/placeholder.svg?height=100&width=100",
//         calories: 350,
//         instructions: "Mix all ingredients together.",
//         prepTime: 20,
//       },
//       {
//         id: "dish-11",
//         name: "Tuna Salad",
//         description: "Flaked tuna with mixed greens, eggs, and vinaigrette.",
//         image: "/placeholder.svg?height=100&width=100",
//         calories: 280,
//         instructions: "Mix tuna with salad ingredients.",
//         prepTime: 15,
//       },
//     ],
//   });

//   const defaultValues: Partial<ChallengeType> = {
//     name: "",
//     description: "",
//     type: "meal",
//     prize_title: "",
//     target: "weight_loss",
//     fat_percent: 0,
//     weight_loss_target: 0,
//     status: "draft",
//     start_date: new Date(),
//     end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//   };

//   const form = useForm<ChallengeType>({
//     defaultValues: defaultValues as ChallengeType,
//   });

//   const filteredMeals = availableMeals.filter((meal) => {
//     const matchesSearch =
//       meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       meal.description.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesType =
//       selectedMealType === "all" || meal.mealType === selectedMealType;

//     return matchesSearch && matchesType;
//   });

//   const handleAddMeal = (mealId: string) => {
//     const meal = availableMeals.find((m) => m.id === mealId);
//     if (!meal) return;

//     if (selectedMeals.some((m) => m.id === mealId)) {
//       alert("This meal is already added to the challenge");
//       return;
//     }

//     setSelectedMeals((prev) => [...prev, meal]);
//   };

//   const handleRemoveMeal = (mealId: string) => {
//     setSelectedMeals((prev) => prev.filter((m) => m.id !== mealId));
//   };

//   const onSubmit = form.handleSubmit(async (data) => {
//     if (selectedMeals.length === 0) {
//       alert("Please add at least one meal to the challenge");
//       return;
//     }

//     if (!startDate || !endDate) {
//       alert("Please select start and end dates");
//       return;
//     }

//     form.setValue("start_date", startDate);
//     form.setValue("end_date", endDate);

//     form.setValue("created_at", new Date());
//     form.setValue("updated_at", new Date());

//     // form.setValue("uuid", crypto.randomUUID());

//     console.log("Saving meal challenge:", {
//       ...data,
//       meals: selectedMeals,
//     });

//     setFormSubmitted(true);
//   });

//   const nextStep = () => {
//     const fieldsToValidate: (keyof ChallengeType)[] = [];

//     if (currentStep === 1) {
//       fieldsToValidate.push("name", "description", "target");
//     } else if (currentStep === 2) {
//       fieldsToValidate.push("prize_title");
//     }

//     const isValid = fieldsToValidate.every((field) => {
//       return form.trigger(field);
//     });

//     if (isValid) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const prevStep = () => {
//     setCurrentStep((prev) => prev - 1);
//   };

//   const getMealTypeColor = (type: string) => {
//     switch (type) {
//       case "breakfast":
//         return "bg-blue-100 text-blue-800";
//       case "lunch":
//         return "bg-green-100 text-green-800";
//       case "dinner":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const renderStepContent = () => {
//     if (formSubmitted) {
//       return (
//         <div className="text-center py-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
//             <Check className="h-8 w-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold mb-2">Challenge Created!</h2>
//           <p className="text-gray-600 mb-6">
//             Your new meal challenge has been successfully saved.
//           </p>
//           <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
//             <h3 className="font-medium">{form.getValues().name}</h3>
//             <p className="text-sm text-gray-600 mb-2">
//               {form.getValues().description}
//             </p>
//             <div className="flex justify-between text-sm">
//               <span>{selectedMeals.length} meals</span>
//               <span>
//                 {startDate && endDate
//                   ? `${format(startDate, "MMM d")} - ${format(
//                       endDate,
//                       "MMM d, yyyy"
//                     )}`
//                   : "No dates set"}
//               </span>
//             </div>
//           </div>
//           <Button
//             type="button"
//             onClick={() => {
//               setFormSubmitted(false);
//               setCurrentStep(1);
//               form.reset(defaultValues);
//               setSelectedMeals([]);
//               setStartDate(new Date());
//               setEndDate(
//                 new Date(new Date().setMonth(new Date().getMonth() + 1))
//               );
//             }}
//             className="bg-green-600 hover:bg-green-700"
//           >
//             Create Another Challenge
//           </Button>
//         </div>
//       );
//     }

//     switch (currentStep) {
//       case 1:
//         return (
//           <>
//             <div className="bg-green-50 p-4 rounded-lg mb-6">
//               <h2 className="text-lg font-medium text-primary mb-2">
//                 Step 1: Basic Information
//               </h2>
//               <p className="text-sm text-primary">
//                 Enter the details about your exercise challenge.
//               </p>
//             </div>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InputWithLabel<ChallengeType>
//                   fieldTitle="Challenge Name"
//                   nameInSchema="name"
//                   placeholder="E.g., 30-Day Fitness Challenge"
//                   className="w-full"
//                   required
//                 />

//                 <SelectWithLabel<ChallengeType>
//                   fieldTitle="Target Goal"
//                   nameInSchema="target"
//                   data={[
//                     { id: "weight_loss", description: "Weight Loss" },
//                     { id: "muscle_gain", description: "Muscle Gain" },
//                     { id: "endurance", description: "Endurance" },
//                     { id: "flexibility", description: "Flexibility" },
//                     { id: "general", description: "General Fitness" },
//                   ]}
//                   className="w-full"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <TextAreaWithLabel<ChallengeType>
//                   fieldTitle="Description"
//                   nameInSchema="description"
//                   placeholder="Describe the challenge and its goals..."
//                   className="h-24"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <DatePickerWithLabel<ChallengeType>
//                   fieldTitle="Start Date"
//                   nameInSchema="start_date"
//                   required
//                 />

//                 <DatePickerWithLabel<ChallengeType>
//                   fieldTitle="End Date"
//                   nameInSchema="end_date"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InputWithLabel<ChallengeType>
//                   fieldTitle="Weight Loss Target (kg)"
//                   nameInSchema="weight_loss_target"
//                   placeholder="E.g., 5"
//                   type="number"
//                   className="w-full"
//                   required
//                 />

//                 <InputWithLabel<ChallengeType>
//                   fieldTitle="Fat Percentage (%)"
//                   nameInSchema="fat_percent"
//                   placeholder="E.g., 15"
//                   type="number"
//                   className="w-full"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Challenge Image</Label>
//                 <ImageDropzone
//                   maxImages={1}
//                   maxSizeInMB={20}
//                   onImagesChange={(value) => {
//                     setChallengeImage(value);
//                     // if (value.length > 0) {
//                     //   form.setValue("image", "https://example.com/image-url");
//                     // } else {
//                     //   form.setValue("image", "");
//                     // }
//                   }}
//                   icon={<ImageIcon className="h-16 w-16 text-gray-300 mb-4" />}
//                 />
//               </div>
//             </div>
//           </>
//         );

//       case 2:
//         return (
//           <>
//             <div className="bg-green-50 p-4 rounded-lg mb-6">
//               <h2 className="text-lg font-medium text-primary mb-2">
//                 Step 2: Prize & Target
//               </h2>
//               <p className="text-sm text-primary">
//                 Set up the prize and target details for your challenge.
//               </p>
//             </div>

//             <div className="space-y-6">
//               <InputWithLabel<ChallengeType>
//                 fieldTitle="Prize Title"
//                 nameInSchema="prize_title"
//                 placeholder="E.g., Fitness Tracker"
//                 className="w-full"
//                 required
//               />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label>Prize Image</Label>
//                   <ImageDropzone
//                     maxImages={1}
//                     maxSizeInMB={20}
//                     onImagesChange={(value) => {
//                       setPrizeImage(value);
//                       //   if (value.length > 0) {
//                       //     form.setValue("image", "https://example.com/image-url");
//                       //   } else {
//                       //     form.setValue("image", "");
//                       //   }
//                     }}
//                     icon={<Trophy className="h-16 w-16 text-gray-300 mb-4" />}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Target Image</Label>
//                   <ImageDropzone
//                     maxImages={1}
//                     maxSizeInMB={20}
//                     onImagesChange={(value) => {
//                       setTargetImage(value);
//                       //   if (value.length > 0) {
//                       //     form.setValue("image", "https://example.com/image-url");
//                       //   } else {
//                       //     form.setValue("image", "");
//                       //   }
//                     }}
//                     icon={<Target className="h-16 w-16 text-gray-300 mb-4" />}
//                   />
//                 </div>
//               </div>

//               <SelectWithLabel<ChallengeType>
//                 fieldTitle="Target Type"
//                 nameInSchema="target"
//                 data={[
//                   { id: "weight_loss", description: "Weight Loss" },
//                   { id: "muscle_gain", description: "Muscle Gain" },
//                   { id: "endurance", description: "Endurance" },
//                 ]}
//                 className="w-full"
//                 required
//               />
//             </div>
//           </>
//         );

//       case 3:
//         return (
//           <>
//             <div className="bg-green-50 p-4 rounded-lg mb-6">
//               <h2 className="text-lg font-medium text-primary mb-2">
//                 Step 3: Meal Plans
//               </h2>
//               <p className="text-sm text-primary">
//                 Select meals to include in this challenge.
//               </p>
//             </div>

//             <div className="space-y-6">
//               <div className="flex justify-between items-center mb-4">
//                 <Label className="text-base font-medium">Selected Meals</Label>
//                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button className="bg-primary hover:opacity-80">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Meals
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                       <DialogTitle>Select Meals</DialogTitle>
//                       <DialogDescription>
//                         Search and select meals to add to your challenge.
//                       </DialogDescription>
//                     </DialogHeader>

//                     <div className="flex items-center justify-between my-4">
//                       <div className="relative w-full max-w-sm">
//                         <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           placeholder="Search meals..."
//                           className="pl-8"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                       </div>

//                       <div className="flex gap-2">
//                         <Select
//                           value={selectedMealType}
//                           onValueChange={setSelectedMealType}
//                         >
//                           <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Meal Type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All Types</SelectItem>
//                             <SelectItem value="breakfast">Breakfast</SelectItem>
//                             <SelectItem value="lunch">Lunch</SelectItem>
//                             <SelectItem value="dinner">Dinner</SelectItem>
//                           </SelectContent>
//                         </Select>

//                         <Button variant="outline">
//                           <Filter className="h-4 w-4 mr-2" />
//                           Filter
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
//                       {filteredMeals.length > 0 ? (
//                         filteredMeals.map((meal) => (
//                           <div
//                             key={meal.id}
//                             className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50"
//                           >
//                             <Checkbox
//                               id={`meal-${meal.id}`}
//                               checked={selectedMeals.some(
//                                 (m) => m.id === meal.id
//                               )}
//                               onCheckedChange={(checked) => {
//                                 if (checked) {
//                                   handleAddMeal(meal.id);
//                                 } else {
//                                   handleRemoveMeal(meal.id);
//                                 }
//                               }}
//                             />
//                             <div className="flex flex-1 items-center">
//                               <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
//                                 <img
//                                   src={meal.image || "/placeholder.svg"}
//                                   alt={meal.name}
//                                   className="w-full h-full object-cover"
//                                 />
//                               </div>
//                               <div className="flex-1">
//                                 <Label
//                                   htmlFor={`meal-${meal.id}`}
//                                   className="font-medium cursor-pointer"
//                                 >
//                                   {meal.name}
//                                 </Label>
//                                 <p className="text-xs text-gray-500 truncate max-w-[200px]">
//                                   {meal.description}
//                                 </p>
//                                 <div className="flex items-center mt-1">
//                                   <Badge
//                                     className={`${getMealTypeColor(
//                                       meal.mealType
//                                     )} text-xs`}
//                                     variant="outline"
//                                   >
//                                     {meal.mealType.charAt(0).toUpperCase() +
//                                       meal.mealType.slice(1)}
//                                   </Badge>
//                                   <span className="text-xs text-gray-500 ml-2">
//                                     {meal.calories} cal
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="col-span-2 text-center py-8">
//                           <p className="text-gray-500">
//                             No meals found matching your criteria.
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     <DialogFooter className="mt-4">
//                       <Button
//                         variant="outline"
//                         onClick={() => setDialogOpen(false)}
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         onClick={() => setDialogOpen(false)}
//                         className="bg-green-600 hover:bg-green-700"
//                       >
//                         Add Selected Meals
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </div>

//               {selectedMeals.length > 0 ? (
//                 <div className="space-y-4">
//                   {selectedMeals.map((meal) => (
//                     <Card key={meal.id} className="p-4">
//                       <div className="flex justify-between items-start">
//                         <div className="flex items-center flex-1">
//                           <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
//                             <img
//                               src={meal.image || "/placeholder.svg"}
//                               alt={meal.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex items-center">
//                               <h4 className="font-medium">{meal.name}</h4>
//                               <Badge
//                                 className={`${getMealTypeColor(
//                                   meal.mealType
//                                 )} text-xs ml-2`}
//                                 variant="outline"
//                               >
//                                 {meal.mealType.charAt(0).toUpperCase() +
//                                   meal.mealType.slice(1)}
//                               </Badge>
//                             </div>
//                             <p className="text-sm text-gray-500 mb-2">
//                               {meal.description}
//                             </p>
//                             <div className="text-xs text-gray-500">
//                               {meal.calories} calories | {meal.prepTime} min
//                               prep
//                             </div>

//                             {mealDishes[meal.id] && (
//                               <div className="mt-3 border-t pt-3">
//                                 <h5 className="text-sm font-medium mb-2">
//                                   Dishes:
//                                 </h5>
//                                 <div className="space-y-2">
//                                   {mealDishes[meal.id].map((dish) => (
//                                     <div
//                                       key={dish.id}
//                                       className="text-xs bg-gray-50 p-2 rounded flex justify-between"
//                                     >
//                                       <span>{dish.name}</span>
//                                       <span className="text-gray-500">
//                                         {dish.calories} cal
//                                       </span>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleRemoveMeal(meal.id)}
//                           className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                         >
//                           <Trash2 size={16} />
//                         </Button>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 border rounded-lg bg-gray-50">
//                   <p className="text-gray-500">No meals added yet</p>
//                 </div>
//               )}
//             </div>
//           </>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex items-center mb-6">
//         <h1 className="text-2xl font-bold">Create Meal Challenge</h1>
//       </div>
//       <Form {...form}>
//         <form onSubmit={onSubmit}>
//           <Card className="p-6">
//             {!formSubmitted && (
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center">
//                     <div
//                       className={`flex items-center justify-center w-8 h-8 rounded-full ${
//                         currentStep >= 1
//                           ? "bg-primary text-white"
//                           : "bg-gray-100 text-gray-400"
//                       } mr-2`}
//                     >
//                       1
//                     </div>
//                     <span
//                       className={
//                         currentStep >= 1
//                           ? "text-primary font-medium"
//                           : "text-gray-400"
//                       }
//                     >
//                       Basic Info
//                     </span>
//                   </div>
//                   <div className="flex-1 mx-4 h-1 bg-gray-200">
//                     <div
//                       className={`h-1 bg-primary transition-all ${
//                         currentStep >= 2 ? "w-full" : "w-0"
//                       }`}
//                     ></div>
//                   </div>
//                   <div className="flex items-center">
//                     <div
//                       className={`flex items-center justify-center w-8 h-8 rounded-full ${
//                         currentStep >= 2
//                           ? "bg-primary text-white"
//                           : "bg-gray-100 text-gray-400"
//                       } mr-2`}
//                     >
//                       2
//                     </div>
//                     <span
//                       className={
//                         currentStep >= 2
//                           ? "text-primary font-medium"
//                           : "text-gray-400"
//                       }
//                     >
//                       Prize & Target
//                     </span>
//                   </div>
//                   <div className="flex-1 mx-4 h-1 bg-gray-200">
//                     <div
//                       className={`h-1 bg-primary transition-all ${
//                         currentStep >= 3 ? "w-full" : "w-0"
//                       }`}
//                     ></div>
//                   </div>
//                   <div className="flex items-center">
//                     <div
//                       className={`flex items-center justify-center w-8 h-8 rounded-full ${
//                         currentStep >= 3
//                           ? "bg-primary text-white"
//                           : "bg-gray-100 text-gray-400"
//                       } mr-2`}
//                     >
//                       3
//                     </div>
//                     <span
//                       className={
//                         currentStep >= 3
//                           ? "text-primary font-medium"
//                           : "text-gray-400"
//                       }
//                     >
//                       Meal Plans
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {renderStepContent()}

//             {!formSubmitted && (
//               <div className="flex justify-end mt-6">
//                 {currentStep > 1 ? (
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={prevStep}
//                     className="mr-2"
//                   >
//                     Previous
//                   </Button>
//                 ) : (
//                   <div></div>
//                 )}

//                 {currentStep < 3 ? (
//                   <Button
//                     type="button"
//                     onClick={nextStep}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     Next
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 ) : (
//                   <Button
//                     type="submit"
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     Create Challenge
//                   </Button>
//                 )}
//               </div>
//             )}
//           </Card>
//         </form>
//       </Form>
//     </div>
//   );
// }
