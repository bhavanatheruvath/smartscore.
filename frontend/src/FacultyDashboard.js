import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const [facultyName, setFacultyName] = useState("Faculty");

  // Fetch faculty details from backend on load
  useEffect(() => {
    const fetchFacultyDetails = async () => {
      const username = localStorage.getItem("username");

      if (username) {
        try {
          const response = await axios.get(
            `http://localhost:8000/users/${username}`,
          );
          setFacultyName(response.data.username || username);
        } catch (error) {
          console.error("Error fetching faculty details:", error);
          setFacultyName(username);
        }
      }
    };

    fetchFacultyDetails();
  }, []);

  // Placeholder data - eventually this will come from an API call
  const [recentSessions] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const startNewSession = () => {
    // Navigate to the "Setup" page
    window.location.href = "/digitization/setup";
  };

  const handleResumeSession = (sessionId) => {
    // Navigate to the specific workspace
    window.location.href = `/digitization/workspace/${sessionId}`;
  };

  return (
    <div className="faculty-container">
      {/* --- Top Navigation Bar --- */}
      <nav className="faculty-nav">
        <div className="nav-brand">SmartScore Faculty</div>
        <button onClick={handleLogout} className="logout-link">
          Logout
        </button>
      </nav>

      <div className="faculty-content">
        {/* --- Profile Section --- */}
        <header className="profile-header">
          <div className="profile-info">
            <h1>Welcome back, {facultyName}</h1>
            <p>Department of Computer Applications</p>
          </div>
          <button className="new-session-btn" onClick={startNewSession}>
            + Start New Evaluation
          </button>
        </header>

        {/* --- Recent Activity / Pending Works --- */}
        <section className="sessions-list">
          <h2>Your Evaluation Sessions</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Subject</th>
                  <th>Date Started</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.batch}</td>
                    <td>{session.subject}</td>
                    <td>{session.date}</td>
                    <td>{session.progress} Scanned</td>
                    <td>
                      <span
                        className={`status-badge ${session.status.toLowerCase()}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="resume-btn"
                        onClick={() => handleResumeSession(session.id)}
                      >
                        {session.status === "Completed" ? "View" : "Resume"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FacultyDashboard;
