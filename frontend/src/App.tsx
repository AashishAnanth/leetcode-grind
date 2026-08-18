import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/pages/Dashboard";
import { Problems } from "@/pages/Problems";
import { ProblemDetail } from "@/pages/ProblemDetail";
import { Calendar } from "@/pages/Calendar";
import { Vault } from "@/pages/Vault";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/problems", element: <Problems /> },
      { path: "/problems/:id", element: <ProblemDetail /> },
      { path: "/calendar", element: <Calendar /> },
      { path: "/vault", element: <Vault /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
