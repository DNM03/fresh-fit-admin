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
    element: <MainLayout />,
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
        ],
      },
      {
        path: "/manage-meals",
        element: withSuspense(ManageMeals),
      },
      {
        path: "/manage-challenges",
        element: withSuspense(ManageChallenges),
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
