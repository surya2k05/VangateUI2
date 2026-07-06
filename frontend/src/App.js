import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import Login from "@/pages/Login";
import AppShell from "@/layout/AppShell";
import Overview from "@/pages/Overview";
import MultiMotor from "@/pages/MultiMotor";
import PlantHierarchy from "@/pages/PlantHierarchy";
import MaintenanceLog from "@/pages/MaintenanceLog";
import UserManagement from "@/pages/UserManagement";
import Grafana from "@/pages/Grafana";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <AppShell />
              </Protected>
            }
          >
            <Route index element={<Overview />} />
            <Route path="motors" element={<MultiMotor />} />
            <Route path="hierarchy" element={<PlantHierarchy />} />
            <Route path="maintenance" element={<MaintenanceLog />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="grafana" element={<Grafana />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-right" richColors />
    </AuthProvider>
  );
}
