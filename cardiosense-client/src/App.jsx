import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Login            from "./pages/Login";
import Register         from "./pages/Register";
import HealthForm       from "./pages/HealthForm";
import ResultPage       from "./pages/ResultPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard  from "./pages/DoctorDashboard";


function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

// Auth guard 

function ProtectedRoute({ role: requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to their correct dashboard
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "Doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />;
  }

  return <Outlet />;
}

// App 

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes — no Navbar */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — all get Navbar via ProtectedLayout.
            Nesting order: ProtectedLayout (adds Navbar)
                            └── ProtectedRoute (checks role)
                                 └── actual page                        */}
        <Route element={<ProtectedLayout />}>

          <Route element={<ProtectedRoute role="Patient" />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/form"              element={<HealthForm />} />
            <Route path="/result"            element={<ResultPage />} />
            <Route path="/result/:id"        element={<ResultPage />} />
          </Route>


          <Route element={<ProtectedRoute role="Doctor" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          </Route>

        </Route>

        {/* Root redirect — send to correct dashboard if logged in */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={role === "Doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
