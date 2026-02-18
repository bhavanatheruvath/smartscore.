import React, { useState, useEffect } from "react";

// Flat imports (everything in src)
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import FacultyDashboard from "./FacultyDashboard";
import ExamConfig from "./ExamConfig";
import DigitizationWorkspace from "./DigitizationWorkspace";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(window.location.pathname);

  // Check login status on app load
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
    setLoading(false);

    // Listen for URL changes
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLoginSuccess = (role) => {
    localStorage.setItem("role", role);
    setUserRole(role);
    window.history.pushState(null, "", "/");
    setCurrentPage("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setUserRole(null);
    window.history.pushState(null, "", "/");
    setCurrentPage("/");
  };

  if (loading) return <div>Loading...</div>;

  // Simple conditional rendering without react-router-dom
  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Faculty routes
  if (userRole === "faculty") {
    if (currentPage === "/digitization/setup") {
      return (
        <ExamConfig
          onBack={() => {
            window.history.pushState(null, "", "/faculty-dashboard");
            setCurrentPage("/faculty-dashboard");
          }}
        />
      );
    }

    // Check for workspace route: /digitization/workspace/{examId}
    const workspaceMatch = currentPage.match(
      /^\/digitization\/workspace\/(.+)$/,
    );
    if (workspaceMatch) {
      const examId = workspaceMatch[1];
      return (
        <DigitizationWorkspace
          examId={examId}
          onBack={() => {
            window.history.pushState(null, "", "/faculty-dashboard");
            setCurrentPage("/faculty-dashboard");
          }}
        />
      );
    }

    return <FacultyDashboard />;
  }

  // Admin route
  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div>
      <h1>Unknown role. Please logout and login again.</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
