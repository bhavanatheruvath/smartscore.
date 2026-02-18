import React, { useEffect, useState } from "react";
import axios from "axios";

function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]); // Store batches for dropdown
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Form State
  const [ktuId, setKtuId] = useState("");
  const [name, setName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(""); // Holds selected Batch ID

  // Upload State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Filter State - for viewing students by batch
  const [filterBatch, setFilterBatch] = useState("");

  // 1. Fetch Students AND Batches on Load
  useEffect(() => {
    fetchData();
  }, []);

  // 2. Set filterBatch when batches are loaded
  useEffect(() => {
    if (batches.length > 0 && !filterBatch) {
      setFilterBatch(batches[0].batch_id);
      setSelectedBatch(batches[0].batch_id);
    }
  }, [batches, filterBatch]);

  const fetchData = async () => {
    try {
      const [studentRes, batchRes] = await Promise.all([
        axios.get("http://localhost:8000/students"),
        axios.get("http://localhost:8000/batches"),
      ]);

      setStudents(studentRes.data);
      setBatches(batchRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // 2. Handle Adding a Student Manually
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/students", {
        ktu_id: ktuId,
        student_name: name,
        batch_id: selectedBatch,
      });
      setMessage("✅ Student Added!");
      setKtuId("");
      setName("");
      fetchData(); // Refresh list
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.detail || "Failed"));
    }
  };

  // 3. Handle Excel Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/upload-students",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setUploading(false);
      setMessage(
        `✅ Success! Added ${response.data.added} students. Errors: ${response.data.errors}`,
      );
      fetchData();
    } catch (error) {
      setUploading(false);
      setMessage(
        "❌ Upload Failed: " + (error.response?.data?.detail || error.message),
      );
    }
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px" }}>
      <h2>🎓 Student Management</h2>

      {/* --- ADD STUDENT FORM --- */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#1e3c72" }}>
          Add Single Student
        </h4>
        <form
          onSubmit={handleAddStudent}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="KTU ID (e.g., TVE21MCA001)"
            value={ktuId}
            onChange={(e) => setKtuId(e.target.value)}
            required
            style={{ padding: "8px", flex: 1 }}
          />

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: "8px", flex: 2 }}
          />

          {/* Batch Dropdown */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            style={{ padding: "8px", flex: 1 }}
          >
            {batches.length > 0 ? (
              batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_name} ({b.batch_id})
                </option>
              ))
            ) : (
              <option value="">No batches available</option>
            )}
          </select>

          <button
            type="submit"
            style={{
              background: "#1e3c72",
              color: "white",
              border: "none",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            Add +
          </button>
        </form>
      </div>

      {/* --- BULK UPLOAD SECTION --- */}
      <div
        style={{
          background: "#e3f2fd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "30px",
          border: "1px solid #bbdefb",
        }}
      >
        <h4 style={{ margin: "0 0 5px 0", color: "#1565c0" }}>
          📂 Bulk Upload (Excel)
        </h4>
        <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>
          Columns needed: <b>ktu_id</b>, <b>student_name</b>, <b>batch_id</b>{" "}
          (Must match an existing Batch ID!)
        </p>

        <form onSubmit={handleUpload} style={{ display: "flex", gap: "10px" }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".xlsx, .xls"
          />
          <button
            type="submit"
            disabled={uploading}
            style={{
              background: "#1565c0",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload Excel"}
          </button>
        </form>
        {message && (
          <p
            style={{ marginTop: "10px", fontWeight: "bold", fontSize: "13px" }}
          >
            {message}
          </p>
        )}
      </div>

      {/* --- BATCH FILTER SECTION --- */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#1e3c72" }}>
          View Students by Batch
        </h4>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontWeight: "bold", color: "#555" }}>
            Select Batch:
          </label>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          >
            {batches.length > 0 ? (
              batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_name} ({b.batch_id})
                </option>
              ))
            ) : (
              <option value="">No batches available</option>
            )}
          </select>
        </div>
      </div>

      {/* --- STUDENT LIST --- */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>KTU ID</th>
              <th style={{ padding: "10px" }}>Name</th>
              <th style={{ padding: "10px" }}>Batch</th>
            </tr>
          </thead>
          <tbody>
            {students.filter((s) => s.batch_id === filterBatch).length > 0 ? (
              students
                .filter((s) => s.batch_id === filterBatch)
                .map((s) => (
                  <tr key={s.ktu_id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {s.ktu_id}
                    </td>
                    <td style={{ padding: "10px" }}>{s.student_name}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          background: "#eee",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {s.batch_id}
                      </span>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  No students found in this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Students;
