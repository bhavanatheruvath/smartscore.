import React, { useState } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';

function App() {
  // This state controls which screen is shown
  // false = Show Login
  // true = Show Dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn ? (
        // IF logged in, show Dashboard
        <AdminDashboard />
      ) : (
        // ELSE show Login
        // We pass a function "() => setIsLoggedIn(true)" to the Login component
        // This function is what gets called as "onLoginSuccess" in the file above
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;