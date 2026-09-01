// Libraries
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// CSS
import "./index.css";

// Layouts
import AppLayout from "./layouts/app/AppLayout";

// Routes
import { authRoutes } from "./routes/auth/auth.route";
import { homeRoutes } from "./routes/home/home.route";

// Pages
import NotFoundPage from "./pages/general/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [authRoutes, homeRoutes],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);

export default function App() {
  const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "");

  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </>
  );
}
