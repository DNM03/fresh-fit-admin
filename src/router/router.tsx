import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import LoginPage from "../pages/login";
import MainLayout from "@/components/layout/main-layout";
import DashboardPage from "@/pages/dashboard";
import React from "react";
import AddExercisePlanPage from "@/pages/exercises/add-exercise-plan";
import AddExercisePage from "@/pages/exercises/add-exercise";
import OverlayLoading from "@/components/overlay-loading/overlay-loading";
import AddExerciseSetPage from "@/pages/exercises/add-exercise-set";
import AddMealPlan from "@/pages/meals/add-meal-plan";
import AddMeal from "@/pages/meals/add-meal";
import AddIngredient from "@/pages/meals/add-ingredient";
import AddDish from "@/pages/meals/add-dish";
import AddSpecialist from "@/pages/specialist/add-specialist";
import ProtectedRoute from "./protected-route";
import AddChallengePage from "@/pages/challenges/add-challenge";
import Specialist from "@/pages/specialist";
import AddHealthPlan from "@/pages/challenges/add-health-plan";
import ExerciseDetail from "@/pages/exercises/detail";
import ExerciseSetDetail from "@/pages/exercises/set-detail";
import IngredientDetail from "@/pages/meals/ingredient-detail";
import DishDetail from "@/pages/meals/dish-detail";
import MealDetail from "@/pages/meals/meal-detail";
import SpecialistDetailPage from "@/pages/specialist/detail";
import ChallengeDetail from "@/pages/challenges/detail";
const ManageExercises = React.lazy(() => import("@/pages/exercises"));
const ManageMeals = React.lazy(() => import("@/pages/meals"));
const ManageChallenges = React.lazy(() => import("@/pages/challenges"));
const Community = React.lazy(() => import("@/pages/community"));
const Statistics = React.lazy(() => import("@/pages/statistics"));
const Settings = React.lazy(() => import("@/pages/settings"));

const withSuspense = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>
) => (
  <Suspense
    fallback={
      <div className="w-full h-full flex justify-center items-center">
        <OverlayLoading />
      </div>
    }
  >
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "/manage-exercises",
        children: [
          {
            index: true,
            element: withSuspense(ManageExercises),
          },
          {
            path: "/manage-exercises/add-exercise-plan",
            element: <AddExercisePlanPage />,
          },
          {
            path: "/manage-exercises/add-exercise",
            element: <AddExercisePage />,
          },
          {
            path: "/manage-exercises/add-exercise-set",
            element: <AddExerciseSetPage />,
          },
          {
            path: "/manage-exercises/exercises/:id",
            element: <ExerciseDetail />,
          },
          {
            path: "/manage-exercises/exercise-sets/:id",
            element: <ExerciseSetDetail />,
          },
        ],
      },
      {
        path: "/manage-meals",
        children: [
          {
            index: true,
            element: withSuspense(ManageMeals),
          },
          {
            path: "/manage-meals/add-meal-plan",
            element: <AddMealPlan />,
          },
          {
            path: "/manage-meals/add-meal",
            element: <AddMeal />,
          },
          {
            path: "/manage-meals/add-ingredient",
            element: <AddIngredient />,
          },
          {
            path: "/manage-meals/add-dish",
            element: <AddDish />,
          },
          {
            path: "/manage-meals/ingredients/:id",
            element: <IngredientDetail />,
          },
          {
            path: "/manage-meals/dishes/:id",
            element: <DishDetail />,
          },
          {
            path: "/manage-meals/meals/:id",
            element: <MealDetail />,
          },
        ],
      },
      {
        path: "/manage-challenges",
        children: [
          {
            index: true,
            element: withSuspense(ManageChallenges),
          },
          {
            path: "/manage-challenges/add-challenge",
            element: <AddChallengePage />,
          },
          {
            path: "/manage-challenges/add-health-plan",
            element: <AddHealthPlan />,
          },
          {
            path: "/manage-challenges/:id",
            element: <ChallengeDetail />,
          },
        ],
      },
      {
        path: "/manage-specialists",
        children: [
          {
            index: true,
            element: <Specialist />,
          },
          {
            path: "/manage-specialists/add-specialist",
            element: <AddSpecialist />,
          },
          {
            path: "/manage-specialists/:id",
            element: <SpecialistDetailPage />,
          },
        ],
      },
      {
        path: "/community",
        element: withSuspense(Community),
      },
      {
        path: "/statistics",
        element: withSuspense(Statistics),
      },
      {
        path: "/settings",
        element: withSuspense(Settings),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
