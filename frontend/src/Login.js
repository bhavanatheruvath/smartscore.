import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

// NOTICE: We added "{ onLoginSuccess }" inside the brackets below.
// This is how the Parent passes the "Switch Screen" function to this Child.
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ... existing imports

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // Calling your FastAPI backend
      const response = await axios.post("http://localhost:8000/login", {
        username: username,
        password: password,
      });

      // Store token and role
      localStorage.setItem("token", response.data.username);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("username", response.data.username);

      // Call the function passed from App.js with the role
      onLoginSuccess(response.data.role);
    } catch (err) {
      setMessage("❌ Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">SmartScore Admin</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        {message && <p className="error-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
