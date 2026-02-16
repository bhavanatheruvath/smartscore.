import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 

// NOTICE: We added "{ onLoginSuccess }" inside the brackets below.
// This is how the Parent passes the "Switch Screen" function to this Child.
function Login({ onLoginSuccess }) {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Send data to Backend
      const response = await axios.post('http://localhost:8000/login', {
        username: username,
        password: password
      });

      // 2. If successful, stop loading
      setLoading(false);
      setMessage(`✅ Welcome back, ${response.data.username}!`);
      
      // 3. THIS IS THE NEW PART
      // We call the function the Parent gave us. 
      // This tells App.js: "Login worked! Show the Dashboard now!"
      if (onLoginSuccess) {
        onLoginSuccess(); 
      }
      
    } catch (error) {
      setLoading(false);
      if (error.response) {
         setMessage(`❌ ${error.response.data.detail}`);
      } else {
         setMessage('❌ Server is offline. Please try again.');
      }
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
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        {message && <p className="error-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Login;