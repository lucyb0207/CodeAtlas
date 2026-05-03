import { Routes, Route, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Analyze from "./pages/Analyze";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";

import ProtectedRoute from "./auth/ProtectedRoute";

export default function AppRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/signup";

      const isLoggedIn = !!data.session;

      if (isLoggedIn && isAuthPage) {
        navigate("/dashboard");
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/signup";

        if (session && isAuthPage) {
          navigate("/dashboard");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);
  return (
      <Routes>
        {/* public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}