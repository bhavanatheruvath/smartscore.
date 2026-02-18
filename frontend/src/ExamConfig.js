import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyDashboard.css";

const ExamConfig = () => {
  // --- 1. CONTEXT STATE ---
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [examDate, setExamDate] = useState("");
  const [seriesType, setSeriesType] = useState("Series 1");

  // --- 2. PATTERN STATE ---
  const [numQuestions, setNumQuestions] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [isGridGenerated, setIsGridGenerated] = useState(false);

  // --- 3. CHOICE RULES STATE (NEW) ---
  const [choiceRules, setChoiceRules] = useState([]);
  const [newRule, setNewRule] = useState({
    fromQ: "",
    toQ: "",
    solveCount: "",
  });

  // Fetch Dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchRes = await axios.get("http://localhost:8000/batches");
        const courseRes = await axios.get("http://localhost:8000/courses");
        setBatches(batchRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  // --- GENERATE THE GRID ---
  const handleGenerateGrid = () => {
    const newQuestions = [];
    for (let i = 1; i <= numQuestions; i++) {
      newQuestions.push({
        qNo: i,
        module: 1,
        hasSubQuestions: false,
        maxMarks: 5,
        subMarks: { a: 0, b: 0, c: 0, d: 0 },
      });
    }
    setQuestions(newQuestions);
    setIsGridGenerated(true);
  };

  // --- HANDLE QUESTION CHANGES ---
  const handleQuestionChange = (index, field, value) => {
    const updatedQs = [...questions];
    updatedQs[index][field] = value;
    setQuestions(updatedQs);
  };

  const handleSubMarkChange = (index, part, value) => {
    const updatedQs = [...questions];
    updatedQs[index].subMarks[part] = parseInt(value) || 0;
    const { a, b, c, d } = updatedQs[index].subMarks;
    updatedQs[index].maxMarks = a + b + c + d;
    setQuestions(updatedQs);
  };

  // --- ADD CHOICE RULE (NEW) ---
  const handleAddRule = () => {
    if (!newRule.fromQ || !newRule.toQ || !newRule.solveCount) {
      alert("Please fill all rule fields");
      return;
    }
    const rule = {
      id: Date.now(),
      fromQ: parseInt(newRule.fromQ),
      toQ: parseInt(newRule.toQ),
      solveCount: parseInt(newRule.solveCount),
    };
    setChoiceRules([...choiceRules, rule]);
    setNewRule({ fromQ: "", toQ: "", solveCount: "" }); // Reset inputs
  };

  const deleteRule = (id) => {
    setChoiceRules(choiceRules.filter((r) => r.id !== id));
  };

  // --- CALCULATE TOTAL (Including Choice Logic) ---
  // Considers choice rules: if Q6-9 are "Answer Best 2", only 2*marks are counted
  const calculateEstimatedTotal = () => {
    let rawTotal = 0;

    questions.forEach((q) => {
      // Check if this question falls within any choice rule
      const applicableRule = choiceRules.find(
        (rule) => q.qNo >= rule.fromQ && q.qNo <= rule.toQ,
      );

      if (applicableRule) {
        // Count this question's marks only if it's among the "best" ones to be answered
        const questionsInRange = questions.filter(
          (qst) =>
            qst.qNo >= applicableRule.fromQ && qst.qNo <= applicableRule.toQ,
        );
        const totalQuestionsInRange = questionsInRange.length;
        const solveCount = applicableRule.solveCount;

        // Contribution = (solveCount / totalQuestionsInRange) * marksPerQuestion
        const contribution =
          (solveCount / totalQuestionsInRange) * (parseInt(q.maxMarks) || 0);
        rawTotal += contribution;
      } else {
        // No choice rule, add full marks
        rawTotal += parseInt(q.maxMarks) || 0;
      }
    });

    return Math.round(rawTotal * 100) / 100; // Round to 2 decimals
  };

  // --- SAVE & START ---
  const handleStartSession = async () => {
    if (!selectedBatch || !selectedCourse || !examDate) {
      alert("Please fill in all context fields.");
      return;
    }

    const payload = {
      course_code: selectedCourse,
      date: examDate,
      series_type: seriesType,
      pattern_config: {
        target_batch_id: selectedBatch,
        total_questions: numQuestions,
        questions: questions,
        choice_rules: choiceRules, // <--- Sending Rules to Backend
      },
    };

    try {
      const response = await axios.post("http://localhost:8000/exams", payload);
      window.location.href = `/digitization/workspace/${response.data.exam_id}`;
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("Failed to start session.");
    }
  };

  return (
    <div className="faculty-container">
      <nav className="faculty-nav">
        <div className="nav-brand">SmartScore Configuration</div>
        <button
          onClick={() => (window.location.href = "/")}
          className="logout-link"
        >
          Cancel
        </button>
      </nav>

      <div className="faculty-content">
        <header className="profile-header">
          <div className="profile-info">
            <h1>⚙️ Configure New Exam</h1>
            <p>Define structure and choice rules.</p>
          </div>
        </header>

        <div className="table-container" style={{ padding: "30px" }}>
          {/* --- SECTION 1: CONTEXT --- */}
          <div
            className="form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div>
              <label>
                <strong>Batch</strong>
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">-- Select --</option>
                {batches.map((b) => (
                  <option key={b.batch_id} value={b.batch_id}>
                    {b.batch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>
                <strong>Course</strong>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">-- Select --</option>
                {courses.map((c) => (
                  <option key={c.course_code} value={c.course_code}>
                    {c.course_code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>
                <strong>Date</strong>
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div>
              <label>
                <strong>Series</strong>
              </label>
              <select
                value={seriesType}
                onChange={(e) => setSeriesType(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option>Series 1</option>
                <option>Series 2</option>
              </select>
            </div>
          </div>

          <hr />

          {/* --- SECTION 2: PATTERN GENERATOR --- */}
          <div
            style={{
              margin: "20px 0",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div>
              <label>
                <strong>Total Questions:</strong>
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "8px",
                  width: "80px",
                  textAlign: "center",
                }}
              />
            </div>
            <button
              className="new-session-btn"
              onClick={handleGenerateGrid}
              style={{ padding: "8px 15px", fontSize: "14px" }}
            >
              Generate Grid
            </button>
            <div
              style={{
                marginLeft: "auto",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#7f8c8d",
              }}
            >
              Raw Total: {isGridGenerated ? calculateEstimatedTotal() : 0}
            </div>
          </div>

          {/* --- SECTION 3: THE GRID --- */}
          {isGridGenerated && (
            <div
              style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #ddd",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#e9ecef", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Q.No</th>
                    <th style={{ padding: "10px" }}>Module</th>
                    <th style={{ padding: "10px" }}>Sub-parts?</th>
                    <th style={{ padding: "10px" }}>Max Marks</th>
                    <th style={{ padding: "10px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr
                      key={q.qNo}
                      style={{
                        borderBottom: "1px solid #ddd",
                        background: "white",
                      }}
                    >
                      <td style={{ padding: "10px", fontWeight: "bold" }}>
                        {q.qNo}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <input
                          type="number"
                          value={q.module}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "module",
                              e.target.value,
                            )
                          }
                          style={{ width: "50px", padding: "5px" }}
                        />
                      </td>
                      <td style={{ padding: "10px" }}>
                        <input
                          type="checkbox"
                          checked={q.hasSubQuestions}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "hasSubQuestions",
                              e.target.checked,
                            )
                          }
                          style={{ transform: "scale(1.5)" }}
                        />
                      </td>
                      <td style={{ padding: "10px" }}>
                        {q.hasSubQuestions ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "5px",
                              alignItems: "center",
                            }}
                          >
                            {["a", "b", "c", "d"].map((part) => (
                              <input
                                key={part}
                                type="number"
                                placeholder={part}
                                className="sub-input"
                                onChange={(e) =>
                                  handleSubMarkChange(
                                    index,
                                    part,
                                    e.target.value,
                                  )
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <input
                            type="number"
                            placeholder="Max"
                            value={q.maxMarks}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "maxMarks",
                                e.target.value,
                              )
                            }
                            style={{ width: "60px", padding: "5px" }}
                          />
                        )}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {q.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- SECTION 4: CHOICE RULES (NEW!) --- */}
          {isGridGenerated && (
            <div
              style={{
                marginTop: "30px",
                background: "#fff3cd",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #ffeeba",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "18px",
                  color: "#856404",
                }}
              >
                📋 Define Choice Rules
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#856404",
                  marginBottom: "15px",
                }}
              >
                Example: "Answer 2 from Question 6 to 9"
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <span>From Q</span>
                <input
                  type="number"
                  value={newRule.fromQ}
                  onChange={(e) =>
                    setNewRule({ ...newRule, fromQ: e.target.value })
                  }
                  style={{ width: "60px", padding: "8px" }}
                />
                <span>to Q</span>
                <input
                  type="number"
                  value={newRule.toQ}
                  onChange={(e) =>
                    setNewRule({ ...newRule, toQ: e.target.value })
                  }
                  style={{ width: "60px", padding: "8px" }}
                />
                <span>→ Answer Best</span>
                <input
                  type="number"
                  value={newRule.solveCount}
                  onChange={(e) =>
                    setNewRule({ ...newRule, solveCount: e.target.value })
                  }
                  style={{ width: "60px", padding: "8px" }}
                />
                <button
                  onClick={handleAddRule}
                  style={{
                    background: "#856404",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  + Add Rule
                </button>
              </div>

              {/* Rules List */}
              {choiceRules.length > 0 && (
                <div
                  style={{
                    background: "white",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {choiceRules.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span>
                        Questions{" "}
                        <strong>
                          {r.fromQ} to {r.toQ}
                        </strong>
                        : Answer Best <strong>{r.solveCount}</strong>
                      </span>
                      <button
                        onClick={() => deleteRule(r.id)}
                        style={{
                          color: "red",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "30px", textAlign: "right" }}>
            <button
              className="new-session-btn"
              onClick={handleStartSession}
              disabled={!isGridGenerated}
              style={{ opacity: isGridGenerated ? 1 : 0.5 }}
            >
              🚀 Save & Start Digitization
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .sub-input { width: 35px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; text-align: center; margin-right: 2px; }
        .sub-input:focus { border-color: #667eea; outline: none; }
      `}</style>
    </div>
  );
};

export default ExamConfig;
