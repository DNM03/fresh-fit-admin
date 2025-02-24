import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/login";
import MainLayout from "@/components/layout/main-layout";
import DashboardPage from "@/pages/dashboard";
import ManageExercises from "@/pages/exercises";

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
        element: <ManageExercises />,
      },
      {
        path: "/manage-meals",
        element: <div>Manage meals</div>,
      },
      {
        path: "/manage-challenges",
        element: <div>Manage challenges</div>,
      },
      {
        path: "/community",
        element: <div>Community</div>,
      },
      {
        path: "/statistics",
        element: <div>Statistics</div>,
      },
      {
        path: "/settings",
        element: <div>Settingss</div>,
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
