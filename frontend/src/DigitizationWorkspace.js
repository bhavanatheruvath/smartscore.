import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyDashboard.css";

const DigitizationWorkspace = ({ examId, onBack }) => {
  // --- STATE ---
  const [examConfig, setExamConfig] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workspace State
  const [scannedImage, setScannedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Current Answer Sheet Data
  const [currentData, setCurrentData] = useState({
    rollNo: "", // The suffix (e.g., "23")
    marks: {}, // Format: { "1": 5, "2_a": 3, "2_b": 2 }
  });

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch Exam Config
        const examRes = await axios.get(
          `http://localhost:8000/exams/${examId}`,
        );
        const config = examRes.data.pattern_config;
        setExamConfig(config);

        // B. Fetch Students for this Batch
        if (config && config.target_batch_id) {
          const studentRes = await axios.get(
            `http://localhost:8000/batches/${config.target_batch_id}/students`,
          );
          // Add 'status' flags for UI
          const studentsWithStatus = studentRes.data.map((s) => ({
            ...s,
            status: "Pending",
            total: 0,
          }));
          setStudents(studentsWithStatus);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading workspace:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  // --- 2. SIMULATE OCR SCAN ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScannedImage(URL.createObjectURL(file));
      setIsProcessing(true);

      // SIMULATE PYTHON BACKEND PROCESSING TIME
      setTimeout(() => {
        setIsProcessing(false);

        // --- MOCK OCR LOGIC ---
        // 1. Detect Random Roll No (from pending students)
        const pendingStudents = students.filter((s) => s.status === "Pending");
        const randomStudent =
          pendingStudents.length > 0
            ? pendingStudents[0] // Pick the first pending student
            : { ktu_id: "Unknown" };

        // Extract suffix (e.g. TKM24MCA023 -> "23")
        const detectedRoll = randomStudent.ktu_id.slice(-3).replace(/\D/g, "");

        // 2. Generate Random Marks based on Pattern
        const mockMarks = {};
        if (examConfig && examConfig.questions) {
          examConfig.questions.forEach((q) => {
            if (q.hasSubQuestions) {
              // Generate marks for a,b,c...
              ["a", "b", "c", "d"].forEach((part) => {
                if (q.subMarks[part] > 0) {
                  mockMarks[`${q.qNo}_${part}`] = Math.floor(
                    Math.random() * (q.subMarks[part] + 1),
                  );
                }
              });
            } else {
              mockMarks[q.qNo] = Math.floor(Math.random() * (q.maxMarks + 1));
            }
          });
        }

        setCurrentData({
          rollNo: detectedRoll,
          marks: mockMarks,
        });
      }, 1500); // 1.5 second delay
    }
  };

  // --- 3. HANDLE MARK INPUT ---
  const handleMarkChange = (key, value) => {
    setCurrentData((prev) => ({
      ...prev,
      marks: { ...prev.marks, [key]: parseInt(value) || 0 },
    }));
  };

  // --- 4. SAVE DATA ---
  const handleSave = () => {
    // 1. Find Student by Suffix
    // Strategy: Look for student whose ID ends with the detected number
    const studentIndex = students.findIndex((s) =>
      s.ktu_id.endsWith(currentData.rollNo),
    );

    if (studentIndex === -1) {
      alert(
        `Student with Roll No suffix "${currentData.rollNo}" not found in this batch!`,
      );
      return;
    }

    // 2. Calculate Total (Simple Sum for Verification)
    const totalScore = Object.values(currentData.marks).reduce(
      (a, b) => a + b,
      0,
    );

    // 3. Update State
    const updatedStudents = [...students];
    updatedStudents[studentIndex].status = "Done";
    updatedStudents[studentIndex].total = totalScore;
    setStudents(updatedStudents);

    // 4. Reset for Next Scan
    setScannedImage(null);
    setCurrentData({ rollNo: "", marks: {} });
  };

  // --- RENDER HELPERS ---
  if (loading)
    return (
      <div className="loading-screen">⏳ Loading Exam Configuration...</div>
    );
  if (!examConfig)
    return (
      <div className="error-screen">❌ Error: Could not load exam config.</div>
    );

  return (
    <div className="workspace-container">
      {/* --- TOP BAR --- */}
      <div className="workspace-header">
        <div className="header-left">
          <h3>Digitization Workspace</h3>
          <span className="batch-tag">{examConfig.target_batch_id}</span>
        </div>
        <div className="header-right">
          <button onClick={onBack} className="exit-btn">
            Exit Session
          </button>
        </div>
      </div>

      <div className="split-screen">
        {/* --- LEFT PANEL: SCAN & VERIFY --- */}
        <div className="left-panel">
          {/* A. Upload Area */}
          {!scannedImage ? (
            <div className="upload-zone">
              <input
                type="file"
                id="scanInput"
                hidden
                onChange={handleFileUpload}
              />
              <label htmlFor="scanInput" className="upload-label">
                <div className="icon">📷</div>
                <span>Upload Answer Sheet</span>
                <small>Simulates Scanning Process</small>
              </label>
            </div>
          ) : (
            <div className="preview-zone">
              <div className="image-wrapper">
                <img src={scannedImage} alt="Scanned Sheet" />
                {isProcessing && (
                  <div className="processing-overlay">⚡ AI Processing...</div>
                )}
              </div>
            </div>
          )}

          {/* B. Verification Form (Only shows after scan) */}
          {scannedImage && !isProcessing && (
            <div className="verification-form">
              <div className="form-header">
                <div className="input-group">
                  <label>Roll No (Suffix)</label>
                  <input
                    type="text"
                    className="roll-input"
                    value={currentData.rollNo}
                    onChange={(e) =>
                      setCurrentData({ ...currentData, rollNo: e.target.value })
                    }
                    autoFocus
                  />
                </div>
                <div className="total-display">
                  Total:{" "}
                  <strong>
                    {Object.values(currentData.marks).reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </strong>
                </div>
              </div>

              <div className="marks-grid">
                {examConfig.questions.map((q) => (
                  <div key={q.qNo} className="question-box">
                    <div className="q-label">Q{q.qNo}</div>
                    {q.hasSubQuestions ? (
                      <div className="sub-inputs">
                        {["a", "b", "c", "d"].map(
                          (part) =>
                            q.subMarks[part] > 0 && (
                              <input
                                key={part}
                                type="number"
                                placeholder={part}
                                value={
                                  currentData.marks[`${q.qNo}_${part}`] || ""
                                }
                                onChange={(e) =>
                                  handleMarkChange(
                                    `${q.qNo}_${part}`,
                                    e.target.value,
                                  )
                                }
                              />
                            ),
                        )}
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="main-input"
                        value={currentData.marks[q.qNo] || ""}
                        onChange={(e) =>
                          handleMarkChange(q.qNo, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <button className="save-btn" onClick={handleSave}>
                ✅ Verify & Save (Next)
              </button>
              <button
                className="retake-btn"
                onClick={() => setScannedImage(null)}
              >
                ❌ Retake
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT PANEL: STUDENT LIST --- */}
        <div className="right-panel">
          <div className="list-header">
            <h4>Batch Status</h4>
            <span>
              {students.filter((s) => s.status === "Done").length} /{" "}
              {students.length} Completed
            </span>
          </div>
          <div className="student-list">
            {students.map((s) => (
              <div
                key={s.ktu_id}
                className={`student-item ${s.status.toLowerCase()}`}
              >
                <div className="s-info">
                  <div className="s-name">{s.student_name}</div>
                  <div className="s-id">{s.ktu_id}</div>
                </div>
                <div className="s-status">
                  {s.status === "Done" ? (
                    <span className="score-badge">{s.total}</span>
                  ) : (
                    <span className="pending-dot">●</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- INLINE STYLES FOR WORKSPACE --- */}
      <style>{`
        .workspace-container { height: 100vh; display: flex; flex-direction: column; background: #f0f2f5; }
        .workspace-header { height: 60px; background: white; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .batch-tag { background: #e1ecf4; color: #2c3e50; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; font-weight: bold; }
        .exit-btn { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }

        .split-screen { display: flex; flex: 1; overflow: hidden; }
        
        /* LEFT PANEL */
        .left-panel { flex: 2; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; }
        .upload-zone { border: 3px dashed #cbd5e0; border-radius: 12px; height: 300px; display: flex; align-items: center; justify-content: center; background: white; }
        .upload-label { cursor: pointer; text-align: center; color: #7f8c8d; }
        .upload-label .icon { font-size: 40px; display: block; margin-bottom: 10px; }
        
        .preview-zone { text-align: center; margin-bottom: 20px; }
        .image-wrapper { position: relative; display: inline-block; max-width: 100%; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .image-wrapper img { max-height: 300px; border-radius: 8px; }
        .processing-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; border-radius: 8px; }

        .verification-form { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .form-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }
        .roll-input { font-size: 24px; font-weight: bold; width: 100px; padding: 5px; border: 2px solid #3498db; border-radius: 6px; text-align: center; }
        .total-display { font-size: 18px; color: #27ae60; }

        .marks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .question-box { background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #eee; }
        .q-label { font-size: 12px; color: #7f8c8d; font-weight: bold; margin-bottom: 5px; }
        .main-input { width: 100%; padding: 5px; text-align: center; font-weight: bold; border: 1px solid #ddd; border-radius: 4px; }
        .sub-inputs { display: flex; gap: 3px; justify-content: center; }
        .sub-inputs input { width: 30px; padding: 2px; text-align: center; border: 1px solid #ddd; font-size: 12px; }

        .save-btn { width: 100%; background: #27ae60; color: white; padding: 15px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px; }
        .retake-btn { width: 100%; background: white; color: #e74c3c; border: 1px solid #e74c3c; padding: 10px; border-radius: 6px; cursor: pointer; }

        /* RIGHT PANEL */
        .right-panel { flex: 1; background: white; border-left: 1px solid #ddd; display: flex; flex-direction: column; }
        .list-header { padding: 15px; border-bottom: 1px solid #eee; background: #fafbfc; display: flex; justify-content: space-between; align-items: center; }
        .student-list { overflow-y: auto; flex: 1; }
        .student-item { padding: 12px 15px; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center; }
        .student-item.done { background: #f0fff4; border-left: 4px solid #27ae60; }
        .student-item.pending { border-left: 4px solid #f1c40f; }
        .s-name { font-weight: 600; font-size: 14px; color: #2c3e50; }
        .s-id { font-size: 12px; color: #95a5a6; }
        .score-badge { background: #27ae60; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold; }
        .pending-dot { color: #f1c40f; font-size: 10px; }
      `}</style>
    </div>
  );
};

export default DigitizationWorkspace;
