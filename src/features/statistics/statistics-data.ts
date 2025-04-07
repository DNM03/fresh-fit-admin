import { Activity, Target, Users, Utensils } from 'lucide-react'

// User growth data
export const userGrowthData = [
  { name: "Jan", users: 1200, newUsers: 200, churnedUsers: 50 },
  { name: "Feb", users: 1350, newUsers: 220, churnedUsers: 70 },
  { name: "Mar", users: 1500, newUsers: 250, churnedUsers: 100 },
  { name: "Apr", users: 1650, newUsers: 200, churnedUsers: 50 },
  { name: "May", users: 1800, newUsers: 230, churnedUsers: 80 },
  { name: "Jun", users: 2000, newUsers: 300, churnedUsers: 100 },
  { name: "Jul", users: 2200, newUsers: 350, churnedUsers: 150 },
  { name: "Aug", users: 2400, newUsers: 300, churnedUsers: 100 },
  { name: "Sep", users: 2600, newUsers: 350, churnedUsers: 150 },
  { name: "Oct", users: 2800, newUsers: 300, churnedUsers: 100 },
  { name: "Nov", users: 3000, newUsers: 350, churnedUsers: 150 },
  { name: "Dec", users: 3200, newUsers: 400, churnedUsers: 200 },
]

// Workout completion data
export const workoutCompletionData = [
  { name: "Mon", completed: 85, target: 100 },
  { name: "Tue", completed: 92, target: 100 },
  { name: "Wed", completed: 78, target: 100 },
  { name: "Thu", completed: 95, target: 100 },
  { name: "Fri", completed: 88, target: 100 },
  { name: "Sat", completed: 72, target: 100 },
  { name: "Sun", completed: 65, target: 100 },
]

// Workout type distribution
export const workoutTypeData = [
  { name: "Strength", value: 35 },
  { name: "Cardio", value: 25 },
  { name: "Flexibility", value: 15 },
  { name: "HIIT", value: 15 },
  { name: "Recovery", value: 10 },
]

// Nutrition plan adherence
export const nutritionAdherenceData = [
  { name: "Week 1", adherence: 78 },
  { name: "Week 2", adherence: 82 },
  { name: "Week 3", adherence: 86 },
  { name: "Week 4", adherence: 75 },
  { name: "Week 5", adherence: 90 },
  { name: "Week 6", adherence: 88 },
  { name: "Week 7", adherence: 92 },
  { name: "Week 8", adherence: 95 },
]

// Calorie intake vs burned
export const calorieData = [
  { name: "Mon", intake: 2100, burned: 2300 },
  { name: "Tue", intake: 2200, burned: 2400 },
  { name: "Wed", intake: 2300, burned: 2100 },
  { name: "Thu", intake: 2000, burned: 2200 },
  { name: "Fri", intake: 2400, burned: 2500 },
  { name: "Sat", intake: 2600, burned: 2300 },
  { name: "Sun", intake: 2500, burned: 2000 },
]

// Challenge participation
export const challengeParticipationData = [
  { name: "30 Day Plank", participants: 1200, completion: 65 },
  { name: "100 Pushups", participants: 950, completion: 72 },
  { name: "Squat Challenge", participants: 1500, completion: 58 },
  { name: "10K Steps", participants: 2200, completion: 82 },
  { name: "Weight Loss", participants: 1800, completion: 45 },
]

// User demographics
export const userDemographicsData = [
  { name: "18-24", value: 15 },
  { name: "25-34", value: 35 },
  { name: "35-44", value: 25 },
  { name: "45-54", value: 15 },
  { name: "55+", value: 10 },
]

// Goal achievement
export const goalAchievementData = [
  { name: "Weight Loss", fill: "#FF6B6B", value: 78 },
  { name: "Muscle Gain", fill: "#4ECDC4", value: 65 },
  { name: "Endurance", fill: "#45B7D1", value: 83 },
  { name: "Flexibility", fill: "#96CEB4", value: 72 },
  { name: "Overall Health", fill: "#FFEEAD", value: 90 },
]

// Top performing workouts
export const topWorkoutsData = [
  {
    name: "Full Body HIIT",
    completions: 1250,
    rating: 4.8,
    growth: "+12%",
    trend: "up",
  },
  {
    name: "Core Crusher",
    completions: 980,
    rating: 4.7,
    growth: "+8%",
    trend: "up",
  },
  {
    name: "Leg Day",
    completions: 1100,
    rating: 4.5,
    growth: "+5%",
    trend: "up",
  },
  {
    name: "Upper Body Strength",
    completions: 850,
    rating: 4.6,
    growth: "-3%",
    trend: "down",
  },
  {
    name: "Yoga Flow",
    completions: 750,
    rating: 4.9,
    growth: "+15%",
    trend: "up",
  },
]

// Top performing meal plans
export const topMealsData = [
  {
    name: "Keto Diet",
    adherence: 82,
    rating: 4.5,
    growth: "+7%",
    trend: "up",
  },
  {
    name: "Mediterranean",
    adherence: 88,
    rating: 4.8,
    growth: "+15%",
    trend: "up",
  },
  {
    name: "Vegan Plan",
    adherence: 75,
    rating: 4.6,
    growth: "+4%",
    trend: "up",
  },
  {
    name: "High Protein",
    adherence: 85,
    rating: 4.7,
    growth: "+9%",
    trend: "up",
  },
  {
    name: "Intermittent Fasting",
    adherence: 72,
    rating: 4.4,
    growth: "-2%",
    trend: "down",
  },
]

// Colors for charts
export const COLORS = [
  "#FF6B6B", // Coral Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Sky Blue
  "#96CEB4", // Sage Green
  "#FFEEAD", // Cream Yellow
]

// Summary metrics
export const summaryMetrics = [
  {
    title: "Total Users",
    value: "3,245",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Workout Completion",
    value: "82.3%",
    change: "+5.2%",
    trend: "up",
    icon: Activity,
  },
  {
    title: "Nutrition Adherence",
    value: "78.5%",
    change: "+3.8%",
    trend: "up",
    icon: Utensils,
  },
  {
    title: "Active Challenges",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Target,
  },
]

// Helper function to get level badge color
export const getLevelColor = (level: string) => {
  switch (level) {
    case "Gold":
      return "bg-amber-500 hover:bg-amber-600"
    case "Platinum":
      return "bg-slate-400 hover:bg-slate-500"
    case "Silver":
      return "bg-gray-300 hover:bg-gray-400 text-gray-800"
    default:
      return "bg-primary hover:bg-primary/90"
  }
}
