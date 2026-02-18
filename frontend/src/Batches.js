import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [semester, setSemester] = useState(1);
  const [message, setMessage] = useState('');

  // 1. Fetch Batches on Load
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('http://localhost:8000/batches');
      setBatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // 2. Handle Adding a Batch
  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/batches', {
        batch_id: batchId,
        batch_name: batchName,
        current_semester: semester
      });
      setMessage("✅ Batch Created Successfully!");
      
      // Clear Form
      setBatchId('');
      setBatchName('');
      setSemester(1);
      
      // Refresh List
      fetchBatches();
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.detail || "Failed"));
    }
  };
  // --- HANDLE UPGRADE SEMESTER ---
  const handleUpgrade = async (batchId, currentSem) => {
    // 1. Confirm with the user first (Safety check)
    if (!window.confirm(`Are you sure you want to promote Batch ${batchId} to Semester ${currentSem + 1}?`)) {
      return;
    }

    try {
      await axios.put(`http://localhost:8000/batches/${batchId}/upgrade`);
      setMessage(`✅ Batch ${batchId} Promoted Successfully!`);
      fetchBatches(); // Refresh the list to see the change
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.detail || "Failed"));
    }
  };
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📅 Batch Management</h2>

      {/* --- ADD BATCH FORM --- */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1e3c72' }}>Add New Batch</h4>
        <form onSubmit={handleAddBatch} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Batch ID</label>
            <input 
              type="text" 
              placeholder="e.g. B24-26" 
              value={batchId} 
              onChange={(e) => setBatchId(e.target.value)}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Batch Name</label>
            <input 
              type="text" 
              placeholder="e.g. 2024-2026 MCA Batch" 
              value={batchName} 
              onChange={(e) => setBatchName(e.target.value)}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Semester</label>
            <input 
              type="number" 
              min="1" max="8"
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" style={{ background: '#1e3c72', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Create Batch
          </button>
        </form>
        {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
      </div>

      {/* --- BATCH LIST --- */}
      <h4 style={{ marginBottom: '15px' }}>Existing Batches</h4>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e3c72', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderRadius: '6px 0 0 0' }}>Batch ID</th>
              <th style={{ padding: '12px' }}>Batch Name</th>
              <th style={{ padding: '12px', borderRadius: '0 6px 0 0' }}>Current Semester</th>
            </tr>
          </thead>
          <tbody>
            {batches.length > 0 ? (
              batches.map((b) => (
                <tr key={b.batch_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#555' }}>{b.batch_id}</td>
                  <td style={{ padding: '12px' }}>{b.batch_name}</td>
                  <td style={{ padding: '12px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {/* The Badge */}
    <span style={{ background: '#e0f7fa', color: '#006064', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
      S{b.current_semester}
    </span>

    {/* The Upgrade Button */}
    <button 
      onClick={() => handleUpgrade(b.batch_id, b.current_semester)}
      style={{ 
        background: '#4caf50', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        padding: '5px 10px', 
        cursor: 'pointer', 
        fontSize: '11px' 
      }}
      title="Promote to Next Semester"
    >
      ⬆ Promote
    </button>
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No batches found. Create one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Batches;