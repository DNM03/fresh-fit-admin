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
