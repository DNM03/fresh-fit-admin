export type ExercisePlanType = {
  name: string;
  description: string;
  duration: number;
  sets: number;
  reps: number;
};

export type ExerciseType = {
  name: string;
  category: "cardio" | "strength";
  description: string;
  calories_burned_per_minute: number;
  image: string;
  video: string;
};
