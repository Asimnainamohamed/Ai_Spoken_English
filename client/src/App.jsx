import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DailyLessons from "./pages/DailyLessons.jsx";
import Login from "./pages/Login.jsx";
import Progress from "./pages/Progress.jsx";
import Roleplay from "./pages/Roleplay.jsx";
import Signup from "./pages/Signup.jsx";
import SpeakingPractice from "./pages/SpeakingPractice.jsx";
import TutorChat from "./pages/TutorChat.jsx";

function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="screen-loader">Loading your classroom...</div>;
  }

  return user ? <Outlet /> : <Navigate replace to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/tutor" element={<TutorChat />} />
              <Route path="/speaking" element={<SpeakingPractice />} />
              <Route path="/roleplay" element={<Roleplay />} />
              <Route path="/lessons" element={<DailyLessons />} />
              <Route path="/progress" element={<Progress />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

