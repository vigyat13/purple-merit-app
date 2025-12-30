import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const Profile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '' // Optional: Only send if changing
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/user/profile');
      setFormData({ 
        full_name: data.full_name, 
        email: data.email, 
        password: '' 
      });
    } catch (error) {
      console.error("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // 1. Send update to Backend
      const { data } = await API.put('/user/profile', formData);
      
      // 2. CRITICAL FIX: Update Local Storage with new name!
      // This ensures Dashboard sees the change immediately.
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Optional: clear password field after save
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Update failed' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="d-flex align-items-center mb-4">
            <button className="btn btn-outline-secondary me-3" onClick={() => window.location.href='/dashboard'}>
                ← Back
            </button>
            <h2 className="mb-0">My Profile</h2>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">New Password (Optional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;