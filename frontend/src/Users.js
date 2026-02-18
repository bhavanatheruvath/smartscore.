import React, { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 1. Fetch Faculty on Load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // 2. Handle Adding a User
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/users", {
        user_id: userId,
        username: username,
        password: password,
        role: "faculty", // This is redundant as backend handles it, but good for clarity
      });
      setMessage("✅ Faculty Added Successfully!");

      // Clear Form
      setUserId("");
      setUsername("");
      setPassword("");

      // Refresh List
      fetchUsers();
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.detail || "Failed"));
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        👤 Faculty Management
      </h2>

      {/* --- ADD USER FORM --- */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ margin: "0 0 15px 0", color: "#1e3c72" }}>
          Add New Faculty
        </h4>
        <form
          onSubmit={handleAddUser}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              User ID
            </label>
            <input
              type="text"
              placeholder="e.g. FAC001"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Deepa V"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Password
            </label>
            <input
              type="text"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "#1e3c72",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Faculty
          </button>
        </form>
        {message && (
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>
        )}
      </div>

      {/* --- USER LIST --- */}
      <h4 style={{ marginBottom: "15px" }}>Current Faculty List</h4>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#1e3c72",
                color: "white",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "12px", borderRadius: "6px 0 0 0" }}>
                User ID
              </th>
              <th style={{ padding: "12px", borderRadius: "0 6px 0 0" }}>
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.user_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    {u.user_id}
                  </td>
                  <td style={{ padding: "12px" }}>{u.username}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#777",
                  }}
                >
                  No faculty added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Users;
