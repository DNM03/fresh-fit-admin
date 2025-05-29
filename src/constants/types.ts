export type ExercisePlanType = {
  name: string;
  description: string;
  sets: number;
  type: "beginner" | "intermediate" | "advanced";
  startDate: Date;
  endDate: Date;
};

export type ExerciseType = {
  name: string;
  category: "Cardio" | "Strength";
  description: string;
  calories_burn_per_minutes: number;
  image?: string;
  video?: string;
  type:
    | "Activation"
    | "Conditioning"
    | "Olympic_Lifting"
    | "Plyometrics"
    | "Powerlifting"
    | "SMR"
    | "Strength"
    | "Stretching"
    | "Strongman"
    | "Warmup";
  equipment?: string;
  mechanics: "Compound" | "Isolation";
  forceType:
    | "Compression"
    | "Dynamic_Stretching"
    | "Hinge_Bilateral"
    | "Hinge_Unilateral"
    | "Isometric"
    | "Press_Bilateral"
    | "Pull"
    | "Pull_Bilateral"
    | "Pull_Unilateral"
    | "Push"
    | "Push_Bilateral"
    | "Push_Unilateral"
    | "Static"
    | "Static_Stretching";
  experience_level: "Beginner" | "Intermediate" | "Advanced";
  instructions?: string;
  tips?: string;
  target_muscle?: {
    name: string;
    image?: string;
  };
  secondary_muscle?: {
    name: string;
    image?: string;
  };
};
export type CreateExerciseSetType = {
  name: string;
  type: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  numberOfExercises: number;
};

export type CreateExerciseInSetType = {
  exercise_id: string;
  duration?: number;
  reps?: number;
  rounds?: number;
  rest_per_round?: number;
  estimated_calories_burned?: number;
  timePerRound?: number;
  orderNumber?: number;
};

export type IngredientType = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  image: string;
  sugar: number;
  cholesterol: number;
  sodium: number;
  description: string;
};

export interface Post {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  content: string;
  image: string | null;
  likes: number;
  isLiked: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  createdAt: string;
  status: "published" | "pending";
}

export type DishType = {
  _id: string;
  name: string;
  description: string;
  image: string;
  calories: number;
  instruction: string;
  prep_time: number;
  fat?: number;
  saturatedFat?: number;
  cholesterol?: number;
  sodium?: number;
  carbohydrate?: number;
  fiber?: number;
  sugar?: number;
  protein?: number;
  ingredients?: {
    ingredientId: string;
    quantity: number;
    unit: string;
  }[];
};

export type DishIngredientType = {
  dishId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
};

export type MealType = {
  id: string;
  name: string;
  description: string;
  image: string;
  calories: number;
  pre_time: number;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  date: Date;
};

export type MealDishType = {
  mealId: string;
  dishId: string;
};

export type ChallengeType = {
  id: string;
  uuid: string;
  name: string;
  description: string;
  type: "exercise" | "meal" | "combined";
  prize_image: string;
  prize_title: string;
  target:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "flexibility"
    | "general";
  target_image: string;
  fat_percent: number;
  weight_loss_target: number;
  image: string;
  status: "draft" | "active" | "completed" | "cancelled";
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
};

export type PlanType = {
  id: string;
  name: string;
  description: string;
  duration: number;
  challenge_id?: string;
};

export type SetType = {
  id: string;
  name: string;
  estimatedCaloriesBurned: number;
  description: string;
};

export type SetInPlanType = {
  id: string;
  setId: string;
  week: number;
  day: number;
  caloriesBurned: number;
  name: string;
};
