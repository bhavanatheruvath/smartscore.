import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // 1. We make the request here
      const response = await axios.get('http://localhost:8000/courses');
      
      // 2. The variable 'response' ONLY exists inside this 'try' block
      console.log("API Response:", response.data); 
      setCourses(response.data);
      setLoading(false);

    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📚 Course Management</h2>
      
      {loading && <p>Loading courses...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Code</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Course Name</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Department</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.course_code} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e3c72' }}>{course.course_code}</td>
                  <td style={{ padding: '12px' }}>{course.course_name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#e3f2fd', color: '#1e88e5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {course.department}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Courses;