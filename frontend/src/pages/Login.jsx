import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', formData);
      
      // 1. Save Token & User Info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 2. Redirect to Dashboard
      navigate('/dashboard'); 
      window.location.reload(); // Optional: Ensures states update cleanly
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Welcome Back</h2>
          <p className="text-muted">Please login to your account</p>
        </div>

        {error && <div className="alert alert-danger text-center p-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-control form-control-lg" 
              placeholder="name@example.com"
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-control form-control-lg" 
              placeholder="••••••••"
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
            Sign In
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Don't have an account? <a href="/signup" className="text-decoration-none fw-bold">Sign up here</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;