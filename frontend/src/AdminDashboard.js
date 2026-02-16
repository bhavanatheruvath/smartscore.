import React, { useState } from "react";
import "./AdminDashboard.css";
import Courses from "./Courses";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // Simple logout function
  const handleLogout = () => {
    window.location.href = "/"; // Reloads page and goes to Login
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h2>SmartScore</h2>

        <div
          className={`menu-item ${activeTab === "Overview" ? "active" : ""}`}
          onClick={() => setActiveTab("Overview")}
        >
          📊 Overview
        </div>
        <div
          className={`menu-item ${activeTab === "Courses" ? "active" : ""}`}
          onClick={() => setActiveTab("Courses")}
        >
          📚 Manage Courses
        </div>

        <div
          className={`menu-item ${activeTab === "Exams" ? "active" : ""}`}
          onClick={() => setActiveTab("Exams")}
        >
          📝 Exam Config
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="header">
          <h1>Welcome, Admin</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Dynamic Content Based on Tab */}
        {activeTab === "Overview" && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Active Courses</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Pending Exams</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>System Status</h3>
              <p style={{ color: "green" }}>Active</p>
            </div>
          </div>
        )}

        {activeTab === "Students" && (
          <div className="stat-card">
            <h2>Student Management</h2>
            <p>Here you will see the table of students later.</p>
          </div>
        )}

        {/* You can add more sections here later */}

        {activeTab === "Courses" && <Courses />}
      </div>
    </div>
  );
}

export default AdminDashboard;

// hfbb