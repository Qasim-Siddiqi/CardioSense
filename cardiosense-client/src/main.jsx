import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";        // Tailwind v4 styles
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/*
      AuthProvider must wrap App (and therefore BrowserRouter + all routes)
      so that useAuth() works everywhere — including inside ProtectedRoute.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
