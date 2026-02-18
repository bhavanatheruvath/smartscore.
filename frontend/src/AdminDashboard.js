import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import Courses from "./Courses";
import Batches from "./Batches";
import Students from "./Students";
import Users from "./Users";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalUsers: 0,
    systemStatus: "Active",
  });

  // Fetch stats on component load
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, coursesRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8000/students"),
        axios.get("http://localhost:8000/courses"),
        axios.get("http://localhost:8000/users"),
      ]);

      setStats({
        totalStudents: studentsRes.data.length,
        totalCourses: coursesRes.data.length,
        totalUsers: usersRes.data.length,
        systemStatus: "Active",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Simple logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/";
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
          className={`menu-item ${activeTab === "Users" ? "active" : ""}`}
          onClick={() => setActiveTab("Users")}
        >
          👤 Manage Users
        </div>
        {}
        <div
          className={`menu-item ${activeTab === "Batches" ? "active" : ""}`}
          onClick={() => setActiveTab("Batches")}
        >
          📅 Manage Batches
        </div>
        <div
          className={`menu-item ${activeTab === "Students" ? "active" : ""}`}
          onClick={() => setActiveTab("Students")}
        >
          🎓 Manage Students
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
              <p>{stats.totalStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Total Courses</h3>
              <p>{stats.totalCourses}</p>
            </div>
            <div className="stat-card">
              <h3>Total Batches</h3>
              <p>{stats.totalBatches}</p>
            </div>
            <div className="stat-card">
              <h3>System Status</h3>
              <p style={{ color: "green" }}>{stats.systemStatus}</p>
            </div>
          </div>
        )}

        {activeTab === "Students" && <Students />}
        {activeTab === "Users" && <Users />}

        {/* You can add more sections here later */}

        {activeTab === "Courses" && <Courses />}

        {activeTab === "Batches" && <Batches />}
      </div>
    </div>
  );
}

export default AdminDashboard;
