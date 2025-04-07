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
  category: "cardio" | "strength";
  description: string;
  calories_burned_per_minute: number;
  image: string;
  video: string;
};

export type CreateExerciseSetType = {
  name: string;
  type: "beginner" | "intermediate" | "advanced";
  description: string;
  numberOfExercises: number;
};

export type CreateExerciseInSetType = {
  exerciseId: string;
  duration?: number;
  reps?: number;
  rounds?: number;
  restPerRound?: number;
  estimatedCaloriesBurned?: number;
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
  id: string;
  name: string;
  description: string;
  image: string;
  calories: number;
  instructions: string;
  prepTime: number;
};

export type DishIngredientType = {
  dishId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
};
